import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Calculator, FileText, ChevronDown, Calendar, Eye, Send, Archive, Search, X, RotateCcw, Sparkles } from 'lucide-react'
import { EMPLOYEES, computePayslip, fcfa } from '../lib/mock'
import { store } from '../lib/store'
import { PaySalariesModal, ExportAuditModal } from '../components/payroll-modals'
import { downloadPayslipsZip } from '../lib/downloads'

export const Route = createFileRoute('/app/payroll/')({ component: PayrollPage })

function PayrollPage() {
  const [month, setMonth] = useState('Novembre 2026')
  const [periodOpen, setPeriodOpen] = useState(false)
  const [days, setDays] = useState<Record<string, string>>({})
  const [bonus, setBonus] = useState<Record<string, string>>({})
  const [payOpen, setPayOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [query, setQuery] = useState('')
  const active = EMPLOYEES.filter(e => e.status === 'active')
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  const visible = useMemo(() => {
    const nq = norm(query)
    return nq ? active.filter((e) => norm(`${e.firstName} ${e.lastName} ${e.role}`).includes(nq)) : active
  }, [query, active])
  const totals = active.reduce((acc, e) => {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    return { brut: acc.brut + e.brut, cnps: acc.cnps + p.cnps, its: acc.its + p.its, igr: acc.igr + p.igr, cn: acc.cn + p.cn, net: acc.net + p.net, patron: acc.patron + p.patron }
  }, { brut: 0, cnps: 0, its: 0, igr: 0, cn: 0, net: 0, patron: 0 })

  const applyToAll = (val: string) => { const d: Record<string, string> = {}; active.forEach((e) => { d[e.id] = val }); setDays(d); store.toast(`${val} jours appliqués à tous les salariés`, 'success') }
  const resetBonuses = () => { setBonus({}); store.toast('Primes réinitialisées', 'info') }

  return (
    <div className="space-y-6 pb-32">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Cycle de paie</p>
          <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">Saisie <span className="em-serif">mensuelle</span></h1>
          <p className="mt-2 text-n-700 inline-flex items-center gap-2"><Calendar className="w-4 h-4 text-orange" /> Période · <strong>{month}</strong></p>
        </div>
        <button onClick={() => setPeriodOpen(true)} className="inline-flex items-center gap-2 border border-n-300 px-4 h-9 text-sm font-medium hover:bg-n-50 transition-colors rounded-sm">
          Changer de période <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-white border border-n-200 rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-n-200 bg-n-50 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm font-semibold">Détail par salarié · {active.length} bulletins à générer</p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-n-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un salarié…"
                className="w-full h-8 pl-8 pr-7 border border-n-300 rounded-sm text-xs bg-white focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 hover:bg-n-100 rounded-sm inline-flex items-center justify-center" aria-label="Effacer">
                  <X className="w-3 h-3 text-n-500" />
                </button>
              )}
            </div>
            <button onClick={() => applyToAll('22')} className="inline-flex items-center gap-1.5 px-2.5 h-8 text-[11px] font-medium border border-n-300 hover:bg-white rounded-sm transition-colors" title="Forcer 22 jours pour tous les salariés">
              <Sparkles className="w-3 h-3 text-orange" /> 22j à tous
            </button>
            <button onClick={resetBonuses} className="inline-flex items-center gap-1.5 px-2.5 h-8 text-[11px] font-medium border border-n-300 hover:bg-white rounded-sm transition-colors" title="Vider toutes les primes">
              <RotateCcw className="w-3 h-3" /> Reset primes
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white border-b border-n-200">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Salarié</th>
                <th className="text-center px-3 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Jours</th>
                <th className="text-right px-3 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Brut</th>
                <th className="text-right px-3 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">+ Primes</th>
                <th className="text-right px-3 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">- CNPS</th>
                <th className="text-right px-3 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">- ITS</th>
                <th className="text-right px-3 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-orange">Net à payer</th>
                <th className="px-2 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center">
                  <Search className="w-7 h-7 text-n-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-n-700">Aucun salarié ne correspond à « {query} »</p>
                  <button onClick={() => setQuery('')} className="mt-2 text-xs font-semibold text-orange hover:text-orange-deep uppercase tracking-wider">Effacer la recherche</button>
                </td></tr>
              )}
              {visible.map((e) => {
                const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
                return (
                  <tr key={e.id} className="border-b border-n-100 hover:bg-n-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to="/app/employees/$id" params={{ id: e.id }} className="flex items-center gap-2 hover:text-orange">
                        <div className="w-7 h-7 bg-n-100 text-n-700 font-semibold text-[10px] rounded-full flex items-center justify-center shrink-0">{e.firstName[0]}{e.lastName[0]}</div>
                        <div className="min-w-0">
                          <p className="font-medium text-[13px] truncate">{e.firstName} {e.lastName}</p>
                          <p className="text-[10px] text-n-500">{e.role}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="text-center px-3 py-3">
                      <input value={days[e.id] ?? '22'} onChange={(ev) => setDays({...days, [e.id]: ev.target.value})} className="w-12 bg-n-50 border border-n-200 px-2 py-1 text-center text-xs font-mono rounded-sm focus:outline-none focus:border-orange" />
                    </td>
                    <td className="text-right px-3 py-3 font-mono text-xs">{fcfa(e.brut)}</td>
                    <td className="text-right px-3 py-3">
                      <input value={bonus[e.id] ?? '0'} onChange={(ev) => setBonus({...bonus, [e.id]: ev.target.value})} className="w-20 bg-n-50 border border-n-200 px-2 py-1 text-right text-xs font-mono rounded-sm focus:outline-none focus:border-orange" />
                    </td>
                    <td className="text-right px-3 py-3 font-mono text-xs text-n-600">- {fcfa(Math.round(p.cnps))}</td>
                    <td className="text-right px-3 py-3 font-mono text-xs text-n-600">- {fcfa(Math.round(p.its))}</td>
                    <td className="text-right px-3 py-3 font-mono text-sm font-semibold text-orange-deep">{fcfa(Math.round(p.net))}</td>
                    <td className="px-2 py-3">
                      <Link to="/app/payroll/payslip/$id" params={{ id: e.id }} className="w-7 h-7 hover:bg-orange-tint rounded-sm inline-flex items-center justify-center text-n-500 hover:text-orange" title="Aperçu bulletin">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t-2 border-orange shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-40">
        <div className="px-6 lg:px-8 py-4 pr-6 lg:pr-56 flex items-center justify-between gap-6 flex-wrap">
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-2 text-xs">
            <div><p className="text-[10px] uppercase tracking-wider text-n-500">Total brut</p><p className="font-mono font-semibold">{fcfa(Math.round(totals.brut))}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-n-500">Total retenues</p><p className="font-mono font-semibold">{fcfa(Math.round(totals.cnps + totals.its + totals.igr + totals.cn))}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-n-500">Charges patronales</p><p className="font-mono font-semibold">{fcfa(Math.round(totals.patron))}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-orange-deep font-semibold">Net total à payer</p><p className="font-serif font-semibold text-lg text-orange-deep">{fcfa(Math.round(totals.net))}</p></div>
          </div>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <button onClick={() => setExportOpen(true)} className="inline-flex items-center gap-2 border border-n-300 px-3 h-10 text-xs font-medium hover:bg-n-50 transition-colors rounded-sm uppercase tracking-wider" title="Archive ZIP audit CNPS/DGI">
              <Archive className="w-3.5 h-3.5" /> Export audit
            </button>
            <button onClick={() => store.toast('Brouillon enregistré localement', 'info')} className="inline-flex items-center gap-2 border border-n-300 px-3 h-10 text-xs font-medium hover:bg-n-50 transition-colors rounded-sm uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" /> Brouillon
            </button>
            <button onClick={async () => { store.toast(`${active.length} bulletins calculés · archive ZIP en préparation…`, 'info'); await downloadPayslipsZip(active, [month]); store.toast(`${active.length} bulletins ${month} téléchargés (ZIP)`, 'success') }} className="inline-flex items-center gap-2 border-2 border-orange text-orange-deep px-4 h-10 text-xs font-semibold uppercase tracking-wider hover:bg-orange-tint transition-colors rounded-sm">
              <Calculator className="w-3.5 h-3.5" /> Calculer & ZIP
            </button>
            <button onClick={() => setPayOpen(true)} className="inline-flex items-center gap-2 bg-orange text-white px-5 h-10 text-xs font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm">
              <Send className="w-3.5 h-3.5" /> Payer les salaires
            </button>
          </div>
        </div>
      </div>
      <PaySalariesModal open={payOpen} onClose={() => setPayOpen(false)} total={Math.round(totals.net)} count={active.length} />
      <ExportAuditModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <PeriodPickerModal open={periodOpen} current={month} onClose={() => setPeriodOpen(false)} onPick={(m) => { setMonth(m); store.toast(`Période active : ${m}`, 'success'); setPeriodOpen(false) }} />
    </div>
  )
}

function PeriodPickerModal({ open, current, onClose, onPick }: { open: boolean; current: string; onClose: () => void; onPick: (m: string) => void }) {
  if (!open) return null
  const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  const periods = [
    { year: 2027, future: true },
    { year: 2026, future: false },
    { year: 2025, future: false },
  ]
  return (
    <div className="fixed inset-0 z-[85] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-n-200 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold tracking-tight">Sélectionner la période</h3>
          <button onClick={onClose} className="w-8 h-8 hover:bg-n-100 rounded-sm flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-5">
          {periods.map(({ year, future }) => (
            <div key={year}>
              <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-2">{year}{future && <span className="ml-2 text-orange">à venir</span>}</p>
              <div className="grid grid-cols-3 gap-1.5">
                {MOIS.map((m) => {
                  const label = `${m} ${year}`
                  const isCurrent = label === current
                  const isFuture = year === 2027 && MOIS.indexOf(m) > 0
                  return (
                    <button key={m} disabled={isFuture} onClick={() => onPick(label)} className={`px-2 py-2 text-xs font-medium rounded-sm border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${isCurrent ? 'border-orange bg-orange text-white font-semibold' : 'border-n-200 hover:bg-orange-tint hover:border-orange'}`}>
                      {m}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-n-200 bg-n-50 text-[11px] text-n-500">
          La période active détermine les bulletins générés et les déclarations CNPS/DGI à soumettre.
        </div>
      </div>
    </div>
  )
}
