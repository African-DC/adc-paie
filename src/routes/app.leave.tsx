import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { CalendarDays, Plus, Check, X, Clock, CalendarCheck, Search } from 'lucide-react'
import { EMPLOYEES } from '../lib/mock'
import { store } from '../lib/store'

export const Route = createFileRoute('/app/leave')({ component: LeavePage })

type Request = { id: string; empId: string; type: 'Congés payés' | 'Maladie' | 'Maternité' | 'Sans solde' | 'Décès' | 'Mariage'; from: string; to: string; days: number; status: 'En attente' | 'Validé' | 'Refusé'; note?: string }

const INITIAL: Request[] = [
  { id: 'l1', empId: '1', type: 'Congés payés', from: '2026-12-23', to: '2026-12-27', days: 5, status: 'En attente', note: 'Fêtes de fin d\'année · famille' },
  { id: 'l2', empId: '4', type: 'Maladie', from: '2026-11-25', to: '2026-11-27', days: 3, status: 'En attente', note: 'Certificat médical fourni' },
  { id: 'l3', empId: '3', type: 'Mariage', from: '2026-12-15', to: '2026-12-19', days: 5, status: 'Validé' },
  { id: 'l4', empId: '6', type: 'Congés payés', from: '2026-11-10', to: '2026-11-14', days: 5, status: 'Validé' },
  { id: 'l5', empId: '11', type: 'Sans solde', from: '2026-12-01', to: '2026-12-08', days: 6, status: 'Refusé', note: 'Période de paie · à reporter' },
  { id: 'l6', empId: '9', type: 'Congés payés', from: '2027-01-05', to: '2027-01-12', days: 6, status: 'En attente' },
]

export default function LeaveDefault() { return null }

