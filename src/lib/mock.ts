export type Employee = {
  id: string
  firstName: string
  lastName: string
  matricule: string
  role: string
  contract: 'CDI' | 'CDD'
  brut: number
  status: 'active' | 'leave'
  family: { situation: 'célibataire' | 'marié(e)'; kids: number }
  joinedAt: string
}

export const EMPLOYEES: Employee[] = [
  { id: '1', firstName: 'Aïcha', lastName: 'Koné', matricule: 'CI-04812039', role: 'Directrice Générale', contract: 'CDI', brut: 850000, status: 'active', family: { situation: 'marié(e)', kids: 3 }, joinedAt: '2021-03-15' },
  { id: '2', firstName: 'Mamadou', lastName: 'Diabaté', matricule: 'CI-04812040', role: 'Comptable senior', contract: 'CDI', brut: 425000, status: 'active', family: { situation: 'marié(e)', kids: 2 }, joinedAt: '2021-09-01' },
  { id: '3', firstName: 'Fatou', lastName: 'Traoré', matricule: 'CI-04812041', role: 'Responsable RH', contract: 'CDI', brut: 380000, status: 'active', family: { situation: 'célibataire', kids: 0 }, joinedAt: '2022-01-10' },
  { id: '4', firstName: 'Kouassi', lastName: 'Brou', matricule: 'CI-04812042', role: 'Développeur full-stack', contract: 'CDI', brut: 520000, status: 'active', family: { situation: 'célibataire', kids: 0 }, joinedAt: '2022-06-20' },
  { id: '5', firstName: 'Yao', lastName: 'Kouamé', matricule: 'CI-04812043', role: 'Commercial terrain', contract: 'CDI', brut: 280000, status: 'active', family: { situation: 'marié(e)', kids: 1 }, joinedAt: '2022-08-15' },
  { id: '6', firstName: 'Adama', lastName: 'Bamba', matricule: 'CI-04812044', role: 'Chef de projet', contract: 'CDI', brut: 590000, status: 'active', family: { situation: 'marié(e)', kids: 2 }, joinedAt: '2023-02-01' },
  { id: '7', firstName: 'Ramatou', lastName: 'Cissé', matricule: 'CI-04812045', role: 'Assistante de direction', contract: 'CDI', brut: 245000, status: 'active', family: { situation: 'célibataire', kids: 0 }, joinedAt: '2023-04-12' },
  { id: '8', firstName: 'Sékou', lastName: 'Touré', matricule: 'CI-04812046', role: 'Caissier principal', contract: 'CDI', brut: 200000, status: 'active', family: { situation: 'marié(e)', kids: 4 }, joinedAt: '2023-05-22' },
  { id: '9', firstName: 'Awa', lastName: 'Diallo', matricule: 'CI-04812047', role: 'Designer UI/UX', contract: 'CDI', brut: 460000, status: 'active', family: { situation: 'célibataire', kids: 0 }, joinedAt: '2023-09-04' },
  { id: '10', firstName: 'Ibrahim', lastName: 'Camara', matricule: 'CI-04812048', role: 'Agent de maintenance', contract: 'CDI', brut: 165000, status: 'active', family: { situation: 'marié(e)', kids: 2 }, joinedAt: '2023-11-15' },
  { id: '11', firstName: 'Bintou', lastName: 'Ouattara', matricule: 'CI-04812049', role: 'Chargée de clientèle', contract: 'CDD', brut: 220000, status: 'active', family: { situation: 'célibataire', kids: 1 }, joinedAt: '2024-03-01' },
  { id: '12', firstName: 'Moussa', lastName: 'Sangaré', matricule: 'CI-04812050', role: 'Data Analyst', contract: 'CDI', brut: 510000, status: 'active', family: { situation: 'célibataire', kids: 0 }, joinedAt: '2024-06-15' },
  { id: '13', firstName: 'Kadidja', lastName: 'Bakayoko', matricule: 'CI-04812051', role: 'Responsable Marketing', contract: 'CDI', brut: 480000, status: 'active', family: { situation: 'marié(e)', kids: 1 }, joinedAt: '2024-09-02' },
  { id: '14', firstName: 'Ousmane', lastName: 'Coulibaly', matricule: 'CI-04812052', role: 'Stagiaire développeur', contract: 'CDD', brut: 120000, status: 'active', family: { situation: 'célibataire', kids: 0 }, joinedAt: '2025-09-15' },
  { id: '15', firstName: 'Nadège', lastName: 'Yapo', matricule: 'CI-04812053', role: 'Chargée communication', contract: 'CDI', brut: 320000, status: 'leave', family: { situation: 'marié(e)', kids: 2 }, joinedAt: '2024-01-08' },
]

