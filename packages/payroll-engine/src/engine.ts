/**
 * Moteur de calcul de paie — Côte d'Ivoire 2026
 *
 * Pipeline :
 * 1. Prorata du salaire de base (jours travaillés / jours ouvrés)
 * 2. Prime d'ancienneté CCI Art. 31
 * 3. Heures supplémentaires CCI Art. 24
 * 4. Indemnités (split exonéré / imposable)
 * 5. Primes diverses
 * 6. Brut total = base + ancienneté + HS + indemnités + primes
 * 7. Brut social (assiette cotisations) = brut total - indemnités exonérées
 * 8. Brut fiscal (assiette impôts) = brut total - indemnités exonérées
 * 9. Cotisations salarié (CNPS retraite + CMU)
 * 10. Impôts (ITS + IGR + CN) sur brut fiscal annuel - abattement 15 %
 * 11. Net imposable = brut fiscal - cotisations salarié
 * 12. Net avant retenues = net imposable - impôts
 * 13. Application quotité saisissable sur retenues
 * 14. Net à payer
 * 15. Cotisations employeur (charges patronales)
 * 16. Coût total employeur
 */

import {
  computeCNPSRetraite,
  computeCNPSPrestationsFamiliales,
  computeCNPSMaternite,
  computeCNPSAT,
  computeFDFP,
  CMU_FORFAIT_SALARIE,
  CMU_FORFAIT_EMPLOYEUR,
} from './baremes/cnps-2026'
import { computeITS, computeParts } from './baremes/its-2026'
import { computeIGR } from './baremes/igr-2026'
import { computeCN } from './baremes/cn-2026'
import { computeAncienneteMontant } from './anciennete'
import { computeHeuresSupp } from './heures-supp'
import { computeProrata } from './prorata'
import { splitTransport, splitRepas } from './indemnites'
import { applyRetenues, computeQuotiteSaisissable } from './retenues'
import { PayslipInputSchema, ENGINE_VERSION, type PayslipInput, type PayslipResult, type PayslipBreakdown } from './types'
import { BAREME_YEAR } from './baremes'

