/**
 * Indemnités exonérées de cotisations sociales et/ou fiscales
 *
 * Source : Code Général des Impôts CI 2026, CCI 1977 Art. 39 et 40.
 *
 * Règles principales :
 * - Indemnité de transport : exonérée dans la limite de 30 000 FCFA / mois (plafond
 *   généralement admis par DGI, à confirmer audit). Au-delà : imposable et soumise
 *   aux cotisations sociales.
 * - Indemnité de logement / avantage en nature : imposable et soumise aux cotisations
 *   sauf montant forfaitaire administratif (variable selon barème DGI).
 * - Indemnité de repas (panier) : exonérée jusqu'à un certain seuil (généralement
 *   30 000 FCFA / mois selon source DGI).
 * - Indemnité de fonction / représentation : imposable et soumise aux cotisations.
 * - Primes diverses (rendement, salissure) : imposables et cotisables.
 *
 * NOTE : ces plafonds restent à confirmer par audit comptable Phase 4.
 */

export const PLAFOND_EXONERATION_TRANSPORT = 30_000
export const PLAFOND_EXONERATION_REPAS = 30_000

export function splitTransport(montant: number): { exoneree: number; imposable: number } {
  const exoneree = Math.min(montant, PLAFOND_EXONERATION_TRANSPORT)
  return { exoneree, imposable: Math.max(0, montant - exoneree) }
}

export function splitRepas(montant: number): { exoneree: number; imposable: number } {
  const exoneree = Math.min(montant, PLAFOND_EXONERATION_REPAS)
  return { exoneree, imposable: Math.max(0, montant - exoneree) }
}
