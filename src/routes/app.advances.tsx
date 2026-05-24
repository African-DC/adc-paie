import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Plus, X, CheckCircle2, Clock, AlertCircle, ChevronRight, Wallet, TrendingDown, Search } from 'lucide-react'
import { EMPLOYEES, fcfa } from '../lib/mock'
import { store } from '../lib/store'
import { useSession } from '../lib/auth-client'

export const Route = createFileRoute('/app/advances')({ component: AdvancesPage })

type Status = 'pending' | 'approved' | 'rejected' | 'deducted'
type Advance = { id: string; empId: string; amount: number; reason: string; date: string; status: Status; refund: 'next' | '2-tranches' | '3-tranches' }

const INIT: Advance[] = [
  { id: 'a1', empId: '8',  amount: 75000,  reason: 'Frais médicaux famille',         date: '2026-11-18', status: 'pending',  refund: 'next' },
  { id: 'a2', empId: '5',  amount: 50000,  reason: 'Inscription enfant école',       date: '2026-11-15', status: 'pending',  refund: '2-tranches' },
  { id: 'a3', empId: '10', amount: 30000,  reason: 'Urgence familiale',              date: '2026-11-10', status: 'approved', refund: 'next' },
  { id: 'a4', empId: '11', amount: 100000, reason: 'Préparation fêtes de fin d\'année', date: '2026-11-05', status: 'approved', refund: '3-tranches' },
  { id: 'a5', empId: '7',  amount: 40000,  reason: 'Loyer en retard',                date: '2026-10-22', status: 'deducted', refund: 'next' },
  { id: 'a6', empId: '14', amount: 25000,  reason: 'Achat ordinateur (stagiaire)',   date: '2026-10-15', status: 'rejected', refund: 'next' },
]

