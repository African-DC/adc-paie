import { useState, useMemo } from 'react'
import { X, Plus, Clock, Coins, Sparkles, Trash2 } from 'lucide-react'
import { type Employee, fcfa } from '../lib/mock'
import { store } from '../lib/store'

// Majorations légales CI — Décret MEPS 2017-017
// HS jour 41-46h : +15 % | HS jour >46h : +50 %
// HS nuit (21h-5h) : +75 % | HS nuit + dimanche/férié : +100 %
// HS dimanche/férié jour : +75 %
export type Complements = {
  hsJour15: number        // 41-46h : +15 %
  hsJour50: number        // >46h : +50 %
  hsNuit: number          // nuit 21h-5h : +75 %
  hsDimanche: number      // dimanche/férié jour : +75 %
  hsNuitDimanche: number  // nuit + dimanche/férié : +100 %
  transport: number       // indemnité transport (plafond non imposable 25 000)
  repas: number           // panier-repas (exonéré dans limite 10 % rém. totale)
  deplacement: number     // indemnité déplacement (sur justificatifs)
  primes: { label: string; amount: number }[]
}

const ZERO: Complements = { hsJour15: 0, hsJour50: 0, hsNuit: 0, hsDimanche: 0, hsNuitDimanche: 0, transport: 0, repas: 0, deplacement: 0, primes: [] }

export function computeComplementsAmount(e: Employee, c: Complements): number {
  const tauxHoraire = e.brut / 173.33 // 173,33 h légales mensuelles CI (40h × 52/12)
  const hs = tauxHoraire * c.hsJour15 * 1.15
        + tauxHoraire * c.hsJour50 * 1.50
        + tauxHoraire * c.hsNuit * 1.75
        + tauxHoraire * c.hsDimanche * 1.75
        + tauxHoraire * c.hsNuitDimanche * 2.00
  const indemnites = c.transport + c.repas + c.deplacement
  const primesTotal = c.primes.reduce((s, p) => s + (p.amount || 0), 0)
  return Math.round(hs + indemnites + primesTotal)
}

