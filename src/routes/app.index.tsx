import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { TrendingUp, Users, CalendarClock, Wallet, ArrowRight, AlertCircle, Calculator, Send, UserPlus } from 'lucide-react'
import { TOTALS, EMPLOYEES, DECLARATIONS, fcfa } from '../lib/mock'
import { AnomaliesBanner } from '../components/extras'
import { store, useStore } from '../lib/store'

export const Route = createFileRoute('/app/')({
  component: Dashboard,
})

function Dashboard() {
  const next = DECLARATIONS.find(d => d.status === 'À soumettre' || d.status === 'En cours')
  const recentHires = EMPLOYEES.filter(e => e.status === 'active').slice(-3).reverse()
  const org = useStore((s) => s.org)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#hire') {
      store.openHire()
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">{org.name} · Tableau de bord Novembre 2026</p>
        <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">
          Bienvenue, <span className="em-serif">Marcel</span>.
        </h1>
        <p className="mt-2 text-n-700">Voici un aperçu de la paie de <strong>{org.name}</strong> pour la période en cours.</p>
      </div>

      <AnomaliesBanner />

      <div>
        <p className="text-[10px] tracking-[0.22em] uppercase text-n-500 font-semibold mb-2">Actions rapides</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction to="/app/payroll"      label="Lancer la paie"        sub="Novembre 2026"        icon={Calculator} primary />
          <QuickAction to="/app/declarations" label="Soumettre CNPS"        sub="Échéance 15 déc."     icon={Send} />
          <QuickAction to="/app/advances"     label="Valider les avances"   sub="2 demandes"           icon={Wallet} />
          <QuickAction onClick={() => store.openHire()} label="Embaucher" sub="Wizard 5 étapes · contrat signé" icon={UserPlus} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI to="/app/payroll"      label="Masse salariale brute" value={fcfa(TOTALS.masseBrut)} delta="+2,3 % vs mois précédent" icon={TrendingUp} />
        <KPI to="/app/employees"    label="Salariés actifs"        value={String(TOTALS.active)}   delta="2 CDD · 1 en congé" icon={Users} />
        <KPI to="/app/payroll"      label="Charges patronales"     value={fcfa(TOTALS.charges)}    delta="17 % du brut" icon={Wallet} />
        <KPI to="/app/declarations" label="Prochaine échéance"     value={next ? next.due : '—'}   delta={next?.type || ''} icon={CalendarClock} accent />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-n-200 rounded-sm p-6">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="font-serif text-xl font-semibold tracking-tight">Évolution de la masse salariale</h2>
              <p className="text-sm text-n-500 mt-1">Six derniers mois</p>
            </div>
            <p className="font-serif italic text-orange text-sm">+12,4 % vs N-1</p>
          </div>
          <Chart />
        </div>
        <div className="bg-white border border-n-200 rounded-sm p-6">
          <h2 className="font-serif text-xl font-semibold tracking-tight mb-4">Déclarations à venir</h2>
          <ul className="space-y-3">
            {DECLARATIONS.filter(d => d.status !== 'Validé').slice(0, 4).map((d) => (
              <li key={d.id} className="flex items-start gap-3 pb-3 border-b border-n-100 last:border-0 last:pb-0">
                <div className="w-1 h-12 bg-orange shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{d.type}</p>
                  <p className="text-[11px] text-n-500 mt-0.5">{d.period} · {d.due}</p>
                </div>
                <StatusBadge status={d.status} />
              </li>
            ))}
          </ul>
          <Link to="/app/declarations" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange hover:text-orange-deep transition-colors">
            Voir toutes <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-orange-tint border-l-4 border-orange p-6 rounded-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-ink">Bordereau CNPS de novembre prêt à soumettre</p>
              <p className="text-sm text-n-700 mt-1">Le bordereau de cotisation a été généré automatiquement. Vous avez jusqu'au 15 décembre pour le déposer sur e-CNPS.</p>
              <Link to="/app/declarations" className="mt-3 inline-flex items-center gap-2 bg-orange text-white px-4 h-9 text-xs font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors">
                Réviser et soumettre <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-white border border-n-200 rounded-sm p-6">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-serif text-xl font-semibold tracking-tight">Derniers arrivés</h2>
            <Link to="/app/employees" className="text-xs font-semibold text-orange hover:text-orange-deep uppercase tracking-wider">Voir tous</Link>
          </div>
          <ul className="space-y-3">
            {recentHires.map((e) => (
              <li key={e.id} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-n-100 text-n-700 font-semibold text-sm rounded-full flex items-center justify-center shrink-0">
                  {e.firstName[0]}{e.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{e.firstName} {e.lastName}</p>
                  <p className="text-[11px] text-n-500 truncate">{e.role} · arrivé(e) {e.joinedAt}</p>
                </div>
                <span className="text-xs font-mono text-n-700">{fcfa(e.brut)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function KPI({ to, label, value, delta, icon: Icon, accent }: { to?: string; label: string; value: string; delta: string; icon: any; accent?: boolean }) {
  const body = (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] tracking-[0.22em] uppercase text-n-500 font-semibold">{label}</p>
        <Icon className={`w-4 h-4 ${accent ? 'text-orange' : 'text-n-400'}`} />
      </div>
      <p className="font-serif font-semibold text-2xl lg:text-3xl tracking-tight leading-none">{value}</p>
      <div className="flex items-center justify-between mt-2">
        <p className={`text-[11px] font-medium ${accent ? 'text-orange-deep' : 'text-n-500'}`}>{delta}</p>
        {to && <ArrowRight className={`w-3 h-3 ${accent ? 'text-orange-deep' : 'text-n-400'} group-hover:translate-x-0.5 transition-transform`} />}
      </div>
    </>
  )
  const cls = `block group p-5 rounded-sm border transition-all ${accent ? 'bg-orange-tint border-orange/30 hover:border-orange' : 'bg-white border-n-200 hover:border-n-300 hover:shadow-sm'}`
  return to
    ? <Link to={to} className={cls}>{body}</Link>
    : <div className={cls}>{body}</div>
}

function QuickAction({ to, onClick, label, sub, icon: Icon, primary }: { to?: string; onClick?: () => void; label: string; sub: string; icon: any; primary?: boolean }) {
  const body = (
    <>
      <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 ${primary ? 'bg-orange text-white' : 'bg-n-100 text-n-700 group-hover:bg-orange-tint group-hover:text-orange'}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm truncate group-hover:text-orange-deep transition-colors">{label}</p>
        <p className="text-[11px] text-n-500 truncate">{sub}</p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-n-400 group-hover:text-orange group-hover:translate-x-0.5 transition-all" />
    </>
  )
  const cls = `group flex items-center gap-3 p-3 bg-white border border-n-200 hover:border-orange rounded-sm transition-all text-left`
  return to
    ? <Link to={to} className={cls}>{body}</Link>
    : <button onClick={onClick} className={cls}>{body}</button>
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'À soumettre': 'bg-orange text-white',
    'En cours': 'bg-orange-tint text-orange-deep',
    'Soumis': 'bg-n-100 text-n-700',
    'Validé': 'bg-green-100 text-green-800',
  }
  return <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm ${map[status] || 'bg-n-100 text-n-700'}`}>{status}</span>
}

function Chart() {
  const data = [
    { m: 'Juin', v: 5.8 }, { m: 'Juil.', v: 5.9 }, { m: 'Août', v: 6.1 },
    { m: 'Sept.', v: 6.3 }, { m: 'Oct.', v: 6.4 }, { m: 'Nov.', v: 6.5 },
  ]
  const max = 7
  return (
    <div className="flex items-end justify-between gap-2 h-48 mt-4">
      {data.map((d, i) => (
        <div key={d.m} className="flex-1 flex flex-col items-center gap-2">
          <span className="text-[10px] font-mono text-n-500">{d.v}M</span>
          <div className="w-full bg-n-100 relative rounded-sm overflow-hidden" style={{ height: '160px' }}>
            <div
              className={`absolute bottom-0 left-0 right-0 ${i === data.length - 1 ? 'bg-orange' : 'bg-ink-3'} transition-all`}
              style={{ height: `${(d.v / max) * 100}%` }}
            />
          </div>
          <span className={`text-[10px] uppercase tracking-wider ${i === data.length - 1 ? 'text-orange font-semibold' : 'text-n-500'}`}>{d.m}</span>
        </div>
      ))}
    </div>
  )
}
