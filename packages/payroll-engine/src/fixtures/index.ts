import type { PayslipInput } from '../types'

/**
 * Fixture 1 : CDI marié 2 enfants, 350 000 FCFA brut, 5 ans d'ancienneté
 * Cas typique d'un cadre intermédiaire ivoirien (chef de service, comptable senior).
 */
export const FIXTURE_CDI_MARIE_2ENFANTS_350K: PayslipInput = {
  brut: 350_000,
  family: { situation: 'marié(e)', kids: 2 },
  joinedAt: '2021-01-15',
  period: { year: 2026, month: 11 },
  joursTravailles: 26,
  joursOuvres: 26,
  heuresSupp: { jour: 0, nuit: 0, dimanche: 0, ferie: 0 },
  indemnites: { transport: 25_000, logement: 0, repas: 0, fonction: 0, autres: 0 },
  retenues: { avances: 0, cessions: 0, saisies: 0, autres: 0 },
  primes: 0,
  tauxAT: 0.025,
  heuresHebdo: 40,
}

/**
 * Fixture 2 : CDI célibataire senior, 850 000 FCFA brut, 8 ans d'ancienneté + heures sup
 * Cas typique d'un cadre supérieur (DG adjoint, directeur technique).
 */
export const FIXTURE_CDI_CELIB_SENIOR_850K: PayslipInput = {
  brut: 850_000,
  family: { situation: 'célibataire', kids: 0 },
  joinedAt: '2018-03-01',
  period: { year: 2026, month: 11 },
  joursTravailles: 26,
  joursOuvres: 26,
  heuresSupp: { jour: 8, nuit: 0, dimanche: 0, ferie: 0 },
  indemnites: { transport: 25_000, logement: 100_000, repas: 0, fonction: 50_000, autres: 0 },
  retenues: { avances: 0, cessions: 0, saisies: 0, autres: 0 },
  primes: 50_000,
  tauxAT: 0.025,
  heuresHebdo: 40,
}

/**
 * Fixture 3 : CDD junior, 220 000 FCFA brut, < 24 mois, pas d'ancienneté
 * Cas typique d'un chargé de clientèle ou commercial débutant.
 */
export const FIXTURE_CDD_JUNIOR_220K: PayslipInput = {
  brut: 220_000,
  family: { situation: 'célibataire', kids: 1 },
  joinedAt: '2025-03-01',
  period: { year: 2026, month: 11 },
  joursTravailles: 26,
  joursOuvres: 26,
  heuresSupp: { jour: 0, nuit: 0, dimanche: 0, ferie: 0 },
  indemnites: { transport: 15_000, logement: 0, repas: 0, fonction: 0, autres: 0 },
  retenues: { avances: 0, cessions: 0, saisies: 0, autres: 0 },
  primes: 0,
  tauxAT: 0.025,
  heuresHebdo: 40,
}

/**
 * Fixture 4 : Mi-temps prorata (entrée en cours de mois)
 * Salarié arrivé le 15 du mois, ne travaille que 13 jours sur 26.
 */
export const FIXTURE_MI_TEMPS_PRORATA: PayslipInput = {
  brut: 300_000,
  family: { situation: 'célibataire', kids: 0 },
  joinedAt: '2026-11-15',
  period: { year: 2026, month: 11 },
  joursTravailles: 13,
  joursOuvres: 26,
  heuresSupp: { jour: 0, nuit: 0, dimanche: 0, ferie: 0 },
  indemnites: { transport: 12_500, logement: 0, repas: 0, fonction: 0, autres: 0 },
  retenues: { avances: 0, cessions: 0, saisies: 0, autres: 0 },
  primes: 0,
  tauxAT: 0.025,
  heuresHebdo: 40,
}

/**
 * Fixture 5 : Cas riche avec indemnités, primes, heures sup et retenues
 * Manager 600k brut + transport + repas + prime exceptionnelle + avance à rembourser.
 */
export const FIXTURE_RICHE_INDEMNITES_RETENUES: PayslipInput = {
  brut: 600_000,
  family: { situation: 'marié(e)', kids: 3 },
  joinedAt: '2020-06-01',
  period: { year: 2026, month: 11 },
  joursTravailles: 26,
  joursOuvres: 26,
  heuresSupp: { jour: 4, nuit: 6, dimanche: 0, ferie: 0 },
  indemnites: { transport: 40_000, logement: 0, repas: 35_000, fonction: 25_000, autres: 0 },
  retenues: { avances: 75_000, cessions: 0, saisies: 0, autres: 0 },
  primes: 100_000,
  tauxAT: 0.035,
  heuresHebdo: 40,
}

export const ALL_FIXTURES: { name: string; input: PayslipInput }[] = [
  { name: 'CDI marié 2 enfants 350k', input: FIXTURE_CDI_MARIE_2ENFANTS_350K },
  { name: 'CDI célib senior 850k', input: FIXTURE_CDI_CELIB_SENIOR_850K },
  { name: 'CDD junior 220k', input: FIXTURE_CDD_JUNIOR_220K },
  { name: 'Mi-temps prorata 13/26j', input: FIXTURE_MI_TEMPS_PRORATA },
  { name: 'Riche indemnités+HS+retenues 600k', input: FIXTURE_RICHE_INDEMNITES_RETENUES },
]
