/**
 * Heures supplémentaires — Convention Collective Interprofessionnelle 1977, Art. 24
 * et Code du travail Loi 2015-532.
 *
 * Majoration sur le taux horaire de base :
 * - Jour ouvré au-delà de 40h/semaine : +15 % (jusqu'à la 46e h) puis +50 %
 *   (Implémentation simplifiée : on traite la majoration au taux moyen +25 %
 *    pour les heures dites "jour", ajustable par TODO)
 * - Nuit (21h-5h) : +75 %
 * - Dimanche : +75 %
 * - Jour férié : +100 %
 *
 * Taux horaire de base = salaire mensuel / (heures hebdo × 52 / 12)
 * Pour 40h hebdo : taux horaire = salaire / 173,33h/mois
 *
 * TODO post-audit : raffiner la séparation 15 %/50 % pour les heures jour
 * en fonction du nombre d'heures dépassant 46h/semaine.
 */

export const MAJORATION_HEURE_JOUR = 0.25
export const MAJORATION_HEURE_NUIT = 0.75
export const MAJORATION_HEURE_DIMANCHE = 0.75
export const MAJORATION_HEURE_FERIE = 1.0

export function computeTauxHoraire(salaireBase: number, heuresHebdo: number): number {
  if (heuresHebdo <= 0) return 0
  const heuresMois = (heuresHebdo * 52) / 12
  return salaireBase / heuresMois
}

export function computeHeuresSupp(salaireBase: number, heuresHebdo: number, supp: {
  jour: number
  nuit: number
  dimanche: number
  ferie: number
}): {
  tauxHoraire: number
  montantJour: number
  montantNuit: number
  montantDimanche: number
  montantFerie: number
  total: number
} {
  const tauxHoraire = computeTauxHoraire(salaireBase, heuresHebdo)
  const montantJour = supp.jour * tauxHoraire * (1 + MAJORATION_HEURE_JOUR)
  const montantNuit = supp.nuit * tauxHoraire * (1 + MAJORATION_HEURE_NUIT)
  const montantDimanche = supp.dimanche * tauxHoraire * (1 + MAJORATION_HEURE_DIMANCHE)
  const montantFerie = supp.ferie * tauxHoraire * (1 + MAJORATION_HEURE_FERIE)
  return {
    tauxHoraire,
    montantJour,
    montantNuit,
    montantDimanche,
    montantFerie,
    total: montantJour + montantNuit + montantDimanche + montantFerie,
  }
}
