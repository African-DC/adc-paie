import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowRight, Lock, Mail, Sparkles, AlertCircle } from 'lucide-react'
import { z } from 'zod'
import { signIn } from '../lib/auth-client'

function mapLoginError(err: unknown): string {
  const e = err as { code?: string; message?: string; status?: number }
  if (e?.code === 'INVALID_EMAIL_OR_PASSWORD' || e?.message === 'Invalid email or password') return 'E-mail ou mot de passe incorrect.'
  if (e?.code === 'EMAIL_NOT_VERIFIED') return 'Votre adresse e-mail n\'est pas vérifiée.'
  if (e?.code === 'USER_NOT_FOUND') return 'Aucun compte ne correspond à cet e-mail.'
  if (e?.status === 429 || e?.message?.toLowerCase().includes('rate')) return 'Trop de tentatives, réessayez dans quelques minutes.'
  if (e?.status && e.status >= 500) return 'Service temporairement indisponible, réessayez dans un instant.'
  if (e?.message && !/HTTPError|Error|Status/.test(e.message)) return e.message
  return 'Connexion impossible, vérifiez vos identifiants.'
}

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
  error: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  component: LoginPage,
})

function LoginPage() {
  const nav = useNavigate()
  const search = useSearch({ from: '/login' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(search.error ?? null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error: err } = await signIn.email({
        email,
        password,
        rememberMe: true,
      })
      if (err) {
        setError(mapLoginError(err))
        setLoading(false)
        return
      }
      // Pattern obligatoire avec Convex + Better Auth : reload pour propager JWT
      window.location.href = search.redirect ?? '/app'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-serif text-xl font-semibold tracking-tight inline-block mb-12">ADC <span className="em-serif">Paie</span></Link>
          <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Espace partenaire</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Connectez-vous à votre <span className="em-serif">espace</span>.</h1>
          <p className="mt-3 text-sm text-n-700">Accédez à votre paie, vos déclarations et vos salariés.</p>

          {error && (
            <div className="mt-6 px-3 py-2.5 bg-red-50 border border-red-200 rounded-sm flex items-start gap-2 text-sm text-red-800">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold">E-mail</label>
              <div className="mt-2 flex items-center gap-2 border border-n-300 px-3 h-11 rounded-sm focus-within:border-orange transition-colors">
                <Mail className="w-4 h-4 text-n-500" />
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  autoComplete="email"
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold">Mot de passe</label>
              <div className="mt-2 flex items-center gap-2 border border-n-300 px-3 h-11 rounded-sm focus-within:border-orange transition-colors">
                <Lock className="w-4 h-4 text-n-500" />
                <input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type="password"
                  minLength={8}
                  autoComplete="current-password"
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !email || password.length < 8}
              className="w-full bg-orange text-white h-11 text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors flex items-center justify-center gap-2 rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion…' : <>Se connecter <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-xs text-n-500 text-center">
            Pas encore de compte ? <Link to="/signup" className="text-orange font-semibold hover:underline">Créer mon espace</Link>
          </p>
          <p className="mt-2 text-[11px] text-center text-n-400">8 caractères minimum pour le mot de passe</p>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 ink-glow text-white items-center justify-center p-12 relative">
        <div className="relative z-10 max-w-md">
          <Sparkles className="w-6 h-6 text-orange mb-6" />
          <p className="font-serif text-3xl italic font-medium leading-snug">
            « Bulletins, déclarations, paiements. Tout en quinze minutes par mois, plus jamais trois jours. »
          </p>
          <p className="mt-6 text-[11px] tracking-[0.22em] uppercase text-n-400 font-semibold">Pilote interne · novembre 2026</p>
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/15 pt-8">
            <div><p className="font-serif text-3xl font-semibold">10</p><p className="text-[10px] uppercase tracking-wider text-orange mt-1 font-semibold">Écoles en prod</p></div>
            <div><p className="font-serif text-3xl font-semibold">50+</p><p className="text-[10px] uppercase tracking-wider text-orange mt-1 font-semibold">Projets livrés</p></div>
            <div><p className="font-serif text-3xl font-semibold">10+</p><p className="text-[10px] uppercase tracking-wider text-orange mt-1 font-semibold">Experts</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}
