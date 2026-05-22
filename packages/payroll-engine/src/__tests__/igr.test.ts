import { describe, it, expect } from 'vitest'
import { computeIGRAnnuel, computeIGR } from '../baremes/igr-2026'

describe('IGR — barème progressif annuel 2026', () => {
  it('renvoie 0 sous 525 000 FCFA / an', () => {
    expect(computeIGRAnnuel(0)).toBe(0)
    expect(computeIGRAnnuel(525_000)).toBe(0)
  })

  it('taxe 15 % sur tranche 525k-900k', () => {
    // (700 - 525) × 15 % = 175 × 15 % = 26 250
    expect(computeIGRAnnuel(700_000)).toBe(26_250)
  })

  it('cumule les tranches à 1 500 000', () => {
    // (900-525)×15% + (1350-900)×20% + (1500-1350)×25% = 56250 + 90000 + 37500 = 183 750
    expect(computeIGRAnnuel(1_500_000)).toBe(183_750)
  })

  it('atteint la tranche 60 % au-delà de 7,5M', () => {
    // (900-525)×15% + (1350-900)×20% + (2250-1350)×25% + (3750-2250)×35%
    //   + (7500-3750)×45% + (8M-7,5M)×60%
    // = 56250 + 90000 + 225000 + 525000 + 1687500 + 300000 = 2 883 750
    expect(computeIGRAnnuel(8_000_000)).toBe(2_883_750)
  })

  it('IGR mensuel pour un brut moyen', () => {
    // 350k brut → ann = 4,2M ; cnps ann = 264 600 ; abat = 630k → base = 3 305 400
    // IGR = (900-525)×15% + (1350-900)×20% + (2250-1350)×25% + (3305,4-2250)×35%
    //     = 56250 + 90000 + 225000 + 369 390 = 740 640 / 12 = ~61 720
    const igr = computeIGR(350_000, 350_000 * 0.063 * 12)
    expect(igr).toBeGreaterThan(60_000)
    expect(igr).toBeLessThan(63_000)
  })
})
