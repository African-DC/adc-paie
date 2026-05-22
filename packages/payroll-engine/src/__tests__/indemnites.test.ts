import { describe, it, expect } from 'vitest'
import { splitTransport, splitRepas, PLAFOND_EXONERATION_TRANSPORT, PLAFOND_EXONERATION_REPAS } from '../indemnites'

describe('Indemnités — exonération', () => {
  it('transport sous plafond : 100 % exonéré', () => {
    expect(splitTransport(20_000)).toEqual({ exoneree: 20_000, imposable: 0 })
  })

  it('transport pile au plafond', () => {
    expect(splitTransport(PLAFOND_EXONERATION_TRANSPORT)).toEqual({
      exoneree: PLAFOND_EXONERATION_TRANSPORT,
      imposable: 0,
    })
  })

  it('transport au-delà du plafond : split', () => {
    const r = splitTransport(50_000)
    expect(r.exoneree).toBe(PLAFOND_EXONERATION_TRANSPORT)
    expect(r.imposable).toBe(50_000 - PLAFOND_EXONERATION_TRANSPORT)
  })

  it('repas sous plafond : 100 % exonéré', () => {
    expect(splitRepas(20_000)).toEqual({ exoneree: 20_000, imposable: 0 })
  })

  it('repas au-delà : split', () => {
    const r = splitRepas(50_000)
    expect(r.exoneree).toBe(PLAFOND_EXONERATION_REPAS)
    expect(r.imposable).toBe(50_000 - PLAFOND_EXONERATION_REPAS)
  })

  it('montant zéro renvoie 0/0', () => {
    expect(splitTransport(0)).toEqual({ exoneree: 0, imposable: 0 })
    expect(splitRepas(0)).toEqual({ exoneree: 0, imposable: 0 })
  })
})