export function computePayslip(rawInput: PayslipInput): PayslipResult {
  const input = PayslipInputSchema.parse(rawInput)
  const warnings: string[] = []

  // ---- 1. Prorata ----
  const { salaireProrate, prorataApplique } = computeProrata(
    input.brut,
    input.joursTravailles,
    input.joursOuvres,
  )
  if (prorataApplique) {
    warnings.push(
      `Prorata appliqué : ${input.joursTravailles}/${input.joursOuvres} jours = ${Math.round(salaireProrate)} FCFA`,
    )
  }

  // ---- 2. Ancienneté ----
  const referenceDate = new Date(input.period.year, input.period.month - 1, 28)
  const anciennete = computeAncienneteMontant(salaireProrate, input.joinedAt, referenceDate)

  // ---- 3. Heures supplémentaires ----
  const hs = computeHeuresSupp(salaireProrate, input.heuresHebdo, input.heuresSupp)

  // ---- 4. Indemnités ----
  const transport = splitTransport(input.indemnites.transport)
  const repas = splitRepas(input.indemnites.repas)
  const indemnitesTotal = {
    transportExoneree: transport.exoneree,
    transportImposable: transport.imposable,
    logement: input.indemnites.logement,
    repas: repas.exoneree + repas.imposable,
    fonction: input.indemnites.fonction,
    autres: input.indemnites.autres,
    totalExonerees: transport.exoneree + repas.exoneree,
    totalImposables:
      transport.imposable +
      input.indemnites.logement +
      repas.imposable +
      input.indemnites.fonction +
      input.indemnites.autres,
  }

  // ---- 5. Primes ----
  const primes = input.primes

  // ---- 6. Brut total (rémunération globale) ----
  const brutTotal =
    salaireProrate +
    anciennete.montant +
    hs.total +
    indemnitesTotal.totalExonerees +
    indemnitesTotal.totalImposables +
    primes

  // ---- 7. Brut social ----
  const brutSocial = brutTotal - indemnitesTotal.totalExonerees

  // ---- 8. Brut fiscal ----
  const brutFiscal = brutTotal - indemnitesTotal.totalExonerees

  // ---- 9. Cotisations salarié ----
  const cnpsRetraiteResult = computeCNPSRetraite(brutSocial)
  const cotisationsSalarie = {
    cnpsRetraite: cnpsRetraiteResult.salarie,
    cmu: CMU_FORFAIT_SALARIE,
    total: cnpsRetraiteResult.salarie + CMU_FORFAIT_SALARIE,
  }

  // ---- 10. Impôts ----
  const parts = computeParts(input.family.situation, input.family.kids)
  const cnpsAnnuelleSalarie = cotisationsSalarie.cnpsRetraite * 12
  const its = computeITS(brutFiscal, cnpsAnnuelleSalarie, parts)
  const igr = computeIGR(brutFiscal, cnpsAnnuelleSalarie)
  const cn = computeCN(brutFiscal)
  const totalImpots = its + igr + cn

  // ---- 11. Net imposable ----
  const netImposable = brutFiscal - cotisationsSalarie.total

  // ---- 12. Net avant retenues ----
  const netAvantRetenues = netImposable - totalImpots

  // ---- 13. Retenues sur salaire (quotité saisissable) ----
  const retenuesResult = applyRetenues(netAvantRetenues, input.retenues)
  if (retenuesResult.reportMoisProchain > 0) {
    warnings.push(
      `Retenues plafonnées par quotité saisissable (1/3 du net) : ${Math.round(retenuesResult.reportMoisProchain)} FCFA reportés au mois suivant`,
    )
  }

  // ---- 14. Net à payer ----
  const netAPayer = netAvantRetenues - retenuesResult.retenuesAppliquees

  // ---- 15. Cotisations employeur ----
  const cotisationsEmployeur = {
    cnpsRetraite: cnpsRetraiteResult.employeur,
    cnpsPrestationsFamiliales: computeCNPSPrestationsFamiliales(brutSocial),
    cnpsMaternite: computeCNPSMaternite(brutSocial),
    cnpsAT: computeCNPSAT(brutSocial, input.tauxAT),
    cmu: CMU_FORFAIT_EMPLOYEUR,
    fdfp: computeFDFP(brutSocial),
    total: 0,
  }
  cotisationsEmployeur.total =
    cotisationsEmployeur.cnpsRetraite +
    cotisationsEmployeur.cnpsPrestationsFamiliales +
    cotisationsEmployeur.cnpsMaternite +
    cotisationsEmployeur.cnpsAT +
    cotisationsEmployeur.cmu +
    cotisationsEmployeur.fdfp

  // ---- 16. Coût total employeur ----
  const totalCoutEmployeur = brutTotal + cotisationsEmployeur.total

  const breakdown: PayslipBreakdown = {
    base: {
      brutMensuel: input.brut,
      joursPayes: input.joursTravailles,
      joursOuvres: input.joursOuvres,
      prorataApplique,
      salaireBaseApresProrata: Math.round(salaireProrate),
    },
    anciennete: {
      moisAnciennete: anciennete.months,
      pct: anciennete.pct,
      montant: anciennete.montant,
    },
    heuresSupp: {
      tauxHoraire: Math.round(hs.tauxHoraire),
      montantJour: Math.round(hs.montantJour),
      montantNuit: Math.round(hs.montantNuit),
      montantDimanche: Math.round(hs.montantDimanche),
      montantFerie: Math.round(hs.montantFerie),
      total: Math.round(hs.total),
    },
    indemnites: {
      transportExoneree: Math.round(indemnitesTotal.transportExoneree),
      transportImposable: Math.round(indemnitesTotal.transportImposable),
      logement: Math.round(indemnitesTotal.logement),
      repas: Math.round(indemnitesTotal.repas),
      fonction: Math.round(indemnitesTotal.fonction),
      autres: Math.round(indemnitesTotal.autres),
      totalExonerees: Math.round(indemnitesTotal.totalExonerees),
      totalImposables: Math.round(indemnitesTotal.totalImposables),
    },
    primes: Math.round(primes),
    brutTotal: Math.round(brutTotal),
    brutSocial: Math.round(brutSocial),
    brutFiscal: Math.round(brutFiscal),
    cotisationsSalarie: {
      cnpsRetraite: Math.round(cotisationsSalarie.cnpsRetraite),
      cmu: cotisationsSalarie.cmu,
      total: Math.round(cotisationsSalarie.total),
    },
    cotisationsEmployeur: {
      cnpsRetraite: Math.round(cotisationsEmployeur.cnpsRetraite),
      cnpsPrestationsFamiliales: Math.round(cotisationsEmployeur.cnpsPrestationsFamiliales),
      cnpsMaternite: Math.round(cotisationsEmployeur.cnpsMaternite),
      cnpsAT: Math.round(cotisationsEmployeur.cnpsAT),
      cmu: cotisationsEmployeur.cmu,
      fdfp: Math.round(cotisationsEmployeur.fdfp),
      total: Math.round(cotisationsEmployeur.total),
    },
    impots: {
      abattement: Math.round(brutFiscal * 12 * 0.15),
      baseITSAnnuelle: Math.round(
        Math.max(0, brutFiscal * 12 - cnpsAnnuelleSalarie - brutFiscal * 12 * 0.15),
      ),
      parts,
      baseParPart: Math.round(
        Math.max(0, brutFiscal * 12 - cnpsAnnuelleSalarie - brutFiscal * 12 * 0.15) / parts,
      ),
      its: Math.round(its),
      igr: Math.round(igr),
      cn: Math.round(cn),
      totalImpots: Math.round(totalImpots),
    },
    retenues: {
      avances: Math.round(input.retenues.avances),
      cessions: Math.round(input.retenues.cessions),
      saisies: Math.round(input.retenues.saisies),
      autres: Math.round(input.retenues.autres),
      total: Math.round(retenuesResult.totalRetenues),
      quotiteSaisissable: Math.round(computeQuotiteSaisissable(netAvantRetenues)),
      retenuesDansLaQuotite: Math.round(retenuesResult.retenuesAppliquees),
    },
    net: {
      netImposable: Math.round(netImposable),
      netAvantRetenues: Math.round(netAvantRetenues),
      netAPayer: Math.round(netAPayer),
    },
    totalCoutEmployeur: Math.round(totalCoutEmployeur),
    warnings,
  }

  return {
    input,
    breakdown,
    computedAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
    baremeYear: BAREME_YEAR,
  }
}

