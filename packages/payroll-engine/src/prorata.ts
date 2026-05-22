/**
 * Prorata salarial — entrée/sortie en cours de mois ou absence non rémunérée
 *
 * Méthode CI : calcul sur 26 jours ouvrés par mois (usage convention 1977).
 * Si l'employé travaille moins de 26 jours sur le mois (entrée/sortie/absence),
 * le salaire de base est proraté.
 *
 * Formule : salaireProrate = salaireMensuel × (joursTravailles / joursOuvres)
 *
 * Note : selon les conventions internes, certaines entreprises utilisent un
 * prorata sur 30 jours calendaires. À paramétrer via joursOuvres.
 */

export const JOURS_OUVRES_STANDARD = 26

export function computeProrata(
  salaireMensuel: number,
  joursTravailles: number,
  joursOuvres = JOURS_OUVRES_STANDARD,
): {
  salaireProrate: number
  prorataApplique: boolean
} {
  if (joursOuvres <= 0) {
    return { salaireProrate: 0, prorataApplique: false }
  }
  if (joursTravailles >= joursOuvres) {
    return { salaireProrate: salaireMensuel, prorataApplique: false }
  }
  return {
    salaireProrate: salaireMensuel * (joursTravailles / joursOuvres),
    prorataApplique: true,
  }
}
