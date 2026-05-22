import { describe, it, expect } from 'vitest'
import { computeAncienneteMonths, computeAnciennetePct, computeAncienneteMontant } from '../anciennete'

describe('Prime d\'ancienneté CCI Art. 31', () => {
  const ref = new Date(2026, 10, 30) // 30 novembre 2026

  it('renvoie 0 mois si date d\'embauche identique à la référence', () => {
    expect(computeAncienneteMonths('2026-11-01', ref)).toBe(0)
  })

  it('compte 24 mois pour un salarié embauché en novembre 2024', () => {
    expect(computeAncienneteMonths('2024-11-01', ref)).toBe(24)
  })

  it('renvoie 0 % avant 24 mois', () => {
    expect(computeAnciennetePct(0)).toBe(0)
    expect(computeAnciennetePct(12)).toBe(0)
    expect(computeAnciennetePct(23)).toBe(0)
  })

  it('renvoie 2 % à 24 mois (2 ans)', () => {
    expect(computeAnciennetePct(24)).toBe(0.02)
    expect(computeAnciennetePct(30)).toBe(0.02)
  })

  it('renvoie 3 % à 3 ans (36 mois)', () => {
    expect(computeAnciennetePct(36)).toBe(0.03)
  })

  it('renvoie 7 % à 7 ans', () => {
    expect(computeAnciennetePct(84)).toBe(0.07)
  })

  it('plafonne à 25 % à 25+ ans', () => {
    expect(computeAnciennetePct(300)).toBe(0.25)
    expect(computeAnciennetePct(600)).toBe(0.25)
  })

  it('renvoie 25 % pile à 25 ans (24 ans appliqués)', () => {
    expect(computeAnciennetePct(300)).toBe(0.25)
  })

  it('computeAncienneteMontant renvoie le montant arrondi', () => {
    // 2021-01 → 2026-11 = 70 mois = 5 ans pleins → 2 % + 3 % = 5 %
    const r = computeAncienneteMontant(350_000, '2021-01-15', ref)
    expect(r.months).toBe(70)
    expect(r.pct).toBe(0.05)
    expect(r.montant).toBe(17_500)
  })
})
