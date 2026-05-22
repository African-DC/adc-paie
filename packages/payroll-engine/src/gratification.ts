/**
 * Gratification annuelle / 13e mois — Convention Collective Interprofessionnelle 1977, Art. 41
 *
 * Règle :
 * - Versée annuellement (généralement en décembre)
 * - Montant : 1 mois de salaire de base (brut hors indemnités)
 * - Prorata d'ancienneté sur l'année civile : pour un salarié présent toute l'année,
 *   gratification = 1 mois. Pour un salarié arrivé en cours d'année :
 *   gratification = salaireMensuel × (moisPresents / 12)
 * - Imposable et soumise aux cotisations sociales comme du salaire normal
 *
 * Source : CCI 1977 (UGTCI/AICI) Art. 41.
 */

export function computeGratification(salaireBaseMensuel: number, joinedAt: string, annee: number): {
  moisPresents: number
  montant: number
} {
  const start = new Date(joinedAt)
  if (Number.isNaN(start.getTime())) {
    return { moisPresents: 0, montant: 0 }
  }
  const debutAnnee = new Date(annee, 0, 1)
  const finAnnee = new Date(annee, 11, 31)
  const dateDebutCalcul = start > debutAnnee ? start : debutAnnee
  if (dateDebutCalcul > finAnnee) {
    return { moisPresents: 0, montant: 0 }
  }
  const moisPresents = Math.max(
    0,
    Math.min(
      12,
      (finAnnee.getFullYear() - dateDebutCalcul.getFullYear()) * 12 +
        (finAnnee.getMonth() - dateDebutCalcul.getMonth()) +
        1,
    ),
  )
  const montant = Math.round(salaireBaseMensuel * (moisPresents / 12))
  return { moisPresents, montant }
}