export function PayrollComplementsModal({ open, employee, current, onClose, onSave }: {
  open: boolean; employee: Employee; current?: Complements; onClose: () => void; onSave: (c: Complements) => void
}) {
  const [c, setC] = useState<Complements>(current || ZERO)
  const tauxHoraire = useMemo(() => employee.brut / 173.33, [employee.brut])
  const totalAdd = useMemo(() => computeComplementsAmount(employee, c), [employee, c])

  if (!open) return null

  const setNum = (k: keyof Complements) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setC({ ...c, [k]: parseFloat(e.target.value) || 0 })

  const addPrime = () => setC({ ...c, primes: [...c.primes, { label: '', amount: 0 }] })
  const updPrime = (i: number, k: 'label' | 'amount', v: any) => {
    const next = [...c.primes]
    next[i] = { ...next[i], [k]: k === 'amount' ? (parseFloat(v) || 0) : v }
    setC({ ...c, primes: next })
  }
  const delPrime = (i: number) => setC({ ...c, primes: c.primes.filter((_, idx) => idx !== i) })

  const valider = () => {
    onSave(c)
    store.toast(`Compléments enregistrés pour ${employee.firstName} ${employee.lastName} (+${fcfa(totalAdd)})`, 'success')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-sm shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-n-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-orange font-semibold">Compléments de paie</p>
            <h2 className="font-serif text-xl font-semibold tracking-tight mt-1">{employee.firstName} {employee.lastName}</h2>
            <p className="text-xs text-n-500 mt-0.5">Taux horaire calculé : <strong className="font-mono text-ink">{fcfa(Math.round(tauxHoraire))}/h</strong> (base 173,33 h légales)</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 hover:bg-n-100 rounded-sm flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <Section icon={Clock} title="Heures supplémentaires" subtitle="Décret MEPS 2017-017 · majorations légales CI">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <NumField label="Jour 41-46 h (+15 %)" value={c.hsJour15} onChange={setNum('hsJour15')} hint={fcfa(Math.round(tauxHoraire * c.hsJour15 * 1.15))} />
              <NumField label="Jour au-delà 46 h (+50 %)" value={c.hsJour50} onChange={setNum('hsJour50')} hint={fcfa(Math.round(tauxHoraire * c.hsJour50 * 1.50))} />
              <NumField label="Nuit 21h-5h (+75 %)" value={c.hsNuit} onChange={setNum('hsNuit')} hint={fcfa(Math.round(tauxHoraire * c.hsNuit * 1.75))} />
              <NumField label="Dimanche / férié (+75 %)" value={c.hsDimanche} onChange={setNum('hsDimanche')} hint={fcfa(Math.round(tauxHoraire * c.hsDimanche * 1.75))} />
              <NumField label="Nuit + dimanche (+100 %)" value={c.hsNuitDimanche} onChange={setNum('hsNuitDimanche')} hint={fcfa(Math.round(tauxHoraire * c.hsNuitDimanche * 2.00))} />
            </div>
          </Section>

          <Section icon={Coins} title="Indemnités" subtitle="Plafonds DGI CI · transport 25 000 · panier-repas 10 % rém.">
            <div className="grid sm:grid-cols-3 gap-3">
              <NumField label="Transport" value={c.transport} onChange={setNum('transport')} hint={c.transport > 25000 ? `⚠ ${fcfa(c.transport - 25000)} imposable` : 'Non imposable (Art. 118 CGI)'} />
              <NumField label="Panier-repas" value={c.repas} onChange={setNum('repas')} hint={c.repas > employee.brut * 0.10 ? `⚠ > 10 % rém. (${fcfa(Math.round(employee.brut * 0.10))})` : 'Exonéré dans la limite 10 %'} />
              <NumField label="Déplacement (justifs)" value={c.deplacement} onChange={setNum('deplacement')} hint="Sur justificatifs > 500 km" />
            </div>
          </Section>

          <Section icon={Sparkles} title="Primes ponctuelles" subtitle="Rendement, projet, exceptionnelle...">
            <div className="space-y-2">
              {c.primes.length === 0 && <p className="text-xs text-n-500 italic">Aucune prime. Cliquez sur "Ajouter une prime" ci-dessous.</p>}
              {c.primes.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" placeholder="Libellé (ex. Prime de rendement)" value={p.label} onChange={(e) => updPrime(i, 'label', e.target.value)} className="flex-1 border border-n-300 rounded-sm h-9 px-3 text-sm focus:border-orange focus:ring-1 focus:ring-orange outline-none" />
                  <input type="number" min="0" value={p.amount || ''} onChange={(e) => updPrime(i, 'amount', e.target.value)} className="w-36 border border-n-300 rounded-sm h-9 px-3 text-sm font-mono text-right focus:border-orange focus:ring-1 focus:ring-orange outline-none" placeholder="FCFA" />
                  <button onClick={() => delPrime(i)} className="w-9 h-9 hover:bg-red-50 hover:text-red-700 text-n-500 rounded-sm flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              <button onClick={addPrime} className="text-xs font-semibold text-orange hover:text-orange-deep inline-flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Ajouter une prime</button>
            </div>
          </Section>

          <div className="bg-ink text-white rounded-sm overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-l-4 border-orange">
              <div>
                <p className="text-[10px] tracking-[0.22em] uppercase text-orange font-semibold">Total compléments à ajouter</p>
                <p className="text-[11px] text-n-300 mt-0.5">S'ajoute au salaire de base du mois en cours</p>
              </div>
              <p className="font-serif font-semibold text-2xl">+ {fcfa(totalAdd)}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-n-200 bg-n-50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 h-10 text-sm font-medium border border-n-300 hover:bg-n-100 rounded-sm">Annuler</button>
          <button onClick={valider} className="inline-flex items-center gap-2 bg-orange text-white px-5 h-10 text-xs font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm">
            Enregistrer les compléments
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, subtitle, children }: { icon: any; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-start gap-2 mb-3">
        <div className="w-8 h-8 bg-orange-tint text-orange rounded-sm flex items-center justify-center shrink-0"><Icon className="w-4 h-4" /></div>
        <div>
          <p className="font-serif text-base font-semibold tracking-tight">{title}</p>
          {subtitle && <p className="text-[11px] text-n-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

function NumField({ label, value, onChange, hint }: { label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; hint?: string }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">{label}</label>
      <input type="number" min="0" value={value || ''} onChange={onChange} className="mt-1 w-full border border-n-300 rounded-sm h-10 px-3 text-sm font-mono focus:border-orange focus:ring-1 focus:ring-orange outline-none" placeholder="0" />
      {hint && <p className={`text-[11px] mt-1 ${hint.startsWith('⚠') ? 'text-orange-deep font-medium' : 'text-n-500'}`}>{hint}</p>}
    </div>
  )
}
