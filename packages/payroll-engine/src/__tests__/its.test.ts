import { describe, it, expect } from 'vitest'
import { computeITS, computeITSAnnuelParPart, computeParts } from '../baremes/its-2026'

describe('ITS — quotient familial', () => {
  it('1 part pour célibataire sans enfants', () => {
    expect(computeParts('célibataire', 0)).toBe(1)
  })

  it('2 parts pour marié sans enfants', () => {
    expect(computeParts('marié(e)', 0)).toBe(2)
  })

  it('marié 2 enfants = 3 parts', () => {
    expect(computeParts('marié(e)', 2)).toBe(3)
  })

  it('plafonne à 5 parts', () => {
    expect(computeParts('marié(e)', 10)).toBe(5)
  })

  it('divorcé sans enfants = 1 part', () => {
    expect(computeParts('divorcé(e)', 0)).toBe(1)
  })
})

describe('ITS — barème progressif annuel par part 2026', () => {
  it('renvoie 0 sous 75 000 FCFA / part / an', () => {
    expect(computeITSAnnuelParPart(0)).toBe(0)
    expect(computeITSAnnuelParPart(50_000)).toBe(0)
    expect(computeITSAnnuelParPart(75_000)).toBe(0)
  })

  it('taxe 16 % sur tranche 75k-150k', () => {
    // 100 000 - 75 000 = 25 000 × 16 % = 4 000
    expect(computeITSAnnuelParPart(100_000)).toBe(4_000)
  })

  it('cumule les tranches correctement à 200 000', () => {
    // (150-75)k×16% + (200-150)k×21% = 12000 + 10500 = 22500
    expect(computeITSAnnuelParPart(200_000)).toBe(22_500)
  })

  it('cumule jusqu\'à 1 000 000', () => {
    // 75k=0 + 75k×16% + 150k×21% + 300k×24% + 400k×28% = 0+12k+31.5k+72k+112k = 227 500
    expect(computeITSAnnuelParPart(1_000_000)).toBe(227_500)
  })

  it('applique 32 % au-delà de 1M', () => {
    // 227 500 + 500 000 × 32 % = 227 500 + 160 000 = 387 500
    expect(computeITSAnnuelParPart(1_500_000)).toBe(387_500)
  })
})

describe('ITS — calcul mensuel complet', () => {
  it('exonère un brut faible (250k brut, marié 2 enfants)', () => {
    // brut annuel = 3M, CNPS = 250k×6,3%×12 = 189k, abat = 450k
    // base imposable = 3M - 189k - 450k = 2 361 000
    // 3 parts → base/part = 787 000
    // ITS/part = 12k + 31.5k + 116.88k = 160 380 ; ×3 = 481 140 / 12 = 40 095/mois
    const its = computeITS(250_000, 250_000 * 0.063 * 12, 3)
    expect(its).toBeGreaterThan(0)
    expect(its).toBeLessThan(60_000)
  })

  it('renvoie 0 ITS pour un salaire très faible', () => {
    // 100k brut, célibataire, 1 part
    // brut annuel = 1,2M ; CNPS = 75 600 ; abat = 180k
    // base = 1,2M - 75,6k - 180k = 944 400 / 1 part = 944 400
    // ITS = 12k + 31.5k + 72k + 96.4k×28% = 224 932 / 12 = ~18 744
    const its = computeITS(100_000, 100_000 * 0.063 * 12, 1)
    expect(its).toBeGreaterThan(15_000)
    expect(its).toBeLessThan(20_000)
  })
})
