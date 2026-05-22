import { describe, it, expect } from 'vitest'
import { computeTauxHoraire, computeHeuresSupp } from '../heures-supp'

describe('Heures supplémentaires CCI Art. 24', () => {
  it('taux horaire = salaire / (40 × 52 / 12) ≈ salaire / 173.33', () => {
    const taux = computeTauxHoraire(300_000, 40)
    expect(taux).toBeCloseTo(300_000 / 173.33, 0)
  })

  it('renvoie 0 si pas d\'heures supplémentaires', () => {
    const r = computeHeuresSupp(300_000, 40, { jour: 0, nuit: 0, dimanche: 0, ferie: 0 })
    expect(r.total).toBe(0)
  })

  it('heures jour majorées +25 %', () => {
    const r = computeHeuresSupp(300_000, 40, { jour: 4, nuit: 0, dimanche: 0, ferie: 0 })
    const taux = 300_000 / ((40 * 52) / 12)
    expect(r.montantJour).toBeCloseTo(4 * taux * 1.25, 0)
  })

  it('heures nuit majorées +75 %', () => {
    const r = computeHeuresSupp(300_000, 40, { jour: 0, nuit: 4, dimanche: 0, ferie: 0 })
    const taux = 300_000 / ((40 * 52) / 12)
    expect(r.montantNuit).toBeCloseTo(4 * taux * 1.75, 0)
  })

  it('heures dimanche majorées +75 %', () => {
    const r = computeHeuresSupp(300_000, 40, { jour: 0, nuit: 0, dimanche: 4, ferie: 0 })
    const taux = 300_000 / ((40 * 52) / 12)
    expect(r.montantDimanche).toBeCloseTo(4 * taux * 1.75, 0)
  })

  it('heures férié majorées +100 %', () => {
    const r = computeHeuresSupp(300_000, 40, { jour: 0, nuit: 0, dimanche: 0, ferie: 4 })
    const taux = 300_000 / ((40 * 52) / 12)
    expect(r.montantFerie).toBeCloseTo(4 * taux * 2, 0)
  })

  it('cumule les différentes catégories', () => {
    const r = computeHeuresSupp(300_000, 40, { jour: 2, nuit: 2, dimanche: 2, ferie: 2 })
    expect(r.total).toBe(r.montantJour + r.montantNuit + r.montantDimanche + r.montantFerie)
  })
})
