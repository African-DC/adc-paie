type BetterAuthError = {
  code?: string
  message?: string
  status?: number
  statusCode?: number
}

const ERROR_MAP: Record<string, string> = {
  CONFLICT: 'Ce slug est déjà utilisé, choisissez-en un autre',
  UNAUTHORIZED: 'Session expirée, reconnectez-vous',
  FORBIDDEN: 'Vous avez atteint la limite de 5 organisations',
  BAD_REQUEST: 'Données invalides, vérifiez le formulaire',
  VALIDATION_ERROR: 'Format invalide, vérifiez le nom et le slug',
}

const MESSAGE_PATTERNS: Array<{ pattern: RegExp; fr: string }> = [
  { pattern: /slug.*(taken|exist|conflict)/i, fr: 'Ce slug est déjà utilisé, choisissez-en un autre' },
  { pattern: /slug.*(invalid|format)/i, fr: 'Slug invalide, utilisez lettres minuscules, chiffres et tirets' },
  { pattern: /organization.*(limit|max)/i, fr: 'Vous avez atteint la limite de 5 organisations' },
  { pattern: /unauthorized|not authenticated|session/i, fr: 'Session expirée, reconnectez-vous' },
  { pattern: /name.*(invalid|required|short)/i, fr: 'Raison sociale invalide ou trop courte' },
]

export function mapOrgCreateError(raw: unknown): string {
  console.error('[org-create-error]', raw)
  const err = raw as BetterAuthError | Error | null | undefined
  if (!err) return 'Création impossible, réessayez'

  const code = (err as BetterAuthError).code
  if (code && ERROR_MAP[code]) return ERROR_MAP[code]

  const message = (err as BetterAuthError).message ?? (err as Error).message
  if (message) {
    for (const { pattern, fr } of MESSAGE_PATTERNS) {
      if (pattern.test(message)) return fr
    }
  }

  return 'Création impossible, réessayez ou contactez le support'
}

export function debugErrorString(raw: unknown): string {
  if (!raw) return 'no-error'
  try {
    const err = raw as BetterAuthError
    const parts = [
      err.code && `code=${err.code}`,
      err.status && `status=${err.status}`,
      err.statusCode && `statusCode=${err.statusCode}`,
      err.message && `msg="${err.message}"`,
    ].filter(Boolean)
    if (parts.length > 0) return parts.join(' · ')
    return JSON.stringify(raw).slice(0, 200)
  } catch {
    return String(raw).slice(0, 200)
  }
}
