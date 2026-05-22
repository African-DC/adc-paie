/**
 * Prime d'ancienneté — Convention Collective Interprofessionnelle 1977, Art. 31
 *
 * Règle :
 * - 0 % avant 24 mois (2 ans) d'ancienneté
 * - 2 % à partir de 24 mois
 * - +1 % par année supplémentaire
 * - Plafond : 25 % du salaire de base
 *
 * Source : CCI 1977 (UGTCI/AICI) Art. 31.
 */

const ANCIENNETE_PCT_MAX = 0.25
const ANCIENNETE_SEUIL_MOIS = 24
const ANCIENNETE_PCT_INITIAL = 0.02

export function computeAncienneteMonths(joinedAt: string, referenceDate: Date): number {
  const start = new Date(joinedAt)
  if (Number.isNaN(start.getTime())) return 0
  const months =
    (referenceDate.getFullYear() - start.getFullYear()) * 12 +
    (referenceDate.getMonth() - start.getMonth())
  return Math.max(0, months)
}

export function computeAnciennetePct(months: number): number {
  if (months < ANCIENNETE_SEUIL_MOIS) return 0
  const yearsSeuil = Math.floor(months / 12)
  const pct = ANCIENNETE_PCT_INITIAL + (yearsSeuil - 2) * 0.01
  return Math.min(Math.max(0, pct), ANCIENNETE_PCT_MAX)
}

export function computeAncienneteMontant(salaireBase: number, joinedAt: string, referenceDate: Date): {
  months: number
  pct: number
  montant: number
} {
  const months = computeAncienneteMonths(joinedAt, referenceDate)
  const pct = computeAnciennetePct(months)
  return {
    months,
    pct,
    montant: Math.round(salaireBase * pct),
  }
}
