import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router'
import { LayoutDashboard, Users, Calculator, FileCheck2, Settings, Search, Bell, ChevronRight, Sparkles, CalendarDays, UserCircle2, Wallet } from 'lucide-react'
import { CURRENT_USER, TENANT } from '../lib/mock'
import { Spotlight } from '../components/spotlight'
import { NotificationsPanel, Toast } from '../components/notifications'
import { ADCAChat, ChatFAB } from '../components/adca-chat'
import { HelpModal, OnboardingWizard } from '../components/extras'
import { useStore, store } from '../lib/store'

export const Route = createFileRoute('/app')({ component: AppLayout })

const NAV = [
  { to: '/app', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { to: '/app/employees', label: 'Salariés', icon: Users },
  { to: '/app/payroll', label: 'Paie mensuelle', icon: Calculator },
  { to: '/app/advances', label: 'Avances sur salaire', icon: Wallet },
  { to: '/app/leave', label: 'Congés & absences', icon: CalendarDays },
  { to: '/app/declarations', label: 'Déclarations', icon: FileCheck2 },
  { to: '/app/settings', label: 'Réglages', icon: Settings },
]

function AppLayout() {
  const loc = useLocation()
  const unread = useStore((s) => s.notifs.filter((n) => !n.read).length)
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')
  return (
    <div className="min-h-screen flex bg-n-50">
      <aside className="hidden lg:flex flex-col w-64 bg-ink-2 text-white shrink-0">
        <Link to="/" className="px-6 py-5 border-b border-white/10 block">
          <span className="font-serif text-xl font-semibold">ADC <span style={{color:'var(--color-orange)',fontStyle:'italic',fontWeight:500}}>Paie</span></span>
        </Link>
        <button onClick={() => store.toast('Multi-établissements disponible en tier Business', 'info')} className="px-6 py-4 border-b border-white/10 text-left hover:bg-white/5">
          <p className="text-[10px] tracking-[0.22em] uppercase text-n-400 font-semibold mb-1">Espace</p>
          <p className="text-sm font-semibold truncate">{TENANT.name}</p>
          <p className="text-[11px] text-n-400 mt-0.5">IFU · {TENANT.ifu}</p>
        </button>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => {
            const active = item.exact ? loc.pathname === item.to : loc.pathname.startsWith(item.to)
            return (
              <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-sm ${active ? 'bg-orange text-white' : 'text-n-300 hover:bg-white/5 hover:text-white'}`}>
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <button onClick={() => store.toggleChat()} className="mx-3 mb-3 px-3 py-2.5 bg-orange/10 border border-orange/30 text-orange hover:bg-orange/20 rounded-sm flex items-center gap-2 text-sm font-medium transition-colors">
          <Sparkles className="w-4 h-4" /> Demander à ADCA
        </button>
        <div className="px-3 pb-3">
          <Link to="/app/me" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-n-300 hover:bg-white/5 hover:text-white rounded-sm transition-colors border border-white/10">
            <UserCircle2 className="w-4 h-4 shrink-0" />
            <span>Mode salarié</span>
            <span className="ml-auto text-[9px] uppercase tracking-wider text-orange font-semibold">démo</span>
          </Link>
        </div>
        <div className="px-6 py-4 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 bg-orange text-white font-semibold text-sm rounded-full flex items-center justify-center shrink-0">{CURRENT_USER.initials}</div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{CURRENT_USER.name}</p>
            <p className="text-[11px] text-n-400 truncate">{CURRENT_USER.role}</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-n-200 sticky top-0 z-30">
          <div className="px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
            <Link to="/app" className="lg:hidden font-serif text-base font-semibold">ADC <span className="em-serif">Paie</span></Link>
            <div className="hidden md:flex items-center gap-2 text-[13px] text-n-500">
              <Link to="/app" className="hover:text-orange">Espace</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-ink font-medium">{NAV.find(n => n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to))?.label || 'Tableau de bord'}</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => store.openSpotlight()} className="hidden md:flex items-center gap-2 bg-n-50 hover:bg-n-100 px-3 py-1.5 rounded-sm border border-n-200 w-64 transition-colors">
                <Search className="w-3.5 h-3.5 text-n-500" />
                <span className="text-sm text-n-500 flex-1 text-left">Rechercher…</span>
                <kbd className="text-[10px] bg-white border border-n-200 px-1.5 py-0.5 rounded-sm text-n-500">{isMac ? '⌘' : 'Ctrl'} K</kbd>
              </button>
              <button onClick={() => store.openSpotlight()} className="md:hidden w-9 h-9 hover:bg-n-100 rounded-sm inline-flex items-center justify-center">
                <Search className="w-4 h-4 text-n-700" />
              </button>
              <button onClick={() => store.toggleNotif()} className="w-9 h-9 flex items-center justify-center hover:bg-n-100 rounded-sm relative">
                <Bell className="w-4 h-4 text-n-700" />
                {unread > 0 && <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unread}</span>}
              </button>
              <div className="lg:hidden w-9 h-9 bg-orange text-white font-semibold text-xs rounded-full flex items-center justify-center">{CURRENT_USER.initials}</div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <Spotlight />
      <NotificationsPanel />
      <ADCAChat />
      <ChatFAB />
      <Toast />
      <HelpModal />
      <OnboardingWizard />
    </div>
  )
}
