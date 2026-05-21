import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowRight, Lock, Mail, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  const nav = useNavigate()
  const [loading, setLoading] = useState(false)
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => nav({ to: '/app' }), 800)
  }
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-serif text-xl font-semibold tracking-tight inline-block mb-12">ADC <span className="em-serif">Paie</span></Link>
          <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Espace partenaire</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Connectez-vous à votre <span className="em-serif">espace</span>.</h1>
          <p className="mt-3 text-sm text-n-700">Accédez à votre paie, vos déclarations et vos salariés.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold">E-mail</label>
              <div className="mt-2 flex items-center gap-2 border border-n-300 px-3 h-11 rounded-sm focus-within:border-orange transition-colors">
                <Mail className="w-4 h-4 text-n-500" />
                <input defaultValue="marcel@adc-paie.ci" required type="email" className="flex-1 bg-transparent outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold">Mot de passe</label>
              <div className="mt-2 flex items-center gap-2 border border-n-300 px-3 h-11 rounded-sm focus-within:border-orange transition-colors">
                <Lock className="w-4 h-4 text-n-500" />
                <input defaultValue="••••••••••" required type="password" className="flex-1 bg-transparent outline-none text-sm" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-orange text-white h-11 text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors flex items-center justify-center gap-2 rounded-sm disabled:opacity-60">
              {loading ? 'Connexion…' : <>Se connecter <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-xs text-n-500 text-center">
            Pas encore de compte ? <a href="mailto:africandigitconsulting@gmail.com" className="text-orange font-semibold hover:underline">Demander un accès beta</a>
          </p>
          <p className="mt-2 text-[11px] text-center text-n-400">Démo · entrez n'importe quel e-mail pour accéder à l'app</p>
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