export type Declaration = { id: string; type: 'ITS mensuel' | 'Bordereau CNPS' | 'DISA + DASC annuels' | 'État 301 annuel'; period: string; due: string; status: 'À soumettre' | 'En cours' | 'Soumis' | 'Validé'; amount: number }

export const DECLARATIONS: Declaration[] = [
  // Annuelles 2026 (exercice 2025)
  { id: 'a1', type: 'DISA + DASC annuels', period: 'Exercice 2025', due: '2026-03-31', status: 'Validé', amount: 21240000 },
  { id: 'a2', type: 'État 301 annuel', period: 'Exercice 2025', due: '2026-05-30', status: 'Validé', amount: 14982000 },
  // Mensuelles 2026
  { id: 'd1', type: 'ITS mensuel', period: 'Novembre 2026', due: '2026-12-15', status: 'À soumettre', amount: 1248500 },
  { id: 'd2', type: 'Bordereau CNPS', period: 'Novembre 2026', due: '2026-12-15', status: 'En cours', amount: 1857200 },
  { id: 'd3', type: 'ITS mensuel', period: 'Octobre 2026', due: '2026-11-15', status: 'Soumis', amount: 1192800 },
  { id: 'd4', type: 'Bordereau CNPS', period: 'Octobre 2026', due: '2026-11-15', status: 'Validé', amount: 1812400 },
  { id: 'd5', type: 'ITS mensuel', period: 'Septembre 2026', due: '2026-10-15', status: 'Validé', amount: 1178900 },
  { id: 'd6', type: 'Bordereau CNPS', period: 'Septembre 2026', due: '2026-10-15', status: 'Validé', amount: 1798300 },
]

export const TENANT = {
  name: 'Sahel Industries SARL',
  ifu: 'CI-2104-A-098456',
  cnps: '048120',
  sector: 'Agro-industrie',
  taux_at: 3.5,
  city: 'Abidjan, Plateau',
}

export const CURRENT_USER = { name: 'Marcel Djedje-li', role: 'Administrateur', initials: 'MD' }

// Calculs paie : importés depuis le package @adc/payroll-engine (engine durci v0.1.0)
// Voir packages/payroll-engine/ pour les barèmes 2026 et tests unitaires.
import {
  fcfa as engineFcfa,
  fcfaShort as engineFcfaShort,
  computePayslipLegacy,
  computeAncienneteMonths as engineComputeAncienneteMonths,
  computeAnciennetePct as engineComputeAnciennetePct,
} from '@adc/payroll-engine'

export const fcfa = engineFcfa
export const fcfaShort = engineFcfaShort

const REFERENCE_DATE = new Date('2026-11-30')

export function computeAncienneteMonths(joinedAt: string): number {
  return engineComputeAncienneteMonths(joinedAt, REFERENCE_DATE)
}

export const computeAnciennetePct = engineComputeAnciennetePct

export function computePayslip(brut: number, kids = 0, married = false, joinedAt = '2025-01-01') {
  return computePayslipLegacy(brut, kids, married, joinedAt, { year: 2026, month: 11 })
}

export const TOTALS = (() => {
  const active = EMPLOYEES.filter((e) => e.status === 'active')
  const masseBrut = active.reduce((s, e) => s + e.brut, 0)
  const masseNet = active.reduce((s, e) => {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)', e.joinedAt)
    return s + p.net
  }, 0)
  const charges = active.reduce((s, e) => s + e.brut * 0.17, 0)
  return { active: active.length, masseBrut, masseNet, charges }
})()
