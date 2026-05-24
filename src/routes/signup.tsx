import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowRight, Lock, Mail, User as UserIcon, Sparkles, AlertCircle } from 'lucide-react'
import { signUp } from '../lib/auth-client'

export const Route = createFileRoute('/signup')({
  component: SignupPage,
})

function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error: err } = await signUp.email({
        email,
        password,
        name,
      })
      if (err) {
        setError(err.message ?? 'Inscription impossible')
        setLoading(false)
        return
      }
      // Auto-signin par défaut côté Better Auth → rediriger vers onboarding
      window.location.href = '/onboarding'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'inscription')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-serif text-xl font-semibold tracking-tight inline-block mb-12">ADC <span className="em-serif">Paie</span></Link>
          <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Créer un compte</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Démarrez votre <span className="em-serif">espace</span>.</h1>
          <p className="mt-3 text-sm text-n-700">Accès gratuit à la plateforme pendant la phase beta.</p>

          {error && (
            <div className="mt-6 px-3 py-2.5 bg-red-50 border border-red-200 rounded-sm flex items-start gap-2 text-sm text-red-800">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="name" className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold">Nom complet</label>
              <div className="mt-2 flex items-center gap-2 border border-n-300 px-3 h-11 rounded-sm focus-within:border-orange transition-colors">
                <UserIcon className="w-4 h-4 text-n-500" />
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  type="text"
                  autoComplete="name"
                  placeholder="Marcel Djedje-li"
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold">E-mail professionnel</label>
              <div className="mt-2 flex items-center gap-2 border border-n-300 px-3 h-11 rounded-sm focus-within:border-orange transition-colors">
                <Mail className="w-4 h-4 text-n-500" />
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="vous@entreprise.ci"
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
                  autoComplete="new-password"
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
              <p className="mt-1.5 text-[10px] text-n-500">8 caractères minimum.</p>
            </div>
            <button
              type="submit"
              disabled={loading || !name || !email || password.length < 8}
              className="w-full bg-orange text-white h-11 text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors flex items-center justify-center gap-2 rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Création…' : <>Créer mon compte <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-xs text-n-500 text-center">
            Déjà un compte ? <Link to="/login" className="text-orange font-semibold hover:underline">Me connecter</Link>
          </p>
          <p className="mt-2 text-[11px] text-center text-n-400">
            En créant un compte, vous acceptez nos <Link to="/cgv" className="underline">CGV</Link> et notre <Link to="/confidentialite" className="underline">politique de confidentialité</Link>.
          </p>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 relative text-white items-center justify-center p-12 overflow-hidden">
        <img src="/auth-side.png" alt="" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-br from-ink/85 via-ink/70 to-ink/85" />
        <div className="relative z-10 max-w-md">
          <Sparkles className="w-6 h-6 text-orange mb-6" />
          <p className="font-serif text-3xl italic font-medium leading-snug drop-shadow-lg">
            « En 15 minutes, votre paie mensuelle est faite. CNPS, ITS, IGR, CN — tout est calculé selon les barèmes 2026 officiels. »
          </p>
          <p className="mt-6 text-[11px] tracking-[0.22em] uppercase text-n-200 font-semibold">ADC Paie · Conformité Côte d'Ivoire</p>
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/15 pt-8">
            <div><p className="font-serif text-3xl font-semibold">100%</p><p className="text-[10px] uppercase tracking-wider text-orange mt-1 font-semibold">Conforme DGI</p></div>
            <div><p className="font-serif text-3xl font-semibold">CNPS</p><p className="text-[10px] uppercase tracking-wider text-orange mt-1 font-semibold">Bordereau auto</p></div>
            <div><p className="font-serif text-3xl font-semibold">ARTCI</p><p className="text-[10px] uppercase tracking-wider text-orange mt-1 font-semibold">Hash chain</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}
