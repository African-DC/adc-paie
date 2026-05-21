import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Filter, Download, MoreHorizontal, Search, ArrowUpDown, ArrowUp, ArrowDown, X, Upload, LayoutGrid, List, Mail, Phone } from 'lucide-react'
import { useState, useMemo } from 'react'
import { EMPLOYEES, fcfa } from '../lib/mock'
import { store } from '../lib/store'
import { HireWizard } from '../components/hire-wizard'

export const Route = createFileRoute('/app/employees/')({
  component: EmployeesPage,
})

type SortKey = 'name' | 'role' | 'brut' | 'joined' | null
type SortDir = 'asc' | 'desc'

function EmployeesPage() {
  const [filter, setFilter] = useState<'all' | 'CDI' | 'CDD'>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>(null)
  const [dir, setDir] = useState<SortDir>('asc')
  const [hireOpen, setHireOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [view, setView] = useState<'table' | 'grid'>('table')

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')

  const list = useMemo(() => {
    const nq = norm(query)
    let l = EMPLOYEES.filter((e) => filter === 'all' ? true : e.contract === filter)
    if (nq) {
      l = l.filter((e) => norm(`${e.firstName} ${e.lastName} ${e.role} ${e.matricule}`).includes(nq))
    }
    if (sort) {
      const m = dir === 'asc' ? 1 : -1
      l = [...l].sort((a, b) => {
        if (sort === 'name') return a.lastName.localeCompare(b.lastName) * m
        if (sort === 'role') return a.role.localeCompare(b.role) * m
        if (sort === 'brut') return (a.brut - b.brut) * m
        if (sort === 'joined') return a.joinedAt.localeCompare(b.joinedAt) * m
        return 0
      })
    }
    return l
  }, [filter, query, sort, dir])

  const toggleSort = (k: SortKey) => {
    if (sort === k) setDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSort(k); setDir('asc') }
  }

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
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-2 border border-n-300 text-n-700 px-3 h-9 text-xs font-medium hover:bg-n-50 transition-colors rounded-sm uppercase tracking-wider" title="Importer depuis Excel">
            <Upload className="w-3.5 h-3.5" /> Importer
          </button>
          <button onClick={() => store.toast('Annuaire salariés exporté au format Excel', 'success')} className="inline-flex items-center gap-2 border border-n-300 text-n-700 px-3 h-9 text-xs font-medium hover:bg-n-50 transition-colors rounded-sm uppercase tracking-wider" title="Exporter au format Excel">
            <Download className="w-3.5 h-3.5" /> Exporter
          </button>
          <button onClick={() => setHireOpen(true)} className="inline-flex items-center gap-2 bg-orange text-white px-4 h-9 text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm">
            <Plus className="w-3.5 h-3.5" /> Ajouter un salarié
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-n-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, fonction ou matricule…"
            className="w-full h-10 pl-10 pr-9 border border-n-300 rounded-sm text-sm bg-white focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 hover:bg-n-100 rounded-sm inline-flex items-center justify-center" aria-label="Effacer">
              <X className="w-3.5 h-3.5 text-n-500" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 border-l border-n-200 pl-3">
          <span className="text-[10px] uppercase tracking-wider text-n-500 font-semibold mr-1 inline-flex items-center gap-1.5"><Filter className="w-3 h-3" /> Contrat</span>
          {[
            { v: 'all', label: 'Tous' }, { v: 'CDI', label: 'CDI' }, { v: 'CDD', label: 'CDD' },
          ].map((f) => (
            <button key={f.v} onClick={() => setFilter(f.v as any)} className={`px-3 h-8 text-xs font-semibold uppercase tracking-wider transition-colors rounded-sm ${filter === f.v ? 'bg-ink text-white' : 'text-n-700 hover:bg-n-100'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center bg-n-100 rounded-sm p-0.5 border border-n-200">
          <button onClick={() => setView('table')} title="Vue liste" className={`w-8 h-7 inline-flex items-center justify-center rounded-sm transition-colors ${view === 'table' ? 'bg-white shadow-sm text-orange' : 'text-n-500 hover:text-ink'}`}>
            <List className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setView('grid')} title="Trombinoscope" className={`w-8 h-7 inline-flex items-center justify-center rounded-sm transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-orange' : 'text-n-500 hover:text-ink'}`}>
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        list.length === 0 ? (
          <div className="bg-white border border-n-200 rounded-sm p-12 text-center">
            <Search className="w-8 h-8 text-n-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-n-700">Aucun salarié trouvé</p>
            <button onClick={() => { setQuery(''); setFilter('all') }} className="mt-3 text-xs font-semibold text-orange hover:text-orange-deep uppercase tracking-wider">Réinitialiser</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {list.map((e) => (
              <Link key={e.id} to="/app/employees/$id" params={{ id: e.id }} className="bg-white border border-n-200 hover:border-orange rounded-sm p-5 group transition-all hover:shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 bg-orange/10 group-hover:bg-orange group-hover:text-white text-orange-deep font-serif font-semibold text-xl rounded-full flex items-center justify-center transition-colors">{e.firstName[0]}{e.lastName[0]}</div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${e.status === 'active' ? 'bg-green-500' : 'bg-n-400'}`} title={e.status === 'active' ? 'Actif' : 'En congé'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm group-hover:text-orange transition-colors truncate">{e.firstName} {e.lastName}</p>
                    <p className="text-[11px] text-n-500 truncate">{e.role}</p>
                    <span className={`mt-1.5 inline-block px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-sm ${e.contract === 'CDI' ? 'bg-ink-2 text-white' : 'bg-orange-tint text-orange-deep'}`}>{e.contract}</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-[11px] text-n-600 border-t border-n-100 pt-3">
                  <div className="inline-flex items-center gap-1.5"><Mail className="w-3 h-3" /><span className="truncate">{e.firstName.toLowerCase()}.{e.lastName.toLowerCase()}@example.ci</span></div>
                  <div className="inline-flex items-center gap-1.5"><Phone className="w-3 h-3" /> +225 07 ** ** ** **</div>
                  <div className="flex items-center justify-between pt-1.5">
                    <span className="font-mono text-[10px] text-n-500">{e.matricule}</span>
                    <span className="font-mono font-semibold text-orange-deep">{fcfa(e.brut)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
      <div className="bg-white border border-n-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-n-50 border-b border-n-200">
              <tr>
                <SortHeader k="name" current={sort} dir={dir} onClick={toggleSort}>Salarié</SortHeader>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Matricule CNPS</th>
                <SortHeader k="role" current={sort} dir={dir} onClick={toggleSort}>Fonction</SortHeader>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Contrat</th>
                <SortHeader k="brut" current={sort} dir={dir} onClick={toggleSort} right>Brut mensuel</SortHeader>
                <th className="text-center px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Statut</th>
                <th className="px-2 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Search className="w-8 h-8 text-n-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-n-700">Aucun salarié trouvé</p>
                    <p className="text-xs text-n-500 mt-1">Essayez un autre nom ou changez les filtres.</p>
                    <button onClick={() => { setQuery(''); setFilter('all') }} className="mt-3 text-xs font-semibold text-orange hover:text-orange-deep uppercase tracking-wider">Réinitialiser</button>
                  </td>
                </tr>
              ) : (
                list.map((e) => (
                  <tr key={e.id} className="border-b border-n-100 hover:bg-n-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to="/app/employees/$id" params={{ id: e.id }} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-n-100 group-hover:bg-orange group-hover:text-white text-n-700 font-semibold text-xs rounded-full flex items-center justify-center shrink-0 transition-colors">
                          {e.firstName[0]}{e.lastName[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate group-hover:text-orange transition-colors">{e.firstName} {e.lastName}</p>
                          <p className="text-[11px] text-n-500">Depuis {e.joinedAt}</p>
                        </div>
                      </Link>
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
                      <button onClick={() => store.toast(`Menu contextuel ${e.firstName} ${e.lastName}`, 'info')} title="Plus d'options" className="w-8 h-8 hover:bg-n-100 rounded-sm inline-flex items-center justify-center">
                        <MoreHorizontal className="w-4 h-4 text-n-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-n-200 bg-n-50 flex items-center justify-between text-xs text-n-600">
          <span>{list.length} salarié{list.length > 1 ? 's' : ''} affiché{list.length > 1 ? 's' : ''}{query && ` · recherche « ${query} »`}</span>
          <div className="flex items-center gap-1">
            <button className="px-3 h-7 hover:bg-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled>Précédent</button>
            <span className="px-2">Page 1 / 1</span>
            <button className="px-3 h-7 hover:bg-white rounded-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled>Suivant</button>
          </div>
        </div>
      </div>
      )}
      <HireWizard open={hireOpen} onClose={() => setHireOpen(false)} />
      <ImportEmployeesModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  )
}

function ImportEmployeesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phase, setPhase] = useState<'drop' | 'preview' | 'importing' | 'done'>('drop')
  const [count, setCount] = useState(0)
  if (!open) return null
  const handleFile = () => {
    const n = 8 + Math.floor(Math.random() * 12)
    setCount(n); setPhase('preview')
  }
  const doImport = () => {
    setPhase('importing')
    setTimeout(() => setPhase('done'), 1500)
  }
  const close = () => { setPhase('drop'); setCount(0); onClose() }
  return (
    <div className="fixed inset-0 z-[85] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={close}>
      <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-n-200 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold tracking-tight inline-flex items-center gap-2"><Upload className="w-4 h-4 text-orange" /> Importer des salariés</h3>
          <button onClick={close} className="w-8 h-8 hover:bg-n-100 rounded-sm flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        {phase === 'drop' && (
          <div className="p-6">
            <button onClick={handleFile} className="w-full border-2 border-dashed border-n-300 rounded-sm py-10 hover:border-orange hover:bg-orange-tint/30 transition-colors text-center">
              <Upload className="w-8 h-8 text-n-400 mx-auto mb-2" />
              <p className="text-sm font-semibold">Cliquez pour sélectionner un fichier</p>
              <p className="text-xs text-n-500 mt-1">Excel .xlsx, CSV ou Google Sheets (10 Mo max)</p>
            </button>
            <div className="mt-4 p-3 bg-n-50 border border-n-200 rounded-sm text-xs text-n-700">
              <p className="font-semibold text-ink mb-1">Modèle attendu</p>
              <p>Colonnes : Prénom, Nom, Matricule CNPS, Fonction, Type contrat (CDI/CDD), Salaire brut, Date embauche, E-mail.</p>
              <button onClick={() => store.toast('Modèle Excel téléchargé', 'success')} className="mt-2 text-orange font-semibold hover:underline">Télécharger le modèle</button>
            </div>
          </div>
        )}
        {phase === 'preview' && (
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 p-3 rounded-sm text-sm text-green-800 mb-4">
              <p className="font-semibold">Fichier validé · {count} salariés détectés</p>
              <p className="text-xs mt-1">Aucune erreur de format. Tous les matricules CNPS sont valides.</p>
            </div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-2">Aperçu (3 premières lignes)</p>
            <div className="border border-n-200 rounded-sm overflow-hidden text-xs">
              {['Aminata Touré · Comptable · CDI · 380 000 XOF', 'Yacouba Sanogo · Commercial · CDD · 220 000 XOF', 'Mariam Bamba · Designer · CDI · 410 000 XOF'].map((l, i) => (
                <div key={i} className="px-3 py-2 border-b border-n-100 last:border-0 font-mono text-[11px]">{l}</div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={close} className="px-4 h-10 text-sm border border-n-300 rounded-sm hover:bg-n-50">Annuler</button>
              <button onClick={doImport} className="px-4 h-10 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep">Importer {count} salariés</button>
            </div>
          </div>
        )}
        {phase === 'importing' && (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-serif text-lg font-semibold">Import en cours…</p>
            <p className="text-xs text-n-500 mt-1">Création des fiches et déclarations CNPS</p>
          </div>
        )}
        {phase === 'done' && (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-serif text-xl font-semibold">{count} salariés importés</p>
            <p className="text-xs text-n-500 mt-1">Toutes les fiches sont actives. DPAE soumises à la CNPS.</p>
            <button onClick={close} className="mt-5 px-5 h-10 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep">Fermer</button>
          </div>
        )}
      </div>
    </div>
  )
}

function SortHeader({ k, current, dir, onClick, children, right }: { k: SortKey; current: SortKey; dir: SortDir; onClick: (k: SortKey) => void; children: React.ReactNode; right?: boolean }) {
  const active = current === k
  const Icon = active ? (dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <th className={`px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700 ${right ? 'text-right' : 'text-left'}`}>
      <button onClick={() => onClick(k)} className={`inline-flex items-center gap-1.5 hover:text-orange transition-colors ${active ? 'text-orange' : ''}`}>
        {children}
        <Icon className={`w-3 h-3 ${active ? '' : 'text-n-400'}`} />
      </button>
    </th>
  )
}
