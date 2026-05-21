import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search, ArrowRight, Users, LayoutDashboard, Calculator, FileCheck2, Settings, FileText, Sparkles, CalendarDays, Wallet, UserCircle2, LogOut, BadgeCheck } from 'lucide-react'
import { useStore, store } from '../lib/store'
import { EMPLOYEES } from '../lib/mock'

const ADMIN_ACTIONS = [
  { id: 'a1', label: 'Aller au tableau de bord', icon: LayoutDashboard, to: '/app', tag: 'navigation' },
  { id: 'a2', label: 'Voir les salariés', icon: Users, to: '/app/employees', tag: 'navigation' },
  { id: 'a3', label: 'Lancer la paie mensuelle', icon: Calculator, to: '/app/payroll', tag: 'action' },
  { id: 'a9', label: 'Gérer les avances sur salaire', icon: Wallet, to: '/app/advances', tag: 'action' },
  { id: 'a4', label: 'Soumettre une déclaration CNPS', icon: FileCheck2, to: '/app/declarations', tag: 'action' },
  { id: 'a8', label: 'Valider une demande de congé', icon: CalendarDays, to: '/app/leave', tag: 'action' },
  { id: 'a5', label: 'Réglages de l\'espace', icon: Settings, to: '/app/settings', tag: 'navigation' },
  { id: 'a6', label: 'Ouvrir l\'assistant IA ADCA', icon: Sparkles, to: '', tag: 'ia', action: () => { store.closeSpotlight(); store.toggleChat() } },
  { id: 'a7', label: 'Voir l\'aperçu d\'un bulletin', icon: FileText, to: '/app/payroll/payslip/1', tag: 'action' },
  { id: 'a10', label: 'Basculer en mode salarié (démo)', icon: UserCircle2, to: '/app/me', tag: 'navigation' },
]

const EMPLOYEE_ACTIONS = [
  { id: 'e1', label: 'Mon profil',                       icon: UserCircle2,  to: '/app/me',              tag: 'navigation' },
  { id: 'e2', label: 'Consulter mes bulletins',          icon: FileText,     to: '/app/me?tab=payslips', tag: 'navigation' },
  { id: 'e3', label: 'Voir et poser mes congés',         icon: CalendarDays, to: '/app/me?tab=leave',    tag: 'action' },
  { id: 'e4', label: 'Télécharger une attestation',      icon: BadgeCheck,   to: '/app/me?tab=docs',     tag: 'action' },
  { id: 'e5', label: 'Quitter le mode salarié',          icon: LogOut,       to: '/app',                 tag: 'navigation' },
]

export function Spotlight({ isEmployeeMode = false }: { isEmployeeMode?: boolean }) {
  const ACTIONS = isEmployeeMode ? EMPLOYEE_ACTIONS : ADMIN_ACTIONS
  const open = useStore((s) => s.spotlightOpen)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mac = navigator.platform.toLowerCase().includes('mac')
      if ((mac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        store.toggleSpotlight()
      }
      if (e.key === 'Escape' && open) store.closeSpotlight()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  useEffect(() => {
    if (!open) setQ('')
  }, [open])

  if (!open) return null

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  const nq = norm(q)
  const employeeMatches = !isEmployeeMode && q.length > 0
    ? EMPLOYEES.filter((e) => norm(`${e.firstName} ${e.lastName} ${e.role} ${e.matricule}`).includes(nq)).slice(0, 5)
    : []
  const actionMatches = q.length > 0
    ? ACTIONS.filter((a) => norm(a.label).includes(nq))
    : ACTIONS

  const goto = (to: string, action?: () => void) => {
    if (action) { action(); return }
    if (to) { navigate({ to }); store.closeSpotlight() }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 bg-ink/40 backdrop-blur-sm" onClick={() => store.closeSpotlight()}>
      <div className="w-full max-w-xl bg-white rounded-sm shadow-2xl border border-n-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-n-100">
          <Search className="w-4 h-4 text-n-500" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un salarié, une action…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <kbd className="text-[10px] uppercase tracking-wider text-n-500 bg-n-100 px-1.5 py-0.5 rounded-sm">esc</kbd>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {employeeMatches.length > 0 && (
            <div>
              <p className="px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold bg-n-50">Salariés</p>
              {employeeMatches.map((e) => (
                <button key={e.id} onClick={() => goto(`/app/employees/${e.id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-orange-tint group">
                  <div className="w-7 h-7 bg-n-100 group-hover:bg-orange group-hover:text-white text-n-700 font-semibold text-[10px] rounded-full flex items-center justify-center shrink-0">{e.firstName[0]}{e.lastName[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.firstName} {e.lastName}</p>
                    <p className="text-[11px] text-n-500 truncate">{e.role}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-n-400 group-hover:text-orange" />
                </button>
              ))}
            </div>
          )}
          {actionMatches.length > 0 && (
            <div>
              <p className="px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold bg-n-50">Actions et navigation</p>
              {actionMatches.map((a) => (
                <button key={a.id} onClick={() => goto(a.to, (a as any).action)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-orange-tint group">
                  <a.icon className="w-4 h-4 text-n-500 group-hover:text-orange shrink-0" />
                  <span className="flex-1 text-sm">{a.label}</span>
                  <span className="text-[9px] uppercase tracking-wider text-n-400 bg-n-100 px-1.5 py-0.5 rounded-sm">{a.tag}</span>
                </button>
              ))}
            </div>
          )}
          {q && employeeMatches.length === 0 && actionMatches.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-n-500">Aucun résultat pour « {q} ». Essayez « paie », « CNPS » ou un nom de salarié.</p>
          )}
        </div>
        <div className="px-4 py-2 border-t border-n-100 flex items-center justify-between text-[10px] uppercase tracking-wider text-n-500">
          <span>Spotlight ADC Paie</span>
          <span className="flex items-center gap-1">
            <kbd className="bg-n-100 px-1.5 py-0.5 rounded-sm">⌘</kbd>
            <kbd className="bg-n-100 px-1.5 py-0.5 rounded-sm">K</kbd>
            pour ouvrir
          </span>
        </div>
      </div>
    </div>
  )
}
