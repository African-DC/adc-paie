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

export type Declaration = { id: string; type: 'État 301' | 'Bordereau CNPS' | 'DAS annuelle'; period: string; due: string; status: 'À soumettre' | 'En cours' | 'Soumis' | 'Validé'; amount: number }

export const DECLARATIONS: Declaration[] = [
  { id: 'd1', type: 'État 301', period: 'Novembre 2026', due: '2026-12-15', status: 'À soumettre', amount: 1248500 },
  { id: 'd2', type: 'Bordereau CNPS', period: 'Novembre 2026', due: '2026-12-15', status: 'En cours', amount: 1857200 },
  { id: 'd3', type: 'État 301', period: 'Octobre 2026', due: '2026-11-15', status: 'Soumis', amount: 1192800 },
  { id: 'd4', type: 'Bordereau CNPS', period: 'Octobre 2026', due: '2026-11-15', status: 'Validé', amount: 1812400 },
  { id: 'd5', type: 'État 301', period: 'Septembre 2026', due: '2026-10-15', status: 'Validé', amount: 1178900 },
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

export function fcfa(n: number): string {
  return n.toLocaleString('fr-FR').replace(/,/g, ' ') + ' FCFA'
}

export function fcfaShort(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1000) return Math.round(n / 1000) + 'K'
  return String(n)
}

// Calculs paie ivoirien simplifiés
export function computePayslip(brut: number, kids = 0, married = false) {
  const cnps = brut * 0.063
  const baseAnnuelle = brut * 12 - cnps * 12 - brut * 12 * 0.15
  const parts = 1 + (married ? 0.5 : 0) + kids * 0.5
  const baseParPart = baseAnnuelle / parts
  let itsParPart = 0
  if (baseParPart > 600000) itsParPart += Math.min(baseParPart - 600000, 600000) * 0.1
  if (baseParPart > 1200000) itsParPart += Math.min(baseParPart - 1200000, 800000) * 0.2
  if (baseParPart > 2000000) itsParPart += (baseParPart - 2000000) * 0.25
  const its = (itsParPart * parts) / 12
  const igr = brut * 0.015
  const cn = brut * 0.015
  const net = brut - cnps - its - igr - cn
  const patron = brut * 0.17
  return { brut, cnps, its, igr, cn, net, patron, total: brut + patron }
}

export const TOTALS = (() => {
  const active = EMPLOYEES.filter((e) => e.status === 'active')
  const masseBrut = active.reduce((s, e) => s + e.brut, 0)
  const masseNet = active.reduce((s, e) => {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    return s + p.net
  }, 0)
  const charges = active.reduce((s, e) => s + e.brut * 0.17, 0)
  return { active: active.length, masseBrut, masseNet, charges }
})()
