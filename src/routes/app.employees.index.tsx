import { createFileRoute } from '@tanstack/react-router'
import { Plus, Filter, Download, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { EMPLOYEES, fcfa } from '../lib/mock'

export const Route = createFileRoute('/app/employees/')({
  component: EmployeesPage,
})

function EmployeesPage() {
  const [filter, setFilter] = useState<'all' | 'CDI' | 'CDD'>('all')
  const list = EMPLOYEES.filter(e => filter === 'all' ? true : e.contract === filter)
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Effectif</p>
          <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">
            Salariés <span className="em-serif">actifs</span>
          </h1>
          <p className="mt-2 text-n-700">{EMPLOYEES.filter(e => e.status === 'active').length} salariés en poste · {EMPLOYEES.filter(e => e.status === 'leave').length} en congé</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 border border-n-300 text-n-700 px-4 h-9 text-sm font-medium hover:bg-n-50 transition-colors rounded-sm">
            <Download className="w-3.5 h-3.5" /> Exporter
          </button>
          <button className="inline-flex items-center gap-2 bg-orange text-white px-4 h-9 text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors">
            <Plus className="w-3.5 h-3.5" /> Ajouter un salarié
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-n-200 pb-3">
        <span className="text-xs uppercase tracking-wider text-n-500 font-semibold mr-2 inline-flex items-center gap-1.5"><Filter className="w-3 h-3" /> Filtrer</span>
        {[
          { v: 'all', label: 'Tous' }, { v: 'CDI', label: 'CDI' }, { v: 'CDD', label: 'CDD' },
        ].map((f) => (
          <button key={f.v} onClick={() => setFilter(f.v as any)} className={`px-3 h-8 text-xs font-semibold uppercase tracking-wider transition-colors rounded-sm ${filter === f.v ? 'bg-ink text-white' : 'text-n-700 hover:bg-n-100'}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-n-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-n-50 border-b border-n-200">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Salarié</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Matricule CNPS</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Fonction</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Contrat</th>
                <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Brut mensuel</th>
                <th className="text-center px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Statut</th>
                <th className="px-2 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id} className="border-b border-n-100 hover:bg-n-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-n-100 text-n-700 font-semibold text-xs rounded-full flex items-center justify-center shrink-0">
                        {e.firstName[0]}{e.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{e.firstName} {e.lastName}</p>
                        <p className="text-[11px] text-n-500">Depuis {e.joinedAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-n-600">{e.matricule}</td>
                  <td className="px-4 py-3 text-n-700">{e.role}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm ${e.contract === 'CDI' ? 'bg-ink-2 text-white' : 'bg-orange-tint text-orange-deep'}`}>
                      {e.contract}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-right font-semibold">{fcfa(e.brut)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${e.status === 'active' ? 'text-green-700' : 'text-n-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${e.status === 'active' ? 'bg-green-500' : 'bg-n-400'}`} />
                      {e.status === 'active' ? 'Actif' : 'Congé'}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <button className="w-8 h-8 hover:bg-n-100 rounded-sm inline-flex items-center justify-center">
                      <MoreHorizontal className="w-4 h-4 text-n-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-n-200 bg-n-50 flex items-center justify-between text-xs text-n-600">
          <span>{list.length} salariés affichés</span>
          <div className="flex items-center gap-1">
            <button className="px-3 h-7 hover:bg-white rounded-sm" disabled>Précédent</button>
            <span className="px-2">Page 1 / 1</span>
            <button className="px-3 h-7 hover:bg-white rounded-sm" disabled>Suivant</button>
          </div>
        </div>
      </div>
    </div>
  )
}
