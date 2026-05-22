import { describe, it, expect } from 'vitest'
import { computeQuotiteSaisissable, applyRetenues } from '../retenues'

describe('Retenues sur salaire — quotité saisissable 1/3', () => {
  it('quotité saisissable = 1/3 du net', () => {
    expect(computeQuotiteSaisissable(300_000)).toBeCloseTo(100_000)
  })

  it('aucune retenue : rien à appliquer', () => {
    const r = applyRetenues(300_000, { avances: 0, cessions: 0, saisies: 0, autres: 0 })
    expect(r.totalRetenues).toBe(0)
    expect(r.retenuesAppliquees).toBe(0)
    expect(r.reportMoisProchain).toBe(0)
  })

  it('retenues sous la quotité : 100 % appliquées', () => {
    const r = applyRetenues(300_000, { avances: 50_000, cessions: 0, saisies: 0, autres: 0 })
    expect(r.totalRetenues).toBe(50_000)
    expect(r.retenuesAppliquees).toBe(50_000)
    expect(r.reportMoisProchain).toBe(0)
  })

  it('retenues au-delà de la quotité : surplus reporté', () => {
    const r = applyRetenues(300_000, { avances: 150_000, cessions: 0, saisies: 0, autres: 0 })
    expect(r.totalRetenues).toBe(150_000)
    expect(r.retenuesAppliquees).toBeCloseTo(100_000)
    expect(r.reportMoisProchain).toBeCloseTo(50_000)
  })

  it('multi-retenues cumulées contre la quotité', () => {
    const r = applyRetenues(300_000, { avances: 30_000, cessions: 50_000, saisies: 30_000, autres: 10_000 })
    expect(r.totalRetenues).toBe(120_000)
    expect(r.retenuesAppliquees).toBeCloseTo(100_000)
    expect(r.reportMoisProchain).toBeCloseTo(20_000)
  })
})
