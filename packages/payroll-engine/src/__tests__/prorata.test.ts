import { describe, it, expect } from 'vitest'
import { computeProrata } from '../prorata'

describe('Prorata salarial', () => {
  it('aucun prorata si jours travaillés >= jours ouvrés', () => {
    const r = computeProrata(300_000, 26, 26)
    expect(r.salaireProrate).toBe(300_000)
    expect(r.prorataApplique).toBe(false)
  })

  it('demi-mois : 13 jours sur 26', () => {
    const r = computeProrata(300_000, 13, 26)
    expect(r.salaireProrate).toBe(150_000)
    expect(r.prorataApplique).toBe(true)
  })

  it('quart de mois : 6 jours sur 26', () => {
    const r = computeProrata(260_000, 6, 26)
    expect(r.salaireProrate).toBe(60_000)
    expect(r.prorataApplique).toBe(true)
  })

  it('0 jour ouvré renvoie 0', () => {
    const r = computeProrata(300_000, 26, 0)
    expect(r.salaireProrate).toBe(0)
    expect(r.prorataApplique).toBe(false)
  })

  it('plus de jours travaillés que ouvrés : pas de prime, juste plein salaire', () => {
    const r = computeProrata(300_000, 30, 26)
    expect(r.salaireProrate).toBe(300_000)
    expect(r.prorataApplique).toBe(false)
  })
})
