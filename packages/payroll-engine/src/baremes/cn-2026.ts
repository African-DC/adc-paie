/**
 * Barème CN (Contribution Nationale) 2026 — Côte d'Ivoire
 *
 * Source : DGI / Loi 2003-308.
 * Statut : maintenu en 2026 comme prélèvement parallèle à l'ITS et l'IGR.
 *
 * Le taux exact 2026 reste à confirmer par audit comptable (sources publiques
 * incomplètes). Implémentation prudente : forfait 1,5 % du brut fiscal mensuel.
 * Si l'audit révèle un barème progressif, cette fonction sera mise à jour avec
 * versioning sémantique.
 *
 * TODO post-audit Phase 4 : remplacer par le vrai barème (tranches ou forfait confirmé).
 */

export const CN_TAUX_FORFAITAIRE_2026 = 0.015

export function computeCN(brutFiscalMensuel: number): number {
  if (brutFiscalMensuel <= 0) return 0
  return brutFiscalMensuel * CN_TAUX_FORFAITAIRE_2026
}
