import { useState } from 'react'
import { X, UserPlus, Mail, ShieldCheck } from 'lucide-react'
import { authClient } from '../lib/auth-client'
import { store } from '../lib/store'

type Props = { open: boolean; onClose: () => void }

const ROLES = [
  { value: 'admin', label: 'Administrateur', desc: 'Accès complet : paie, salariés, déclarations, réglages' },
  { value: 'member', label: 'Membre', desc: 'Accès lecture + actions limitées · idéal comptable externe' },
] as const

export function InviteMemberModal({ open, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error: err } = await authClient.organization.inviteMember({
        email: email.trim(),
        role,
      })
      if (err) {
        setError(err.message ?? 'Invitation impossible. Vérifiez l\'email.')
        setLoading(false)
        return
      }
      store.toast(`Invitation envoyée à ${email}`, 'success')
      setEmail('')
      setRole('member')
      setLoading(false)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-sm shadow-2xl border border-n-200" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-n-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-orange" />
            <h2 className="font-serif text-lg font-semibold tracking-tight">Inviter un collaborateur</h2>
          </div>
          <button onClick={onClose} aria-label="Fermer" className="w-8 h-8 hover:bg-n-100 rounded-sm inline-flex items-center justify-center">
            <X className="w-4 h-4 text-n-500" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <p className="text-sm text-n-700">
            Invitez votre comptable, RH ou associé. Ils recevront un e-mail pour rejoindre votre espace ADC Paie.
          </p>

          {error && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-sm text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="invite-email" className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold">E-mail</label>
            <div className="mt-2 flex items-center gap-2 border border-n-300 px-3 h-11 rounded-sm focus-within:border-orange transition-colors">
              <Mail className="w-4 h-4 text-n-500" />
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="comptable@cabinet.ci"
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold mb-2">Rôle</p>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <label key={r.value} className={`flex items-start gap-3 p-3 border rounded-sm cursor-pointer transition-colors ${role === r.value ? 'border-orange bg-orange-tint/30' : 'border-n-200 hover:border-n-300'}`}>
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="mt-1 accent-orange"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm flex items-center gap-1.5">
                      {r.value === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-orange" />}
                      {r.label}
                    </p>
                    <p className="text-[11px] text-n-600 mt-0.5 leading-relaxed">{r.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 h-10 text-sm text-n-700 hover:text-ink transition-colors">
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !email}
              className="bg-orange text-white px-5 h-10 text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors flex items-center gap-2 rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi…' : <>Envoyer l'invitation <UserPlus className="w-4 h-4" /></>}
            </button>
          </div>

          <p className="text-[11px] text-n-500 italic pt-2 border-t border-n-100">
            L'invitation expire après 7 jours. Le collaborateur recevra un lien pour créer son compte et rejoindre <strong>votre espace</strong>.
          </p>
        </form>
      </div>
    </div>
  )
}
