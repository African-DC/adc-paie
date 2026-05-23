import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowRight, Building2, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { useMutation } from 'convex/react'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import { convex } from '../lib/convex-client'
import { authClient, useSession } from '../lib/auth-client'
import { api } from '../../convex/_generated/api'
import { CONVENTIONS } from '../lib/store'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingRoot,
})

function OnboardingRoot() {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <OnboardingPage />
    </ConvexBetterAuthProvider>
  )
}

type FormState = {
  name: string
  slug: string
  ifu: string
  cnps: string
  sector: string
  tauxAT: string
  city: string
  convention: string
}

const SECTEURS = [
  'Agro-industrie',
  'BTP',
  'Banque & finance',
  'Commerce',
  'Industrie',
  'Mines & carrières',
  'Restauration & hôtellerie',
  'Services',
  'Tech & digital',
  'Transport & logistique',
  'Autre',
]

function OnboardingPage() {
  const session = useSession()
  const initSettings = useMutation(api.organizations.initOrgSettings)
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState<FormState>({
    name: '',
    slug: '',
    ifu: '',
    cnps: '',
    sector: 'Tech & digital',
    tauxAT: '2.5',
    city: 'Abidjan',
    convention: CONVENTIONS[0],
  })

  if (session.isPending) {
    return <div className="min-h-screen flex items-center justify-center text-n-500">Chargement…</div>
  }
  if (!session.data) {
    if (typeof window !== 'undefined') window.location.href = '/login'
    return null
  }

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48)

  const setName = (name: string) => {
    setForm((f) => ({ ...f, name, slug: f.slug || slugify(name) }))
  }

  const submitStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name.trim() || form.name.length < 2) {
      setError('Le nom de l\'entreprise est requis')
      return
    }
    const cleanedSlug = form.slug.replace(/^-+|-+$/g, '')
    if (cleanedSlug.length < 2) {
      setError('Le slug doit contenir au moins 2 caractères')
      return
    }
    if (!cleanedSlug.match(/^[a-z0-9-]+$/)) {
      setError('Le slug ne peut contenir que des lettres minuscules, chiffres et tirets')
      return
    }
    setLoading(true)
    try {
      const { error: err } = await authClient.organization.create({
        name: form.name.trim(),
        slug: cleanedSlug,
      })
      if (err) {
        const msg = err.message ?? (err as { code?: string }).code ?? JSON.stringify(err)
        setError(`Création impossible : ${msg}`)
        setLoading(false)
        return
      }
      // L'organisation créée devient automatiquement active (creatorRole = owner)
      setStep(2)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
      setLoading(false)
    }
  }

  const submitStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const tauxAT = parseFloat(form.tauxAT)
      if (Number.isNaN(tauxAT) || tauxAT < 2 || tauxAT > 5) {
        setError('Le taux Accidents du travail doit être entre 2 % et 5 %')
        setLoading(false)
        return
      }
      await initSettings({
        ifu: form.ifu.trim(),
        cnps: form.cnps.trim(),
        sector: form.sector,
        tauxAT: tauxAT / 100,
        city: form.city.trim(),
        convention: form.convention,
      })
      setDone(true)
      setLoading(false)
      setTimeout(() => {
        window.location.href = '/app'
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde')
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-n-50">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-orange mx-auto mb-6" />
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Espace <span className="em-serif">prêt</span>.</h1>
          <p className="mt-4 text-n-700">Redirection vers votre tableau de bord…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-n-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border border-n-200 rounded-sm shadow-sm">
        <div className="px-6 pt-6 pb-4 border-b border-n-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold">Étape {step} sur 2</p>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-orange' : 'bg-n-200'}`} />
              <span className={`w-2 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-orange' : 'bg-n-200'}`} />
            </div>
          </div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight inline-flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange" />
            {step === 1 ? 'Votre entreprise' : 'Identifiants légaux'}
          </h1>
          <p className="mt-2 text-sm text-n-700">
            {step === 1
              ? 'Donnez un nom à votre espace ADC Paie. Vous pourrez inviter votre équipe ensuite.'
              : 'IFU, CNPS et convention collective. Ces données figurent sur tous les bulletins.'}
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-sm flex items-start gap-2 text-sm text-red-800">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={submitStep1} className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold">Raison sociale</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                placeholder="Sahel Industries SARL"
                className="mt-2 w-full h-11 px-3 border border-n-300 rounded-sm text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
              />
            </div>
            <div>
              <label htmlFor="slug" className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold">Slug unique</label>
              <input
                id="slug"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                required
                pattern="[a-z0-9-]+"
                placeholder="sahel-industries"
                className="mt-2 w-full h-11 px-3 border border-n-300 rounded-sm text-sm font-mono focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
              />
              <p className="mt-1.5 text-[10px] text-n-500">Identifie votre espace dans les URLs. Lettres minuscules, chiffres et tirets uniquement.</p>
            </div>
            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-orange text-white px-5 h-11 text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors flex items-center gap-2 rounded-sm disabled:opacity-60"
              >
                {loading ? 'Création…' : <>Continuer <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitStep2} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ifu" className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold">IFU (DGI)</label>
                <input
                  id="ifu"
                  value={form.ifu}
                  onChange={(e) => setForm({ ...form, ifu: e.target.value })}
                  required
                  placeholder="CI-2104-A-098456"
                  className="mt-2 w-full h-11 px-3 border border-n-300 rounded-sm text-sm font-mono focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                />
              </div>
              <div>
                <label htmlFor="cnps" className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold">N° CNPS employeur</label>
                <input
                  id="cnps"
                  value={form.cnps}
                  onChange={(e) => setForm({ ...form, cnps: e.target.value })}
                  required
                  placeholder="048120"
                  className="mt-2 w-full h-11 px-3 border border-n-300 rounded-sm text-sm font-mono focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="sector" className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold">Secteur d'activité</label>
                <select
                  id="sector"
                  value={form.sector}
                  onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  className="mt-2 w-full h-11 px-3 border border-n-300 rounded-sm text-sm bg-white focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                >
                  {SECTEURS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="tauxAT" className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold">Taux AT (%)</label>
                <input
                  id="tauxAT"
                  type="number"
                  step="0.1"
                  min="2"
                  max="5"
                  value={form.tauxAT}
                  onChange={(e) => setForm({ ...form, tauxAT: e.target.value })}
                  required
                  className="mt-2 w-full h-11 px-3 border border-n-300 rounded-sm text-sm font-mono focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                />
                <p className="mt-1.5 text-[10px] text-n-500">Entre 2 % et 5 % selon votre secteur (décret CNPS).</p>
              </div>
            </div>
            <div>
              <label htmlFor="city" className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold">Ville</label>
              <input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
                placeholder="Abidjan, Plateau"
                className="mt-2 w-full h-11 px-3 border border-n-300 rounded-sm text-sm focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
              />
            </div>
            <div>
              <label htmlFor="convention" className="text-[10px] uppercase tracking-[0.22em] text-n-600 font-semibold">Convention collective applicable</label>
              <select
                id="convention"
                value={form.convention}
                onChange={(e) => setForm({ ...form, convention: e.target.value })}
                className="mt-2 w-full h-11 px-3 border border-n-300 rounded-sm text-sm bg-white focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
              >
                {CONVENTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className="mt-1.5 text-[10px] text-n-500">Mention obligatoire Art. 32.5 sur tous les bulletins de paie.</p>
            </div>
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-n-600 hover:text-ink inline-flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Retour
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-orange text-white px-5 h-11 text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors flex items-center gap-2 rounded-sm disabled:opacity-60"
              >
                {loading ? 'Création…' : <>Activer mon espace <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
