import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Users, Calculator, FileCheck2, Settings, Search, Bell, ChevronRight, Sparkles, CalendarDays, UserCircle2, Wallet, Menu, X, FileText, BadgeCheck, ShieldCheck, ArrowLeftRight, LogOut, Clock } from 'lucide-react'
import { CURRENT_USER, TENANT, EMPLOYEES } from '../lib/mock'
import { Spotlight } from '../components/spotlight'
import { NotificationsPanel, Toast } from '../components/notifications'
import { ADCAChat, ChatFAB } from '../components/adca-chat'
import { HelpModal, OnboardingWizard } from '../components/extras'
import { HireWizard } from '../components/hire-wizard'
import { ConfirmDialog } from '../components/confirm-dialog'
import { useStore, store } from '../lib/store'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/app')({ component: AppLayout })

const ADMIN_NAV = [
  { to: '/app',              label: 'Tableau de bord',     icon: LayoutDashboard, exact: true },
  { to: '/app/employees',    label: 'Salariés',            icon: Users },
  { to: '/app/payroll',      label: 'Paie mensuelle',      icon: Calculator },
  { to: '/app/advances',     label: 'Avances sur salaire', icon: Wallet },
  { to: '/app/attendance',   label: 'Pointage & présences', icon: Clock },
  { to: '/app/leave',        label: 'Congés & absences',   icon: CalendarDays },
  { to: '/app/declarations', label: 'Déclarations',        icon: FileCheck2 },
  { to: '/app/settings',     label: 'Réglages',            icon: Settings },
]

const EMPLOYEE_NAV = [
  { to: '/app/me',              tab: 'home',      label: 'Mon profil',     icon: UserCircle2 },
  { to: '/app/me?tab=payslips', tab: 'payslips',  label: 'Mes bulletins',  icon: FileText },
  { to: '/app/me?tab=leave',    tab: 'leave',     label: 'Mes congés',     icon: CalendarDays },
  { to: '/app/me?tab=docs',     tab: 'docs',      label: 'Mes documents',  icon: BadgeCheck },
]

const ME = EMPLOYEES.find((e) => e.id === '4')!

