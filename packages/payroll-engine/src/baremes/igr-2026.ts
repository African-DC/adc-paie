/**
 * Barème IGR (Impôt Général sur le Revenu) 2026 — Côte d'Ivoire
 *
 * Source : DGI / Code Général des Impôts CI 2026.
 * Statut : malgré l'Ordonnance 2023-719 (réforme ITS), l'IGR existe toujours
 * en 2026 comme prélèvement parallèle à l'ITS. Loi de Finances 2026 (N°2025-987)
 * confirme le maintien du barème progressif annuel.
 *
 * Méthode : barème progressif annuel sur le brut imposable (post-abattement CNPS
 * et frais pro), même base que l'ITS. Quotient familial NON appliqué à l'IGR
 * (uniquement à l'ITS), mais la base de calcul est commune.
 *
 * IMPORTANT : le mockup pré-Phase-0 utilisait un forfait 1,5 % qui était FAUX.
 * Cette implémentation corrige avec le vrai barème.
 *
 * NOTE : audit comptable indépendant prévu post-Phase 4 pour confirmer les tranches.
 */

export const IGR_TRANCHES_2026 = [
  { plafond: 525_000, taux: 0.00 },
  { plafond: 900_000, taux: 0.15 },
  { plafond: 1_350_000, taux: 0.20 },
  { plafond: 2_250_000, taux: 0.25 },
  { plafond: 3_750_000, taux: 0.35 },
  { plafond: 7_500_000, taux: 0.45 },
  { plafond: Infinity, taux: 0.60 },
] as const

export function computeIGRAnnuel(baseImposableAnnuelle: number): number {
  if (baseImposableAnnuelle <= 0) return 0
  let impot = 0
  let plafondPrecedent = 0
  for (const tranche of IGR_TRANCHES_2026) {
    if (baseImposableAnnuelle <= plafondPrecedent) break
    const montantDansTranche = Math.min(baseImposableAnnuelle, tranche.plafond) - plafondPrecedent
    impot += montantDansTranche * tranche.taux
    plafondPrecedent = tranche.plafond
    if (baseImposableAnnuelle <= tranche.plafond) break
  }
  return impot
}

export function computeIGR(brutFiscalMensuel: number, cnpsAnnuelle: number): number {
  const brutAnnuel = brutFiscalMensuel * 12
  const abattement = brutAnnuel * 0.15
  const baseImposableAnnuelle = Math.max(0, brutAnnuel - cnpsAnnuelle - abattement)
  return computeIGRAnnuel(baseImposableAnnuelle) / 12
}