function LeavePage() {
  const [reqs, setReqs] = useState<Request[]>(INITIAL)
  const [tab, setTab] = useState<'all' | 'pending' | 'calendar'>('pending')
  const [showNew, setShowNew] = useState(false)

  const decide = (id: string, decision: 'Validé' | 'Refusé') => {
    setReqs((rs) => rs.map((r) => r.id === id ? { ...r, status: decision } : r))
    store.toast(decision === 'Validé' ? 'Demande validée · répercutée sur la paie' : 'Demande refusée · salarié notifié', decision === 'Validé' ? 'success' : 'warning')
  }

  const [query, setQuery] = useState('')
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  const base = tab === 'pending' ? reqs.filter((r) => r.status === 'En attente') : reqs
  const filtered = useMemo(() => {
    const nq = norm(query)
    if (!nq) return base
    return base.filter((r) => {
      const e = EMPLOYEES.find((x) => x.id === r.empId)
      if (!e) return false
      return norm(`${e.firstName} ${e.lastName} ${r.type}`).includes(nq)
    })
  }, [query, base])
  const stats = {
    pending: reqs.filter((r) => r.status === 'En attente').length,
    validated: reqs.filter((r) => r.status === 'Validé').length,
    refused: reqs.filter((r) => r.status === 'Refusé').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Code du travail · art. 25</p>
          <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">Congés &amp; <span className="em-serif">absences</span></h1>
          <p className="mt-2 text-n-700">Workflow de demande, validation multi-niveaux, calendrier équipe et soldes auto.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-2 bg-orange text-white px-4 h-10 text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm">
          <Plus className="w-4 h-4" /> Nouvelle demande
        </button>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-white border border-n-200 rounded-sm p-5">
          <p className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">À valider</p>
          <p className="font-serif text-3xl font-semibold mt-2 text-orange-deep">{stats.pending}</p>
          <p className="text-xs text-n-600 mt-1">Action requise</p>
        </div>
        <div className="bg-white border border-n-200 rounded-sm p-5">
          <p className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Validés ce mois</p>
          <p className="font-serif text-3xl font-semibold mt-2 text-green-700">{stats.validated}</p>
          <p className="text-xs text-n-600 mt-1">Reportés en paie</p>
        </div>
        <div className="bg-white border border-n-200 rounded-sm p-5">
          <p className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Refusés</p>
          <p className="font-serif text-3xl font-semibold mt-2">{stats.refused}</p>
          <p className="text-xs text-n-600 mt-1">Documenté</p>
        </div>
        <div className="bg-orange-tint border border-orange/30 rounded-sm p-5">
          <p className="text-[10px] uppercase tracking-wider text-orange-deep font-semibold">Solde moyen équipe</p>
          <p className="font-serif text-3xl font-semibold mt-2 text-ink">14,2 j</p>
          <p className="text-xs text-n-700 mt-1">26,4 j acquis · 2,2 j/mois</p>
        </div>
      </div>

      <div className="border-b border-n-200 flex gap-1">
        {([
          { v: 'pending', l: `À valider (${stats.pending})` },
          { v: 'all', l: 'Toutes les demandes' },
          { v: 'calendar', l: 'Calendrier équipe' },
        ] as const).map((t) => (
          <button key={t.v} onClick={() => setTab(t.v)} className={`px-4 h-10 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.v ? 'border-orange text-orange' : 'border-transparent text-n-600 hover:text-ink'}`}>{t.l}</button>
        ))}
      </div>

      {tab !== 'calendar' && (
        <div className="bg-white border border-n-200 rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-n-200 bg-n-50 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm font-semibold">{filtered.length} demande{filtered.length > 1 ? 's' : ''}{query && ` · recherche « ${query} »`}</p>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-n-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un salarié ou un motif…" className="w-full h-8 pl-8 pr-7 border border-n-300 rounded-sm text-xs bg-white focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20" />
              {query && <button onClick={() => setQuery('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 hover:bg-n-100 rounded-sm inline-flex items-center justify-center" aria-label="Effacer"><X className="w-3 h-3 text-n-500" /></button>}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-n-50 border-b border-n-200">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold">Salarié</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold">Type</th>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold">Période</th>
                  <th className="text-center px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold">Jours</th>
                  <th className="text-center px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold">Statut</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const emp = EMPLOYEES.find((e) => e.id === r.empId)
                  if (!emp) return null
                  return (
                    <tr key={r.id} className="border-b border-n-100 hover:bg-n-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-n-100 text-n-700 font-semibold text-[10px] rounded-full flex items-center justify-center shrink-0">{emp.firstName[0]}{emp.lastName[0]}</div>
                          <div><p className="font-medium text-[13px]">{emp.firstName} {emp.lastName}</p><p className="text-[10px] text-n-500">{emp.role}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm bg-orange-tint text-orange-deep">{r.type}</span>
                        {r.note && <p className="text-[10px] text-n-500 mt-1 italic">« {r.note} »</p>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{r.from} → {r.to}</td>
                      <td className="text-center px-4 py-3 font-mono font-semibold">{r.days} j</td>
                      <td className="text-center px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm ${r.status === 'En attente' ? 'bg-orange text-white' : r.status === 'Validé' ? 'bg-green-100 text-green-800' : 'bg-n-100 text-n-700'}`}>
                          {r.status === 'En attente' && <Clock className="w-3 h-3" />}
                          {r.status}
                        </span>
                      </td>
                      <td className="text-right px-4 py-3">
                        {r.status === 'En attente' ? (
                          <div className="inline-flex gap-1">
                            <button onClick={() => decide(r.id, 'Validé')} className="w-8 h-8 bg-green-50 hover:bg-green-100 text-green-700 rounded-sm inline-flex items-center justify-center" title="Valider">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => decide(r.id, 'Refusé')} className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-700 rounded-sm inline-flex items-center justify-center" title="Refuser">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-n-400">Traité</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'calendar' && (
        <div className="bg-white border border-n-200 rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg font-semibold tracking-tight">Décembre 2026</h3>
            <span className="text-xs text-n-500"><CalendarCheck className="w-3 h-3 inline mr-1 text-orange" /> Aperçu équipe</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {['L','M','M','J','V','S','D'].map((d) => <div key={d} className="text-center font-semibold text-n-500 py-1">{d}</div>)}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
              const isWeekend = (d + 1) % 7 === 0 || (d + 2) % 7 === 0
              const hasLeave = [15, 16, 17, 18, 19, 23, 24, 25, 26, 27].includes(d)
              return (
                <div key={d} className={`aspect-square flex items-center justify-center text-xs border ${isWeekend ? 'bg-n-50 text-n-400 border-n-100' : hasLeave ? 'bg-orange text-white font-semibold border-orange-deep' : 'border-n-100 hover:bg-n-50'}`}>{d}</div>
              )
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-n-100 grid sm:grid-cols-2 gap-4 text-xs">
            <div><span className="inline-block w-3 h-3 bg-orange align-middle mr-2" /> Aïcha K. · 15-19 déc · Mariage</div>
            <div><span className="inline-block w-3 h-3 bg-orange align-middle mr-2" /> Fatou T. · 23-27 déc · Congés payés</div>
          </div>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white w-full max-w-md rounded-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-n-200 flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold">Nouvelle demande de congé</h3>
              <button onClick={() => setShowNew(false)} className="w-8 h-8 hover:bg-n-100 rounded-sm inline-flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowNew(false); store.toast('Demande de congé soumise · en attente de validation', 'success') }} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-n-600 font-semibold">Salarié</label>
                <select className="w-full mt-1 border border-n-300 px-3 h-10 text-sm rounded-sm outline-none focus:border-orange">
                  {EMPLOYEES.filter(e => e.status === 'active').map(e => <option key={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-n-600 font-semibold">Type</label>
                <select className="w-full mt-1 border border-n-300 px-3 h-10 text-sm rounded-sm outline-none focus:border-orange">
                  <option>Congés payés</option><option>Maladie</option><option>Maternité</option><option>Mariage</option><option>Décès</option><option>Sans solde</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] uppercase tracking-wider text-n-600 font-semibold">Du</label><input type="date" className="w-full mt-1 border border-n-300 px-3 h-10 text-sm rounded-sm outline-none focus:border-orange" /></div>
                <div><label className="text-[10px] uppercase tracking-wider text-n-600 font-semibold">Au</label><input type="date" className="w-full mt-1 border border-n-300 px-3 h-10 text-sm rounded-sm outline-none focus:border-orange" /></div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-n-600 font-semibold">Note (optionnel)</label>
                <textarea rows={2} className="w-full mt-1 border border-n-300 px-3 py-2 text-sm rounded-sm outline-none focus:border-orange resize-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowNew(false)} className="px-4 h-9 text-sm border border-n-300 rounded-sm hover:bg-n-50">Annuler</button>
                <button type="submit" className="px-4 h-9 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep">Soumettre</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
