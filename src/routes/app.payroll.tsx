import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Calculator, FileText, ChevronDown, Calendar } from 'lucide-react'
import { EMPLOYEES, computePayslip, fcfa } from '../lib/mock'

export const Route = createFileRoute('/app/payroll')({
  component: PayrollPage,
})

function PayrollPage() {
  const [month] = useState('Novembre 2026')
  const active = EMPLOYEES.filter(e => e.status === 'active')
  const totals = active.reduce((acc, e) => {
    const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
    return { brut: acc.brut + e.brut, cnps: acc.cnps + p.cnps, its: acc.its + p.its, igr: acc.igr + p.igr, cn: acc.cn + p.cn, net: acc.net + p.net, patron: acc.patron + p.patron }
  }, { brut: 0, cnps: 0, its: 0, igr: 0, cn: 0, net: 0, patron: 0 })

  return (
    <div className="space-y-6 pb-32">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Cycle de paie</p>
          <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">
            Saisie <span className="em-serif">mensuelle</span>
          </h1>
          <p className="mt-2 text-n-700 inline-flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange" /> Période · <strong>{month}</strong>
          </p>
        </div>
        <button className="inline-flex items-center gap-2 border border-n-300 px-4 h-9 text-sm font-medium hover:bg-n-50 transition-colors rounded-sm">
          Changer de période <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-white border border-n-200 rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-n-200 bg-n-50 flex items-center justify-between">
          <p className="text-sm font-semibold">Détail par salarié · {active.length} bulletins à générer</p>
          <p className="text-[11px] text-n-500">Pré-rempli avec les contrats. Modifiez si besoin.</p>
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
              </tr>
            </thead>
            <tbody>
              {active.map((e) => {
                const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
                return (
                  <tr key={e.id} className="border-b border-n-100 hover:bg-n-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-n-100 text-n-700 font-semibold text-[10px] rounded-full flex items-center justify-center shrink-0">
                          {e.firstName[0]}{e.lastName[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[13px] truncate">{e.firstName} {e.lastName}</p>
                          <p className="text-[10px] text-n-500">{e.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3"><input defaultValue="22" className="w-12 bg-n-50 border border-n-200 px-2 py-1 text-center text-xs font-mono rounded-sm focus:outline-none focus:border-orange" /></td>
                    <td className="text-right px-3 py-3 font-mono text-xs">{fcfa(e.brut)}</td>
                    <td className="text-right px-3 py-3"><input defaultValue="0" className="w-20 bg-n-50 border border-n-200 px-2 py-1 text-right text-xs font-mono rounded-sm focus:outline-none focus:border-orange" /></td>
                    <td className="text-right px-3 py-3 font-mono text-xs text-n-600">- {fcfa(Math.round(p.cnps))}</td>
                    <td className="text-right px-3 py-3 font-mono text-xs text-n-600">- {fcfa(Math.round(p.its))}</td>
                    <td className="text-right px-3 py-3 font-mono text-sm font-semibold text-orange-deep">{fcfa(Math.round(p.net))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t-2 border-orange shadow-[0_-4px_24px_rgba(0,0,0,0.06)] z-30">
        <div className="px-6 lg:px-8 py-4 flex items-center justify-between gap-6 flex-wrap">
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-2 text-xs">
            <div><p className="text-[10px] uppercase tracking-wider text-n-500">Total brut</p><p className="font-mono font-semibold">{fcfa(Math.round(totals.brut))}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-n-500">Total CNPS</p><p className="font-mono font-semibold">{fcfa(Math.round(totals.cnps + totals.its + totals.igr + totals.cn))}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-n-500">Charges patronales</p><p className="font-mono font-semibold">{fcfa(Math.round(totals.patron))}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-orange-deep font-semibold">Net total à payer</p><p className="font-serif font-semibold text-lg text-orange-deep">{fcfa(Math.round(totals.net))}</p></div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="inline-flex items-center gap-2 border border-n-300 px-4 h-10 text-sm font-medium hover:bg-n-50 transition-colors rounded-sm">
              <FileText className="w-4 h-4" /> Enregistrer brouillon
            </button>
            <button className="inline-flex items-center gap-2 bg-orange text-white px-5 h-10 text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors">
              <Calculator className="w-4 h-4" /> Calculer et générer bulletins
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