export function AdvancesPage() {
  const session = useSession()
  const showDemoSeed = !session.isPending && !session.data
  const [advances, setAdvances] = useState<Advance[]>(showDemoSeed ? INIT : [])
  const [filter, setFilter] = useState<'all' | Status>('all')
  const [showNew, setShowNew] = useState(false)
  const [query, setQuery] = useState('')

  const stats = {
    pending: advances.filter((a) => a.status === 'pending').length,
    approved: advances.filter((a) => a.status === 'approved').reduce((s, a) => s + a.amount, 0),
    deductedM: advances.filter((a) => a.status === 'deducted').reduce((s, a) => s + a.amount, 0),
    countActive: advances.filter((a) => a.status === 'approved').length,
  }

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  const visible = useMemo(() => {
    const filtered = filter === 'all' ? advances : advances.filter((a) => a.status === filter)
    const nq = norm(query)
    if (!nq) return filtered
    return filtered.filter((a) => {
      const e = EMPLOYEES.find((x) => x.id === a.empId)
      if (!e) return false
      return norm(`${e.firstName} ${e.lastName} ${a.reason}`).includes(nq)
    })
  }, [advances, filter, query])

  const handleAction = (id: string, status: Status, msg: string) => {
    setAdvances((a) => a.map((x) => (x.id === id ? { ...x, status } : x)))
    store.toast(msg, status === 'approved' ? 'success' : 'info')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Avances sur salaire</p>
          <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">Gestion des <span className="em-serif">avances</span></h1>
          <p className="mt-2 text-n-700">Approuvez les demandes, suivez les déductions automatiques sur les bulletins suivants.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-2 bg-orange text-white px-4 h-10 text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm">
          <Plus className="w-4 h-4" /> Nouvelle avance
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="En attente" value={String(stats.pending)} icon={Clock} accent />
        <Stat label="Avances actives" value={String(stats.countActive)} icon={Wallet} />
        <Stat label="Total avancé" value={fcfa(stats.approved)} icon={TrendingDown} />
        <Stat label="Déduit ce mois" value={fcfa(stats.deductedM)} icon={CheckCircle2} />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-n-200">
        <div className="flex items-center gap-1 overflow-x-auto">
          {([
            { v: 'all', l: 'Toutes' },
            { v: 'pending', l: 'À valider', count: stats.pending },
            { v: 'approved', l: 'En cours', count: stats.countActive },
            { v: 'deducted', l: 'Soldées' },
            { v: 'rejected', l: 'Refusées' },
          ] as const).map((t) => (
            <button key={t.v} onClick={() => setFilter(t.v)} className={`px-4 h-10 text-sm font-medium border-b-2 -mb-px transition-colors ${filter === t.v ? 'border-orange text-orange' : 'border-transparent text-n-600 hover:text-ink'}`}>
              {t.l}{('count' in t && t.count !== undefined) && <span className="ml-1.5 text-[10px] font-mono">({t.count})</span>}
            </button>
          ))}
        </div>
        <div className="relative w-64 mb-2">
          <Search className="w-3.5 h-3.5 text-n-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un salarié ou un motif…" className="w-full h-8 pl-8 pr-7 border border-n-300 rounded-sm text-xs bg-white focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20" />
          {query && <button onClick={() => setQuery('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 hover:bg-n-100 rounded-sm inline-flex items-center justify-center" aria-label="Effacer"><X className="w-3 h-3 text-n-500" /></button>}
        </div>
      </div>

      <div className="bg-white border border-n-200 rounded-sm overflow-hidden">
        {visible.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-8 h-8 text-n-300 mx-auto mb-2" />
            <p className="text-sm text-n-500">Aucune avance dans cette catégorie.</p>
          </div>
        ) : (
          <ul className="divide-y divide-n-100">
            {visible.map((a) => {
              const emp = EMPLOYEES.find((e) => e.id === a.empId)
              if (!emp) return null
              return (
                <li key={a.id} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                  <Link to="/app/employees/$id" params={{ id: emp.id }} className="flex items-center gap-2 group min-w-[180px]">
                    <div className="w-9 h-9 bg-n-100 group-hover:bg-orange group-hover:text-white text-n-700 font-semibold text-xs rounded-full flex items-center justify-center shrink-0">{emp.firstName[0]}{emp.lastName[0]}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium group-hover:text-orange truncate">{emp.firstName} {emp.lastName}</p>
                      <p className="text-[10px] text-n-500 truncate">{emp.role}</p>
                    </div>
                  </Link>
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm">{a.reason}</p>
                    <p className="text-[10px] text-n-500 mt-0.5">Demande du {a.date} · remboursement <strong>{labelRefund(a.refund)}</strong></p>
                  </div>
                  <p className="font-mono font-semibold text-orange-deep">{fcfa(a.amount)}</p>
                  <StatusBadge status={a.status} />
                  {a.status === 'pending' && (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleAction(a.id, 'rejected', `Avance refusée pour ${emp.firstName}`)} className="px-3 h-8 text-xs border border-n-300 rounded-sm hover:bg-n-50">Refuser</button>
                      <button onClick={() => handleAction(a.id, 'approved', `Avance de ${fcfa(a.amount)} approuvée pour ${emp.firstName} ${emp.lastName}`)} className="px-3 h-8 text-xs font-semibold bg-orange text-white rounded-sm hover:bg-orange-deep">Approuver</button>
                    </div>
                  )}
                  {a.status === 'approved' && (
                    <button onClick={() => handleAction(a.id, 'deducted', `Avance déduite sur le bulletin de ${emp.firstName}`)} className="px-3 h-8 text-xs font-semibold border border-orange text-orange-deep rounded-sm hover:bg-orange-tint">Marquer soldée</button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {showNew && <NewAdvanceModal onClose={() => setShowNew(false)} onCreate={(a) => { setAdvances((prev) => [a, ...prev]); store.toast('Avance créée et envoyée pour approbation', 'success'); setShowNew(false) }} />}
    </div>
  )
}

function labelRefund(r: Advance['refund']) {
  return r === 'next' ? 'sur la paie suivante' : r === '2-tranches' ? 'en 2 tranches' : 'en 3 tranches'
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { bg: string; label: string }> = {
    pending: { bg: 'bg-orange-tint text-orange-deep', label: 'À valider' },
    approved: { bg: 'bg-green-100 text-green-700', label: 'Approuvée' },
    deducted: { bg: 'bg-n-100 text-n-700', label: 'Soldée' },
    rejected: { bg: 'bg-red-50 text-red-700', label: 'Refusée' },
  }
  const s = map[status]
  return <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm ${s.bg}`}>{s.label}</span>
}

function Stat({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent?: boolean }) {
  return (
    <div className={`p-5 rounded-sm border ${accent ? 'bg-orange-tint border-orange/30' : 'bg-white border-n-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] tracking-[0.22em] uppercase text-n-500 font-semibold">{label}</p>
        <Icon className={`w-4 h-4 ${accent ? 'text-orange' : 'text-n-400'}`} />
      </div>
      <p className="font-serif font-semibold text-2xl tracking-tight leading-none">{value}</p>
    </div>
  )
}

function NewAdvanceModal({ onClose, onCreate }: { onClose: () => void; onCreate: (a: Advance) => void }) {
  const [empId, setEmpId] = useState('1')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [refund, setRefund] = useState<Advance['refund']>('next')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({ id: 'new-' + Date.now(), empId, amount: parseInt(amount) || 0, reason, date: new Date().toISOString().slice(0, 10), status: 'pending', refund })
  }
  return (
    <div className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md rounded-sm shadow-2xl">
        <div className="px-6 py-4 border-b border-n-200 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold tracking-tight">Nouvelle demande d'avance</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 hover:bg-n-100 rounded-sm flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Salarié">
            <select required value={empId} onChange={(e) => setEmpId(e.target.value)} className="w-full h-10 px-3 border border-n-300 rounded-sm bg-white text-sm">
              {EMPLOYEES.filter((e) => e.status === 'active').map((e) => (
                <option key={e.id} value={e.id}>{e.firstName} {e.lastName} · {e.role}</option>
              ))}
            </select>
          </Field>
          <Field label="Montant (FCFA)">
            <input required type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50 000" className="w-full h-10 px-3 border border-n-300 rounded-sm text-sm font-mono" />
          </Field>
          <Field label="Motif">
            <input required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex : frais médicaux, scolarité enfant…" className="w-full h-10 px-3 border border-n-300 rounded-sm text-sm" />
          </Field>
          <Field label="Modalité de remboursement">
            <select value={refund} onChange={(e) => setRefund(e.target.value as Advance['refund'])} className="w-full h-10 px-3 border border-n-300 rounded-sm bg-white text-sm">
              <option value="next">Sur la paie suivante (1 fois)</option>
              <option value="2-tranches">En 2 tranches</option>
              <option value="3-tranches">En 3 tranches</option>
            </select>
          </Field>
        </div>
        <div className="px-6 pb-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 h-10 text-sm border border-n-300 rounded-sm hover:bg-n-50">Annuler</button>
          <button type="submit" className="px-4 h-10 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep inline-flex items-center gap-2">
            Envoyer pour approbation <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-1 block">{label}</span>
      {children}
    </label>
  )
}
