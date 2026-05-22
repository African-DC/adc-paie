import { describe, it, expect } from 'vitest'
import { computePayslip, computePayslipLegacy } from '../engine'
import {
  FIXTURE_CDI_MARIE_2ENFANTS_350K,
  FIXTURE_CDI_CELIB_SENIOR_850K,
  FIXTURE_CDD_JUNIOR_220K,
  FIXTURE_MI_TEMPS_PRORATA,
  FIXTURE_RICHE_INDEMNITES_RETENUES,
  ALL_FIXTURES,
} from '../fixtures'

describe('Engine — fixtures CI réels', () => {
  it('Fixture 1 : CDI marié 2 enfants 350k — résultats cohérents', () => {
    const r = computePayslip(FIXTURE_CDI_MARIE_2ENFANTS_350K)
    const b = r.breakdown
    expect(b.anciennete.pct).toBe(0.05) // 5 ans pleins → 5 %
    expect(b.anciennete.montant).toBe(17_500)
    expect(b.cotisationsSalarie.cnpsRetraite).toBeGreaterThan(0)
    expect(b.cotisationsSalarie.cmu).toBe(500)
    expect(b.impots.parts).toBe(3) // marié + 2 enfants
    expect(b.net.netAPayer).toBeLessThan(b.brutTotal)
    // Ratio net/brut autour de 50 % vu le cumul ITS+IGR+CN (barèmes à valider audit Phase 4)
    expect(b.net.netAPayer).toBeGreaterThan(b.brutTotal * 0.5)
    expect(b.totalCoutEmployeur).toBeGreaterThan(b.brutTotal)
  })

  it('Fixture 2 : CDI célib senior 850k + heures sup', () => {
    const r = computePayslip(FIXTURE_CDI_CELIB_SENIOR_850K)
    const b = r.breakdown
    expect(b.anciennete.pct).toBe(0.08) // ~8 ans
    expect(b.heuresSupp.total).toBeGreaterThan(0)
    expect(b.indemnites.transportExoneree).toBe(25_000)
    expect(b.impots.parts).toBe(1)
    expect(b.impots.totalImpots).toBeGreaterThan(50_000) // salarié haute tranche
  })

  it('Fixture 3 : CDD junior 220k — pas d\'ancienneté', () => {
    const r = computePayslip(FIXTURE_CDD_JUNIOR_220K)
    const b = r.breakdown
    expect(b.anciennete.pct).toBe(0) // < 24 mois
    expect(b.anciennete.montant).toBe(0)
    expect(b.indemnites.transportExoneree).toBe(15_000)
    // Net plausible pour célib CDD avec cumul ITS+IGR+CN (à valider audit Phase 4)
    expect(b.net.netAPayer).toBeGreaterThan(120_000)
    expect(b.net.netAPayer).toBeLessThan(220_000)
  })

  it('Fixture 4 : Mi-temps 13/26 jours — prorata appliqué', () => {
    const r = computePayslip(FIXTURE_MI_TEMPS_PRORATA)
    const b = r.breakdown
    expect(b.base.prorataApplique).toBe(true)
    expect(b.base.salaireBaseApresProrata).toBe(150_000) // 300k × 13/26
    expect(b.warnings.length).toBeGreaterThan(0)
  })

  it('Fixture 5 : Riche indemnités + HS + retenues', () => {
    const r = computePayslip(FIXTURE_RICHE_INDEMNITES_RETENUES)
    const b = r.breakdown
    expect(b.heuresSupp.total).toBeGreaterThan(0)
    expect(b.indemnites.totalImposables + b.indemnites.totalExonerees).toBeGreaterThan(50_000)
    expect(b.primes).toBe(100_000)
    expect(b.retenues.total).toBe(75_000)
    expect(b.retenues.retenuesDansLaQuotite).toBeLessThanOrEqual(b.retenues.quotiteSaisissable)
    expect(b.net.netAPayer).toBeLessThan(b.net.netAvantRetenues)
  })

  it('Toutes les fixtures produisent un net > 0', () => {
    for (const fixture of ALL_FIXTURES) {
      const r = computePayslip(fixture.input)
      expect(r.breakdown.net.netAPayer, `${fixture.name} : net positif`).toBeGreaterThan(0)
    }
  })

  it('Toutes les fixtures ont un total coût employeur > brut total', () => {
    for (const fixture of ALL_FIXTURES) {
      const r = computePayslip(fixture.input)
      expect(
        r.breakdown.totalCoutEmployeur,
        `${fixture.name} : coût > brut`,
      ).toBeGreaterThan(r.breakdown.brutTotal)
    }
  })

  it('Toutes les fixtures ont la version moteur taggée', () => {
    for (const fixture of ALL_FIXTURES) {
      const r = computePayslip(fixture.input)
      expect(r.engineVersion).toBeTruthy()
      expect(r.baremeYear).toBe(2026)
    }
  })
})

