import { describe, it, expect } from 'vitest'
import {
  computeCNPSRetraite,
  computeCNPSPrestationsFamiliales,
  computeCNPSMaternite,
  computeCNPSAT,
  computeAllocationsFamiliales,
  CMU_FORFAIT_SALARIE,
  CMU_FORFAIT_EMPLOYEUR,
  SMIG_2026,
} from '../baremes/cnps-2026'

describe('CNPS 2026', () => {
  it('SMIG 2026 = 75 000 FCFA', () => {
    expect(SMIG_2026).toBe(75_000)
  })

  it('CMU forfaitaire 500 + 500', () => {
    expect(CMU_FORFAIT_SALARIE).toBe(500)
    expect(CMU_FORFAIT_EMPLOYEUR).toBe(500)
  })

  it('CNPS retraite : 6,3 % salarié + 7,7 % employeur sous plafond', () => {
    const r = computeCNPSRetraite(500_000)
    expect(r.salarie).toBe(500_000 * 0.063)
    expect(r.employeur).toBe(500_000 * 0.077)
    expect(r.basePlafonnee).toBe(500_000)
  })

  it('CNPS retraite : plafond à 3 375 000 FCFA / mois', () => {
    const r = computeCNPSRetraite(5_000_000)
    expect(r.basePlafonnee).toBe(3_375_000)
    expect(r.salarie).toBe(3_375_000 * 0.063)
    expect(r.employeur).toBe(3_375_000 * 0.077)
  })

  it('CNPS prestations familiales : 5,75 % employeur sous plafond 70k', () => {
    expect(computeCNPSPrestationsFamiliales(100_000)).toBe(70_000 * 0.0575)
    expect(computeCNPSPrestationsFamiliales(50_000)).toBe(50_000 * 0.0575)
  })

  it('CNPS maternité : 0,75 % employeur sous plafond 70k', () => {
    expect(computeCNPSMaternite(100_000)).toBe(70_000 * 0.0075)
  })

  it('CNPS AT : taux paramétrable par secteur, plafonné dans [2 %, 5 %]', () => {
    expect(computeCNPSAT(100_000, 0.035)).toBe(70_000 * 0.035)
    expect(computeCNPSAT(100_000, 0.01)).toBe(70_000 * 0.02)
    expect(computeCNPSAT(100_000, 0.10)).toBe(70_000 * 0.05)
  })

  it('Allocations familiales : 7 500 / enfant, max 6 enfants', () => {
    expect(computeAllocationsFamiliales(0)).toBe(0)
    expect(computeAllocationsFamiliales(2)).toBe(15_000)
    expect(computeAllocationsFamiliales(6)).toBe(45_000)
    expect(computeAllocationsFamiliales(10)).toBe(45_000) // plafonné
  })
})
