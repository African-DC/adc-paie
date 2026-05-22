/**
 * Barème CNPS (Caisse Nationale de Prévoyance Sociale) 2026 — Côte d'Ivoire
 *
 * Source : CNPS / CLEISS / Décret 2023.
 * Loi de Finances 2026 (N°2025-987) : aucune modification des taux CNPS.
 *
 * SMIG 2026 = 75 000 FCFA (stable depuis 1er janvier 2023).
 * Plafond cotisation retraite = 45 × SMIG = 3 375 000 FCFA / mois.
 *
 * Branches :
 * - Retraite (vieillesse) : 6,3 % salarié + 7,7 % employeur, plafonné
 * - Prestations familiales (employeur seul) : 5,75 %, plafond 70 000 FCFA
 * - Maternité (employeur seul) : 0,75 %, plafond 70 000 FCFA
 * - Accidents du travail (employeur seul) : 2-5 % selon secteur, plafond 70 000 FCFA
 *
 * Allocations familiales versées par la CNPS au salarié : 7 500 FCFA / enfant / mois,
 * max 6 enfants, conditions âge 1-14 ans (ou 18-21 si études). Ces allocations sont
 * VERSÉES PAR LA CNPS AU SALARIÉ, donc PAS dans le calcul du net employeur-side.
 */

export const SMIG_2026 = 75_000

export const CNPS_RETRAITE_TAUX_SALARIE = 0.063
export const CNPS_RETRAITE_TAUX_EMPLOYEUR = 0.077
export const CNPS_RETRAITE_PLAFOND_MENSUEL = 3_375_000

export const CNPS_PRESTATIONS_FAMILIALES_TAUX = 0.0575
export const CNPS_MATERNITE_TAUX = 0.0075
export const CNPS_AT_TAUX_MIN = 0.02
export const CNPS_AT_TAUX_MAX = 0.05
export const CNPS_AT_TAUX_DEFAUT = 0.025
export const CNPS_PLAFOND_FAMILLE_MATERNITE_AT = 70_000

export const CMU_FORFAIT_SALARIE = 500
export const CMU_FORFAIT_EMPLOYEUR = 500

export const FDFP_TAUX_EMPLOYEUR = 0.012

export const ALLOCATION_FAMILIALE_PAR_ENFANT = 7_500
export const ALLOCATION_FAMILIALE_MAX_ENFANTS = 6

export function computeCNPSRetraite(brutSocial: number): {
  salarie: number
  employeur: number
  basePlafonnee: number
} {
  const basePlafonnee = Math.min(brutSocial, CNPS_RETRAITE_PLAFOND_MENSUEL)
  return {
    salarie: basePlafonnee * CNPS_RETRAITE_TAUX_SALARIE,
    employeur: basePlafonnee * CNPS_RETRAITE_TAUX_EMPLOYEUR,
    basePlafonnee,
  }
}

export function computeCNPSPrestationsFamiliales(brutSocial: number): number {
  return Math.min(brutSocial, CNPS_PLAFOND_FAMILLE_MATERNITE_AT) * CNPS_PRESTATIONS_FAMILIALES_TAUX
}

export function computeCNPSMaternite(brutSocial: number): number {
  return Math.min(brutSocial, CNPS_PLAFOND_FAMILLE_MATERNITE_AT) * CNPS_MATERNITE_TAUX
}

export function computeCNPSAT(brutSocial: number, tauxAT: number): number {
  const taux = Math.max(CNPS_AT_TAUX_MIN, Math.min(CNPS_AT_TAUX_MAX, tauxAT))
  return Math.min(brutSocial, CNPS_PLAFOND_FAMILLE_MATERNITE_AT) * taux
}

export function computeFDFP(brutSocial: number): number {
  return brutSocial * FDFP_TAUX_EMPLOYEUR
}

export function computeAllocationsFamiliales(kids: number): number {
  const enfantsEligibles = Math.min(kids, ALLOCATION_FAMILIALE_MAX_ENFANTS)
  return enfantsEligibles * ALLOCATION_FAMILIALE_PAR_ENFANT
}