/**
 * Variante simplifiée pour rétro-compatibilité avec le mockup actuel.
 * Renvoie un objet plat dans le format historique du mock.
 *
 * @deprecated Utiliser computePayslip(input) pour le calcul complet.
 */
export function computePayslipLegacy(
  brut: number,
  kids = 0,
  married = false,
  joinedAt = '2025-01-01',
  period = { year: 2026, month: 11 },
): {
  brut: number
  brutTotal: number
  anciennetePct: number
  ancienneteAmount: number
  cnps: number
  cmuSal: number
  its: number
  igr: number
  cn: number
  allocFam: number
  net: number
  patron: number
  total: number
} {
  const result = computePayslip({
    brut,
    family: { situation: married ? 'marié(e)' : 'célibataire', kids },
    joinedAt,
    period,
    joursTravailles: 26,
    joursOuvres: 26,
    heuresSupp: { jour: 0, nuit: 0, dimanche: 0, ferie: 0 },
    indemnites: { transport: 0, logement: 0, repas: 0, fonction: 0, autres: 0 },
    retenues: { avances: 0, cessions: 0, saisies: 0, autres: 0 },
    primes: 0,
    tauxAT: 0.025,
    heuresHebdo: 40,
  })
  const b = result.breakdown
  return {
    brut,
    brutTotal: b.brutTotal,
    anciennetePct: b.anciennete.pct,
    ancienneteAmount: b.anciennete.montant,
    cnps: b.cotisationsSalarie.cnpsRetraite,
    cmuSal: b.cotisationsSalarie.cmu,
    its: b.impots.its,
    igr: b.impots.igr,
    cn: b.impots.cn,
    allocFam: Math.min(kids, 6) * 7500,
    net: b.net.netAPayer,
    patron: b.cotisationsEmployeur.total,
    total: b.totalCoutEmployeur,
  }
}
