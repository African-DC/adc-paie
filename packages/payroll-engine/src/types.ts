import { z } from 'zod'

export const SituationFamilialeSchema = z.enum(['célibataire', 'marié(e)', 'divorcé(e)', 'veuf/veuve'])
export type SituationFamiliale = z.infer<typeof SituationFamilialeSchema>

export const ContractTypeSchema = z.enum(['CDI', 'CDD', 'Stage', 'Apprentissage'])
export type ContractType = z.infer<typeof ContractTypeSchema>

export const FamilySchema = z.object({
  situation: SituationFamilialeSchema,
  kids: z.number().int().min(0).max(20),
})
export type Family = z.infer<typeof FamilySchema>

export const HeuresSuppSchema = z.object({
  jour: z.number().min(0).default(0),
  nuit: z.number().min(0).default(0),
  dimanche: z.number().min(0).default(0),
  ferie: z.number().min(0).default(0),
})
export type HeuresSupp = z.infer<typeof HeuresSuppSchema>

export const IndemnitesSchema = z.object({
  transport: z.number().min(0).default(0),
  logement: z.number().min(0).default(0),
  repas: z.number().min(0).default(0),
  fonction: z.number().min(0).default(0),
  autres: z.number().min(0).default(0),
})
export type Indemnites = z.infer<typeof IndemnitesSchema>

export const RetenuesSchema = z.object({
  avances: z.number().min(0).default(0),
  cessions: z.number().min(0).default(0),
  saisies: z.number().min(0).default(0),
  autres: z.number().min(0).default(0),
})
export type Retenues = z.infer<typeof RetenuesSchema>

export const PayslipInputSchema = z.object({
  brut: z.number().int().positive(),
  family: FamilySchema,
  joinedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period: z.object({
    year: z.number().int().min(2020).max(2100),
    month: z.number().int().min(1).max(12),
  }),
  joursTravailles: z.number().min(0).max(31).default(26),
  joursOuvres: z.number().min(0).max(31).default(26),
  heuresSupp: HeuresSuppSchema.default({ jour: 0, nuit: 0, dimanche: 0, ferie: 0 }),
  indemnites: IndemnitesSchema.default({ transport: 0, logement: 0, repas: 0, fonction: 0, autres: 0 }),
  retenues: RetenuesSchema.default({ avances: 0, cessions: 0, saisies: 0, autres: 0 }),
  primes: z.number().min(0).default(0),
  tauxAT: z.number().min(0).max(0.1).default(0.025),
  heuresHebdo: z.number().min(0).max(60).default(40),
})
export type PayslipInput = z.infer<typeof PayslipInputSchema>

export type PayslipBreakdown = {
  base: {
    brutMensuel: number
    joursPayes: number
    joursOuvres: number
    prorataApplique: boolean
    salaireBaseApresProrata: number
  }
  anciennete: {
    moisAnciennete: number
    pct: number
    montant: number
  }
  heuresSupp: {
    tauxHoraire: number
    montantJour: number
    montantNuit: number
    montantDimanche: number
    montantFerie: number
    total: number
  }
  indemnites: {
    transportExoneree: number
    transportImposable: number
    logement: number
    repas: number
    fonction: number
    autres: number
    totalExonerees: number
    totalImposables: number
  }
  primes: number
  brutTotal: number
  brutSocial: number
  brutFiscal: number
  cotisationsSalarie: {
    cnpsRetraite: number
    cmu: number
    total: number
  }
  cotisationsEmployeur: {
    cnpsRetraite: number
    cnpsPrestationsFamiliales: number
    cnpsMaternite: number
    cnpsAT: number
    cmu: number
    fdfp: number
    total: number
  }
  impots: {
    abattement: number
    baseITSAnnuelle: number
    parts: number
    baseParPart: number
    its: number
    igr: number
    cn: number
    totalImpots: number
  }
  retenues: {
    avances: number
    cessions: number
    saisies: number
    autres: number
    total: number
    quotiteSaisissable: number
    retenuesDansLaQuotite: number
  }
  net: {
    netImposable: number
    netAvantRetenues: number
    netAPayer: number
  }
  totalCoutEmployeur: number
  warnings: string[]
}

export type PayslipResult = {
  input: PayslipInput
  breakdown: PayslipBreakdown
  computedAt: string
  engineVersion: string
  baremeYear: number
}

export const ENGINE_VERSION = '0.1.0'
