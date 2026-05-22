/**
 * Retenues sur salaire — quotité saisissable
 *
 * Source : Code du travail Loi 2015-532 Art. 32.16 (à confirmer audit) et Décret
 * d'application sur la quotité saisissable.
 *
 * Règle CI usuelle : les retenues volontaires (cessions, avances remboursables)
 * et les saisies-arrêts ne peuvent pas dépasser globalement 1/3 du salaire net
 * du salarié (quotité saisissable).
 *
 * Implémentation : on calcule la quotité maximale saisissable, puis on applique
 * les retenues dans cette limite. Le surplus est reporté au mois suivant (non
 * géré dans le moteur — à gérer par la couche application).
 */

export const QUOTITE_SAISISSABLE_FRACTION = 1 / 3

export function computeQuotiteSaisissable(netAvantRetenues: number): number {
  return netAvantRetenues * QUOTITE_SAISISSABLE_FRACTION
}

export function applyRetenues(netAvantRetenues: number, retenues: {
  avances: number
  cessions: number
  saisies: number
  autres: number
}): {
  totalRetenues: number
  retenuesAppliquees: number
  reportMoisProchain: number
  quotiteSaisissable: number
} {
  const totalRetenues = retenues.avances + retenues.cessions + retenues.saisies + retenues.autres
  const quotiteSaisissable = computeQuotiteSaisissable(netAvantRetenues)
  const retenuesAppliquees = Math.min(totalRetenues, quotiteSaisissable)
  const reportMoisProchain = Math.max(0, totalRetenues - quotiteSaisissable)
  return {
    totalRetenues,
    retenuesAppliquees,
    reportMoisProchain,
    quotiteSaisissable,
  }
}
