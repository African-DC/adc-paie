import { describe, it, expect } from 'vitest'
import { computeGratification } from '../gratification'

describe('Gratification 13e mois CCI Art. 41', () => {
  it('1 mois entier pour un salarié présent toute l\'année', () => {
    const r = computeGratification(300_000, '2020-01-01', 2026)
    expect(r.moisPresents).toBe(12)
    expect(r.montant).toBe(300_000)
  })

  it('Prorata pour un salarié arrivé en juillet', () => {
    const r = computeGratification(300_000, '2026-07-01', 2026)
    expect(r.moisPresents).toBe(6) // juillet à décembre
    expect(r.montant).toBe(150_000)
  })

  it('0 mois pour un salarié arrivé après la fin de l\'année', () => {
    const r = computeGratification(300_000, '2027-02-01', 2026)
    expect(r.moisPresents).toBe(0)
    expect(r.montant).toBe(0)
  })

  it('Salarié arrivé en décembre : 1 mois', () => {
    const r = computeGratification(400_000, '2026-12-01', 2026)
    expect(r.moisPresents).toBe(1)
    expect(r.montant).toBeCloseTo(33_333, -1)
  })
})
