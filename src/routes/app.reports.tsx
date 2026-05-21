import { createFileRoute } from '@tanstack/react-router'
import { TrendingUp, TrendingDown, Users, Wallet, FileDown, FileSpreadsheet, Briefcase, Award } from 'lucide-react'
import { EMPLOYEES, computePayslip, fcfa } from '../lib/mock'
import { store, useStore } from '../lib/store'
import { downloadReportPDF, downloadEcrituresOHADA, downloadEmployeesExcel } from '../lib/downloads'

export const Route = createFileRoute('/app/reports')({ component: ReportsPage })

function ReportsPage() {
  const org = useStore((s) => s.org)
  const active = EMPLOYEES.filter((e) => e.status === 'active')
  const totals = active.reduce((acc, e) => {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    return { brut: acc.brut + e.brut, net: acc.net + p.net, patron: acc.patron + p.patron, total: acc.total + p.total, cnps: acc.cnps + p.cnps, its: acc.its + p.its }
  }, { brut: 0, net: 0, patron: 0, total: 0, cnps: 0, its: 0 })

  const cdi = active.filter((e) => e.contract === 'CDI').length
  const cdd = active.filter((e) => e.contract === 'CDD').length
  const enConge = EMPLOYEES.filter((e) => e.status !== 'active').length
  const masseAnnuelle = totals.brut * 12
  const masseCoutAnnuel = totals.total * 12
  const avgBrut = Math.round(totals.brut / active.length)
  const topPostes = [...active].sort((a, b) => b.brut - a.brut).slice(0, 5)
  const ratioPatron = Math.round((totals.patron / totals.brut) * 100)

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Analytics & rapports</p>
          <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">Tableau de bord <span className="em-serif">décisionnel</span></h1>
          <p className="mt-2 text-n-700">Vue consolidée de la masse salariale, des coûts employeur et des indicateurs clés de {org.name}.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => { downloadReportPDF(EMPLOYEES); store.toast('Rapport RH PDF téléchargé', 'success') }} className="inline-flex items-center gap-2 bg-orange text-white px-4 h-9 text-xs font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm">
            <FileDown className="w-3.5 h-3.5" /> Rapport PDF
          </button>
          <button onClick={() => { downloadEcrituresOHADA(EMPLOYEES); store.toast('Écritures comptables OHADA exportées', 'success') }} className="inline-flex items-center gap-2 border border-n-300 px-4 h-9 text-xs font-medium hover:bg-n-50 transition-colors rounded-sm">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export OHADA
          </button>
          <button onClick={() => { downloadEmployeesExcel(EMPLOYEES); store.toast('Annuaire Excel téléchargé', 'success') }} className="inline-flex items-center gap-2 border border-n-300 px-4 h-9 text-xs font-medium hover:bg-n-50 transition-colors rounded-sm">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Annuaire Excel
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Masse brute mensuelle" value={fcfa(totals.brut)} sub="+ 2,3 % vs M-1" icon={Wallet} positive />
        <KPI label="Coût employeur total" value={fcfa(Math.round(totals.total))} sub={`${ratioPatron} % de charges`} icon={TrendingUp} />
        <KPI label="Effectif actif" value={String(active.length)} sub={`${cdi} CDI · ${cdd} CDD · ${enConge} en congé`} icon={Users} />
        <KPI label="Salaire brut moyen" value={fcfa(avgBrut)} sub="médiane sectorielle 350k" icon={Award} accent />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-n-200 rounded-sm p-6">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <h2 className="font-serif text-xl font-semibold tracking-tight">Évolution masse salariale</h2>
              <p className="text-sm text-n-500 mt-1">12 derniers mois · brut</p>
            </div>
            <p className="font-serif italic text-orange text-sm">+ 12,4 % vs N-1</p>
          </div>
          <BarChart12 baseBrut={totals.brut} />
          <p className="mt-4 text-xs text-n-600">Projection annuelle : <strong className="text-ink">{fcfa(masseAnnuelle)} brut</strong> · coût employeur total <strong className="text-orange-deep">{fcfa(masseCoutAnnuel)}</strong>.</p>
        </div>

        <div className="bg-white border border-n-200 rounded-sm p-6">
          <h2 className="font-serif text-xl font-semibold tracking-tight mb-4">Répartition par poste</h2>
          <ul className="space-y-3">
            {topPostes.map((e) => {
              const pct = Math.round((e.brut / totals.brut) * 100)
              return (
                <li key={e.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium truncate">{e.firstName} {e.lastName}</span>
                    <span className="font-mono text-n-700">{fcfa(e.brut)}</span>
                  </div>
                  <div className="w-full bg-n-100 h-1.5 rounded-sm overflow-hidden">
                    <div className="bg-orange h-full" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-n-500 mt-0.5">{e.role} · {pct} % de la masse</p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-n-200 rounded-sm p-6">
          <h2 className="font-serif text-xl font-semibold tracking-tight mb-4">Répartition contractuelle</h2>
          <div className="space-y-4">
            <Stat label="CDI" count={cdi} total={active.length} color="bg-ink" />
            <Stat label="CDD" count={cdd} total={active.length} color="bg-orange" />
            <Stat label="En congé / suspendu" count={enConge} total={EMPLOYEES.length} color="bg-n-300" />
          </div>
          <hr className="my-4 border-n-100" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Turnover 12 mois</p>
              <p className="font-serif font-semibold text-xl text-orange-deep mt-1">8,4 %</p>
              <p className="text-[11px] text-n-500 inline-flex items-center gap-1"><TrendingDown className="w-3 h-3" /> En baisse vs N-1 (11,2 %)</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Absentéisme</p>
              <p className="font-serif font-semibold text-xl mt-1">3,1 %</p>
              <p className="text-[11px] text-n-500">cible secteur · 4 %</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-n-200 rounded-sm p-6">
          <h2 className="font-serif text-xl font-semibold tracking-tight mb-4">Charges fiscales et sociales du mois</h2>
          <table className="w-full text-sm">
            <tbody>
              <Row label="Cotisations CNPS (sal.)" value={fcfa(Math.round(totals.cnps))} />
              <Row label="Cotisations CNPS (pat. 16,9 %)" value={fcfa(Math.round(totals.brut * 0.169))} />
              <Row label="ITS retenue à la source" value={fcfa(Math.round(totals.its))} />
              <Row label="Net versé aux salariés" value={fcfa(Math.round(totals.net))} bold />
              <tr><td colSpan={2}><hr className="my-2 border-n-200" /></td></tr>
              <Row label="Coût total employeur" value={fcfa(Math.round(totals.total))} accent />
            </tbody>
          </table>
          <p className="mt-4 text-xs text-n-600 italic">Conformité OHADA / SYSCOHADA · comptes 661, 422, 431, 447. Export disponible en haut de page.</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-tint to-white border-l-4 border-orange p-6 rounded-sm">
        <div className="flex items-start gap-4">
          <Briefcase className="w-6 h-6 text-orange shrink-0 mt-1" />
          <div className="flex-1">
            <p className="font-serif text-lg font-semibold">Décisions à prendre ce trimestre</p>
            <ul className="mt-3 space-y-2 text-sm text-n-700">
              <li className="flex items-start gap-2"><span className="text-orange font-bold">·</span> Verser la gratification 13<sup>e</sup> mois aux salariés ayant 12 mois d'ancienneté (échéance avant le 31 décembre).</li>
              <li className="flex items-start gap-2"><span className="text-orange font-bold">·</span> Préparer la DISA 2026 (Déclaration Individuelle Annuelle des Salaires) auprès de la DGI.</li>
              <li className="flex items-start gap-2"><span className="text-orange font-bold">·</span> Anticiper la revalorisation SMIG 2027 dans le budget RH (75 000 FCFA actuels).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function KPI({ label, value, sub, icon: Icon, accent, positive }: { label: string; value: string; sub: string; icon: any; accent?: boolean; positive?: boolean }) {
  return (
    <div className={`p-5 rounded-sm border ${accent ? 'bg-orange-tint border-orange/30' : 'bg-white border-n-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] tracking-[0.22em] uppercase text-n-500 font-semibold">{label}</p>
        <Icon className={`w-4 h-4 ${accent ? 'text-orange' : 'text-n-400'}`} />
      </div>
      <p className="font-serif font-semibold text-2xl tracking-tight leading-none">{value}</p>
      <p className={`text-[11px] font-medium mt-2 ${positive ? 'text-green-700' : accent ? 'text-orange-deep' : 'text-n-500'}`}>{sub}</p>
    </div>
  )
}

function Stat({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-n-700">{count} · {pct} %</span>
      </div>
      <div className="w-full bg-n-100 h-2 rounded-sm overflow-hidden">
        <div className={`${color} h-full`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <tr>
      <td className={`py-1.5 text-n-700 ${bold ? 'font-semibold text-ink' : ''} ${accent ? 'font-serif text-base text-orange-deep' : ''}`}>{label}</td>
      <td className={`py-1.5 text-right font-mono ${bold ? 'font-semibold' : ''} ${accent ? 'font-serif text-base font-semibold text-orange-deep' : ''}`}>{value}</td>
    </tr>
  )
}

function BarChart12({ baseBrut }: { baseBrut: number }) {
  const months = ['Déc.', 'Jan.', 'Fév.', 'Mar.', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.']
  const data = months.map((m, i) => ({ m, v: baseBrut * (0.85 + i * 0.013) }))
  const max = Math.max(...data.map((d) => d.v))
  return (
    <div className="flex items-end justify-between gap-1.5 h-44 mt-4">
      {data.map((d, i) => (
        <div key={d.m} className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[9px] font-mono text-n-500">{(d.v / 1_000_000).toFixed(1)}M</span>
          <div className="w-full bg-n-100 relative rounded-sm overflow-hidden" style={{ height: '140px' }}>
            <div className={`absolute bottom-0 left-0 right-0 ${i === data.length - 1 ? 'bg-orange' : 'bg-ink-3'} transition-all`} style={{ height: `${(d.v / max) * 100}%` }} />
          </div>
          <span className={`text-[9px] uppercase tracking-wider ${i === data.length - 1 ? 'text-orange font-semibold' : 'text-n-500'}`}>{d.m}</span>
        </div>
      ))}
    </div>
  )
}