function AppLayout() {
  const loc = useLocation()
  const navigate = useNavigate()
  const unread = useStore((s) => s.notifs.filter((n) => !n.read).length)
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')
  const [drawer, setDrawer] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  useEffect(() => { setDrawer(false) }, [loc.pathname])

  const search = (loc as any).searchStr || (typeof window !== 'undefined' ? window.location.search : '') || ''
  const isEmployeeMode = loc.pathname.startsWith('/app/me') || search.includes('from=me')
  const tabMatch = search.match(/tab=([^&]+)/)
  const currentTab = tabMatch ? decodeURIComponent(tabMatch[1]) : 'home'
  const NAV = isEmployeeMode ? EMPLOYEE_NAV : ADMIN_NAV
  const breadcrumb = isEmployeeMode
    ? EMPLOYEE_NAV.find((n) => n.tab === currentTab)?.label || 'Mon espace salarié'
    : ADMIN_NAV.find((n) => n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to))?.label || 'Tableau de bord'

  return (
    <div className="min-h-screen flex bg-n-50">
      {drawer && <div className="fixed inset-0 bg-ink/60 z-40 lg:hidden" onClick={() => setDrawer(false)} />}
      <aside className={`fixed lg:sticky inset-y-0 lg:inset-y-auto lg:top-0 lg:h-screen left-0 w-72 lg:w-64 bg-ink-2 text-white shrink-0 z-50 lg:z-auto transform transition-transform duration-200 lg:transform-none flex flex-col ${drawer ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <Link to={isEmployeeMode ? '/app/me' : '/app'} className="block" title={isEmployeeMode ? 'Mon espace salarié' : 'Accueil dashboard'}>
            <span className="font-serif text-xl font-semibold">ADC <span style={{color:'var(--color-orange)',fontStyle:'italic',fontWeight:500}}>Paie</span></span>
          </Link>
          <button onClick={() => setDrawer(false)} className="lg:hidden w-8 h-8 rounded-sm hover:bg-white/10 flex items-center justify-center" aria-label="Fermer le menu">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isEmployeeMode ? (
          <button onClick={() => store.toast('Multi-établissements disponible en tier Business', 'info')} className="px-6 py-4 border-b border-white/10 text-left hover:bg-white/5">
            <p className="text-[10px] tracking-[0.22em] uppercase text-n-400 font-semibold mb-1">Espace administrateur</p>
            <p className="text-sm font-semibold truncate">{TENANT.name}</p>
            <p className="text-[11px] text-n-400 mt-0.5">IFU · {TENANT.ifu}</p>
          </button>
        ) : (
          <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-br from-orange/15 to-transparent">
            <p className="text-[10px] tracking-[0.22em] uppercase text-orange font-semibold mb-1 inline-flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Espace salarié</p>
            <p className="text-sm font-semibold truncate">{ME.firstName} {ME.lastName}</p>
            <p className="text-[11px] text-n-400 mt-0.5 truncate">{ME.role} · {ME.matricule}</p>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {!isEmployeeMode ? (
            ADMIN_NAV.map((item) => {
              const active = item.exact ? loc.pathname === item.to : loc.pathname.startsWith(item.to)
              return (
                <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-sm ${active ? 'bg-orange text-white' : 'text-n-300 hover:bg-white/5 hover:text-white'}`}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })
          ) : (
            EMPLOYEE_NAV.map((item) => {
              const active = currentTab === item.tab
              return (
                <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors rounded-sm ${active ? 'bg-orange text-white' : 'text-n-300 hover:bg-white/5 hover:text-white'}`}>
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })
          )}
        </nav>

        {!isEmployeeMode && (
          <button onClick={() => store.toggleChat()} className="mx-3 mb-3 px-3 py-2.5 bg-orange/10 border border-orange/30 text-orange hover:bg-orange/20 rounded-sm flex items-center gap-2 text-sm font-medium transition-colors">
            <Sparkles className="w-4 h-4" /> Demander à ADCA
          </button>
        )}

        <div className="px-3 pb-3">
          {!isEmployeeMode ? (
            <Link to="/app/me" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-n-300 hover:bg-white/5 hover:text-white rounded-sm transition-colors border border-white/10" title="Basculer vers l'espace salarié (démo)">
              <ArrowLeftRight className="w-4 h-4 shrink-0" />
              <span>Basculer en mode salarié</span>
              <span className="ml-auto text-[9px] uppercase tracking-wider text-orange font-semibold">démo</span>
            </Link>
          ) : (
            <Link to="/app" className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium bg-orange/10 border border-orange/40 text-orange hover:bg-orange/20 hover:text-white rounded-sm transition-colors" title="Retour au panneau d'administration">
              <LogOut className="w-4 h-4 shrink-0 rotate-180" />
              <span>Quitter le mode salarié</span>
            </Link>
          )}
        </div>

        <div className="px-3 py-3 border-t border-white/10 flex items-center gap-2">
          {!isEmployeeMode ? (
            <>
              <div className="flex items-center gap-3 flex-1 min-w-0 px-3">
                <div className="w-9 h-9 bg-orange text-white font-semibold text-sm rounded-full flex items-center justify-center shrink-0">{CURRENT_USER.initials}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{CURRENT_USER.name}</p>
                  <p className="text-[11px] text-n-400 truncate">{CURRENT_USER.role}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 flex-1 min-w-0 px-3">
                <div className="w-9 h-9 bg-orange text-white font-semibold text-sm rounded-full flex items-center justify-center shrink-0">{ME.firstName[0]}{ME.lastName[0]}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{ME.firstName} {ME.lastName}</p>
                  <p className="text-[11px] text-n-400 truncate">Connecté(e) · Salarié</p>
                </div>
              </div>
            </>
          )}
          <button onClick={() => setConfirmLogout(true)} title="Se déconnecter" className="w-9 h-9 hover:bg-red-500/20 hover:text-red-400 text-n-400 rounded-sm flex items-center justify-center shrink-0 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-n-200 sticky top-0 z-30">
          <div className="px-4 lg:px-8 h-14 flex items-center justify-between gap-4">
            <button onClick={() => setDrawer(true)} className="lg:hidden w-9 h-9 hover:bg-n-100 rounded-sm inline-flex items-center justify-center" aria-label="Ouvrir le menu">
              <Menu className="w-5 h-5 text-ink" />
            </button>
            <Link to={isEmployeeMode ? '/app/me' : '/app'} className="lg:hidden font-serif text-base font-semibold" title={isEmployeeMode ? 'Mon espace salarié' : 'Accueil dashboard'}>ADC <span className="em-serif">Paie</span></Link>
            <div className="hidden md:flex items-center gap-2 text-[13px] text-n-500">
              {isEmployeeMode ? (
                <>
                  <Link to="/app/me" className="hover:text-orange">Mon espace salarié</Link>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-ink font-medium">{breadcrumb}</span>
                </>
              ) : (
                <>
                  <Link to="/app" className="hover:text-orange">Espace</Link>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-ink font-medium">{breadcrumb}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={() => store.openSpotlight()} className="hidden md:flex items-center gap-2 bg-n-50 hover:bg-n-100 px-3 py-1.5 rounded-sm border border-n-200 w-64 transition-colors" title="Recherche globale">
                <Search className="w-3.5 h-3.5 text-n-500" />
                <span className="text-sm text-n-500 flex-1 text-left">Rechercher…</span>
                <kbd className="text-[10px] bg-white border border-n-200 px-1.5 py-0.5 rounded-sm text-n-500">{isMac ? '⌘' : 'Ctrl'} K</kbd>
              </button>
              <button onClick={() => store.openSpotlight()} className="md:hidden w-9 h-9 hover:bg-n-100 rounded-sm inline-flex items-center justify-center" title="Rechercher">
                <Search className="w-4 h-4 text-n-700" />
              </button>
              <button onClick={() => store.toggleNotif()} className="w-9 h-9 flex items-center justify-center hover:bg-n-100 rounded-sm relative" title="Notifications">
                <Bell className="w-4 h-4 text-n-700" />
                {unread > 0 && <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unread}</span>}
              </button>
              <div className="lg:hidden w-9 h-9 bg-orange text-white font-semibold text-xs rounded-full flex items-center justify-center" title={isEmployeeMode ? `${ME.firstName} ${ME.lastName}` : CURRENT_USER.name}>
                {isEmployeeMode ? `${ME.firstName[0]}${ME.lastName[0]}` : CURRENT_USER.initials}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <Spotlight isEmployeeMode={isEmployeeMode} />
      <NotificationsPanel />
      <ADCAChat />
      {!isEmployeeMode && <ChatFAB />}
      <Toast />
      <HelpModal />
      {!isEmployeeMode && <OnboardingWizard />}
      {!isEmployeeMode && <GlobalHireWizard />}
      <ConfirmDialog
        open={confirmLogout}
        title="Se déconnecter ?"
        message={<>Toute action non enregistrée sera perdue. Vous reviendrez à la page d'accueil. Vous pourrez vous reconnecter à tout moment depuis <strong>/login</strong>.</>}
        confirmLabel="Se déconnecter"
        cancelLabel="Annuler"
        variant="danger"
        onCancel={() => setConfirmLogout(false)}
        onConfirm={() => { setConfirmLogout(false); store.toast('Déconnexion réussie', 'success'); navigate({ to: '/' }) }}
      />
    </div>
  )
}

function GlobalHireWizard() {
  const open = useStore((s) => s.hireOpen)
  return <HireWizard open={open} onClose={() => store.closeHire()} />
}
