import { useEffect, useState } from 'react'
import { X, Keyboard, Sparkles, AlertTriangle, TrendingDown, TrendingUp, ChevronRight } from 'lucide-react'
import { EMPLOYEES, fcfa } from '../lib/mock'

const TIPS = [
  { k: ['⌘', 'K'], label: 'Ouvrir la recherche globale (Spotlight)' },
  { k: ['?'], label: 'Afficher cette aide' },
  { k: ['Esc'], label: 'Fermer un panneau ou un modal' },
  { k: ['G', 'D'], label: 'Aller au tableau de bord' },
  { k: ['G', 'S'], label: 'Aller aux salariés' },
  { k: ['G', 'P'], label: 'Aller à la paie' },
  { k: ['G', 'C'], label: 'Aller aux congés' },
]

export function HelpModal() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setOpen(v => !v) }
      if (e.key === 'Escape' && open) setOpen(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] bg-ink/40 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div className="bg-white w-full max-w-md rounded-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-n-200 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold tracking-tight inline-flex items-center gap-2"><Keyboard className="w-4 h-4 text-orange" />Raccourcis clavier</h3>
          <button onClick={() => setOpen(false)} className="w-8 h-8 hover:bg-n-100 rounded-sm flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <ul className="p-5 space-y-2.5">
          {TIPS.map((t, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span className="text-n-700">{t.label}</span>
              <span className="flex gap-1">{t.k.map((kk, j) => <kbd key={j} className="bg-n-100 px-2 py-0.5 text-[11px] font-mono rounded-sm border border-n-200">{kk}</kbd>)}</span>
            </li>
          ))}
        </ul>
        <p className="px-5 pb-5 text-[11px] text-n-500">Astuce · appuyez sur <kbd className="bg-n-100 px-1.5 py-0.5 text-[10px] font-mono rounded-sm">?</kbd> à tout moment pour ouvrir cette aide.</p>
      </div>
    </div>
  )
}

export function OnboardingWizard() {
  const [step, setStep] = useState(() => typeof localStorage !== 'undefined' && localStorage.getItem('adc-onboarded') === '1' ? -1 : 0)
  if (step < 0) return null
  const steps = [
    { title: 'Bienvenue dans ADC Paie', desc: 'Vous êtes dans la démo interactive. Toutes les données sont fictives, toutes les fonctionnalités testables.' },
    { title: 'Spotlight ⌘K', desc: 'Appuyez sur ⌘K (ou Ctrl+K) à tout moment pour rechercher un salarié, ouvrir une page ou lancer une action.' },
    { title: 'Assistant IA ADCA', desc: 'Le bouton orange en bas à droite ouvre votre assistant paie. Demandez-lui de calculer un net, expliquer un barème ITS ou générer un bordereau.' },
    { title: 'Vous êtes prêt', desc: 'Explorez le tableau de bord, la paie de novembre, les congés à valider et les déclarations CNPS à soumettre.' },
  ]
  const finish = () => { localStorage.setItem('adc-onboarded', '1'); setStep(-1) }
  const s = steps[step]
  return (
    <div className="fixed inset-0 z-[95] bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-orange to-orange-deep text-white px-6 py-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.22em] font-semibold">Étape {step + 1} sur {steps.length}</span>
          </div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight">{s.title}</h2>
        </div>
        <p className="px-6 py-5 text-sm text-n-700 leading-relaxed">{s.desc}</p>
        <div className="px-6 pb-5 flex items-center justify-between gap-2">
          <button onClick={finish} className="text-xs text-n-500 hover:text-ink font-medium">Passer</button>
          <div className="flex gap-2">
            {step > 0 && <button onClick={() => setStep(step - 1)} className="px-4 h-9 text-sm border border-n-300 rounded-sm hover:bg-n-50">Précédent</button>}
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="px-4 h-9 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep inline-flex items-center gap-2">Suivant <ChevronRight className="w-3.5 h-3.5" /></button>
            ) : (
              <button onClick={finish} className="px-4 h-9 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep">Commencer</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AnomaliesBanner() {
  const [open, setOpen] = useState(false)
  const anomalies = [
    { empId: '4', kind: 'Variation salariale anormale', detail: 'Brut +18 % vs moyenne 6 derniers mois', severity: 'high' as const, icon: TrendingUp },
    { empId: '11', kind: 'CDD arrivant à échéance', detail: 'Fin de contrat le 28 février 2027 · à renouveler ou clôturer', severity: 'med' as const, icon: TrendingDown },
    { empId: '14', kind: 'Période d\'essai à valider', detail: 'Ousmane Coulibaly · décision sous 7 jours', severity: 'med' as const, icon: TrendingDown },
  ]
  return (
    <div className="bg-orange-tint border-l-4 border-orange rounded-sm overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-orange-tint/70 transition-colors">
        <div className="flex items-center gap-3 text-left">
          <div className="w-9 h-9 bg-orange text-white rounded-sm flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-ink text-sm inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-deep" />
              {anomalies.length} anomalies détectées par l'IA
            </p>
            <p className="text-xs text-n-700 mt-0.5">Analyse comportementale et conformité · mis à jour il y a 4 min</p>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-orange-deep transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <ul className="border-t border-orange/20 bg-white">
          {anomalies.map((a, i) => {
            const emp = EMPLOYEES.find((e) => e.id === a.empId)
            if (!emp) return null
            return (
              <li key={i} className="px-5 py-3 border-b border-n-100 last:border-0 flex items-start gap-3">
                <a.icon className={`w-4 h-4 mt-0.5 shrink-0 ${a.severity === 'high' ? 'text-red-600' : 'text-orange'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{emp.firstName} {emp.lastName} · {a.kind}</p>
                  <p className="text-xs text-n-600 mt-0.5">{a.detail}</p>
                </div>
                <a href={`/app/employees/${emp.id}`} className="text-xs font-semibold text-orange hover:text-orange-deep">Voir →</a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