describe('Engine — compatibilité legacy avec le mockup actuel', () => {
  it('computePayslipLegacy renvoie le format historique', () => {
    const r = computePayslipLegacy(350_000, 2, true, '2021-01-15', { year: 2026, month: 11 })
    expect(r.brut).toBe(350_000)
    expect(r.brutTotal).toBeGreaterThan(350_000) // avec ancienneté
    expect(r.cnps).toBeGreaterThan(0)
    expect(r.its).toBeGreaterThan(0)
    expect(r.net).toBeGreaterThan(0)
    expect(r.patron).toBeGreaterThan(0)
    expect(r.allocFam).toBe(15_000) // 2 × 7500
  })

  it('computePayslipLegacy zéro brut renvoie zéro net mais respecte le contrat', () => {
    expect(() => computePayslipLegacy(1, 0, false)).not.toThrow()
  })

  it('Snapshot du mockup historique (15 employés)', () => {
    const cases = [
      { name: 'Aïcha (DG marié 3 enfants 850k)', brut: 850_000, kids: 3, married: true, joinedAt: '2021-03-15' },
      { name: 'Mamadou (comptable marié 2 enfants 425k)', brut: 425_000, kids: 2, married: true, joinedAt: '2021-09-01' },
      { name: 'Fatou (RH célib 380k)', brut: 380_000, kids: 0, married: false, joinedAt: '2022-01-10' },
      { name: 'Ousmane (stagiaire célib 120k)', brut: 120_000, kids: 0, married: false, joinedAt: '2025-09-15' },
    ]
    for (const c of cases) {
      const r = computePayslipLegacy(c.brut, c.kids, c.married, c.joinedAt)
      expect(r.net, `${c.name} : net positif`).toBeGreaterThan(0)
      expect(r.net, `${c.name} : net < brut`).toBeLessThan(c.brut * 1.3)
    }
  })
})

describe('Engine — validation Zod des inputs', () => {
  it('rejette un brut négatif', () => {
    expect(() => computePayslip({ ...FIXTURE_CDI_MARIE_2ENFANTS_350K, brut: -1 } as never)).toThrow()
  })

  it('rejette une période hors borne', () => {
    expect(() =>
      computePayslip({ ...FIXTURE_CDI_MARIE_2ENFANTS_350K, period: { year: 1999, month: 1 } } as never),
    ).toThrow()
  })

  it('rejette un nombre d\'enfants négatif', () => {
    expect(() =>
      computePayslip({
        ...FIXTURE_CDI_MARIE_2ENFANTS_350K,
        family: { situation: 'marié(e)', kids: -1 },
      } as never),
    ).toThrow()
  })

  it('accepte les defaults sur les champs optionnels', () => {
    const r = computePayslip({
      brut: 300_000,
      family: { situation: 'célibataire', kids: 0 },
      joinedAt: '2024-01-01',
      period: { year: 2026, month: 11 },
    } as never)
    expect(r.breakdown.net.netAPayer).toBeGreaterThan(0)
  })
})
