/**
 * Barème ITS (Impôt sur Traitements et Salaires) 2026 — Côte d'Ivoire
 *
 * Source : DGI / Ordonnance 2023-719 du 13 septembre 2023 (toujours en vigueur 2026).
 * Loi de Finances 2026 (N°2025-987 du 19 décembre 2025) : aucune modification des tranches ITS.
 *
 * Méthode : abattement forfaitaire de 15 % sur le salaire brut imposable
 * (déduction frais professionnels), puis quotient familial, puis barème progressif
 * annuel **par part fiscale**, puis × nombre de parts → ITS annuel → /12 = mensuel.
 *
 * NOTE : un audit comptable indépendant est planifié post-Phase 4 pour valider
 * les tranches et la méthode du quotient familial sur 5 bulletins CI réels.
 */

export const ITS_ABATTEMENT_FRAIS_PROFESSIONNELS = 0.15

export const ITS_TRANCHES_2026 = [
  { plafond: 75_000, taux: 0.00 },
  { plafond: 150_000, taux: 0.16 },
  { plafond: 300_000, taux: 0.21 },
  { plafond: 600_000, taux: 0.24 },
  { plafond: 1_000_000, taux: 0.28 },
  { plafond: Infinity, taux: 0.32 },
] as const

/**
 * Calcule le nombre de parts fiscales selon situation familiale et enfants à charge.
 *
 * Règle simplifiée CI :
 * - Célibataire / divorcé / veuf sans enfants : 1 part
 * - Marié(e) sans enfants : 2 parts
 * - Chaque enfant à charge : +0,5 part
 * - Plafond : 5 parts (réglementation CI, à confirmer par audit)
 *
 * @param situation - "célibataire" | "marié(e)" | "divorcé(e)" | "veuf/veuve"
 * @param kids - nombre d'enfants à charge
 */
export function computeParts(situation: string, kids: number): number {
  const baseConjoint = situation === 'marié(e)' ? 2 : 1
  const partsEnfants = kids * 0.5
  return Math.min(baseConjoint + partsEnfants, 5)
}

/**
 * Applique le barème ITS progressif sur une base annuelle PAR PART.
 * Retourne l'impôt annuel par part (à multiplier ensuite par le nombre de parts).
 */
export function computeITSAnnuelParPart(baseAnnuelleParPart: number): number {
  if (baseAnnuelleParPart <= 0) return 0
  let impot = 0
  let plafondPrecedent = 0
  for (const tranche of ITS_TRANCHES_2026) {
    if (baseAnnuelleParPart <= plafondPrecedent) break
    const montantDansTranche = Math.min(baseAnnuelleParPart, tranche.plafond) - plafondPrecedent
    impot += montantDansTranche * tranche.taux
    plafondPrecedent = tranche.plafond
    if (baseAnnuelleParPart <= tranche.plafond) break
  }
  return impot
}

/**
 * Calcule l'ITS mensuel net.
 *
 * @param brutFiscalMensuel - salaire brut imposable (brutTotal - indemnités exonérées)
 * @param cnpsAnnuelle - cotisations CNPS annuelles déductibles
 * @param parts - nombre de parts fiscales
 */
export function computeITS(brutFiscalMensuel: number, cnpsAnnuelle: number, parts: number): number {
  const brutAnnuel = brutFiscalMensuel * 12
  const abattement = brutAnnuel * ITS_ABATTEMENT_FRAIS_PROFESSIONNELS
  const baseImposableAnnuelle = Math.max(0, brutAnnuel - cnpsAnnuelle - abattement)
  const baseParPart = baseImposableAnnuelle / parts
  const itsAnnuelParPart = computeITSAnnuelParPart(baseParPart)
  const itsAnnuel = itsAnnuelParPart * parts
  return itsAnnuel / 12
}
