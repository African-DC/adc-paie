import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import { convex } from '../lib/convex-client'
import { authClient, useSession } from '../lib/auth-client'
import { api } from '../../convex/_generated/api'
import { LayoutDashboard, Users, Calculator, FileCheck2, Settings, Search, Bell, ChevronRight, Sparkles, CalendarDays, UserCircle2, Wallet, Menu, X, FileText, BadgeCheck, ShieldCheck, LogOut, Clock, BarChart3, Megaphone } from 'lucide-react'
import { CURRENT_USER, EMPLOYEES } from '../lib/mock'
import { Spotlight } from '../components/spotlight'
import { NotificationsPanel, Toast } from '../components/notifications'
import { ADCAChat, ChatFAB } from '../components/adca-chat'
import { HelpModal, OnboardingWizard } from '../components/extras'
import { HireWizard } from '../components/hire-wizard'
import { ConfirmDialog } from '../components/confirm-dialog'
import { AppErrorBoundary } from '../components/error-boundary'
import { useStore, store } from '../lib/store'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/app')({ component: AppRoot })

function AppRoot() {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <AppLayout />
    </ConvexBetterAuthProvider>
  )
}

const ADMIN_NAV = [
  { to: '/app',              label: 'Tableau de bord',     icon: LayoutDashboard, exact: true },
  { to: '/app/employees',    label: 'Salariés',            icon: Users },
  { to: '/app/payroll',      label: 'Paie mensuelle',      icon: Calculator },
  { to: '/app/advances',     label: 'Avances sur salaire', icon: Wallet },
  { to: '/app/attendance',   label: 'Pointage & présences', icon: Clock },
  { to: '/app/leave',        label: 'Congés & absences',   icon: CalendarDays },
  { to: '/app/declarations', label: 'Déclarations',        icon: FileCheck2 },
  { to: '/app/reports',      label: 'Rapports & analytics', icon: BarChart3 },
  { to: '/app/announcements', label: 'Annonces',            icon: Megaphone },
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
  const session = useSession()
  const showDemoNotifs = !session.isPending && !session.data
  const unread = useStore((s) => showDemoNotifs ? s.notifs.filter((n) => !n.read).length : 0)
  // Org : combine Better Auth (nom org) + Convex (paramètres métier IFU/CNPS/etc.)
  // Fallback localStorage demo si pas encore connecté (mode démo)
  const fallbackOrg = useStore((s) => s.org)
  const orgSettings = useQuery(
    api.organizations.getCurrentOrgSettings,
    session.data ? {} : 'skip',
  )
  const activeOrgResult = (authClient as unknown as { useActiveOrganization?: () => { data?: { name?: string; slug?: string } | null } }).useActiveOrganization?.()
  const liveOrgName = activeOrgResult?.data?.name
  const isAuthed = !!session.data
  const isOrgLoading = isAuthed && (orgSettings === undefined || activeOrgResult?.data === undefined)
  const org = orgSettings
    ? {
        name: liveOrgName ?? fallbackOrg.name,
        ifu: orgSettings.ifu,
        cnps: orgSettings.cnps,
        sector: orgSettings.sector,
        taux_at: String(orgSettings.tauxAT * 100),
        city: orgSettings.city,
        convention: orgSettings.convention,
      }
    : session.data
      ? { ...fallbackOrg, name: liveOrgName ?? fallbackOrg.name }
      : fallbackOrg

  // Sync local store avec données live → composants lisant useStore.org reçoivent
  // automatiquement la vraie org (élimine les "Sahel Industries SARL" résiduels).
  useEffect(() => {
    if (!isAuthed) return
    if (orgSettings && liveOrgName) {
      store.setOrg({
        name: liveOrgName,
        ifu: orgSettings.ifu,
        cnps: orgSettings.cnps,
        sector: orgSettings.sector,
        taux_at: String(orgSettings.tauxAT * 100),
        city: orgSettings.city,
        convention: orgSettings.convention,
      })
    } else if (liveOrgName && liveOrgName !== fallbackOrg.name) {
      store.setOrg({ name: liveOrgName })
    }
  }, [isAuthed, orgSettings, liveOrgName, fallbackOrg.name])
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')
  const [drawer, setDrawer] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  useEffect(() => { setDrawer(false) }, [loc.pathname])

  // Role check : si l'utilisateur connecté est member (employé), bascule sur /app/me
  // Owner/admin reste sur /app. Routing déterminé au login uniquement, pas de toggle.
  const activeMemberResult = (authClient as unknown as {
    useActiveMember?: () => { data?: { role?: string } | null }
  }).useActiveMember?.()
  const activeRole = activeMemberResult?.data?.role

  // Auth guard : si pas connecté → /login
  // Si connecté mais pas d'org active → /onboarding
  // Si role member et on est sur une route admin → /app/me
  useEffect(() => {
    if (session.isPending || typeof window === 'undefined') return
    if (!session.data) {
      navigate({ to: '/login', search: { redirect: loc.pathname } })
      return
    }
    const activeOrgId = (session.data.user as { activeOrganizationId?: string }).activeOrganizationId
    if (!activeOrgId) {
      authClient.organization.list().then(({ data }) => {
        if (!data || data.length === 0) {
          navigate({ to: '/onboarding' })
        } else {
          authClient.organization.setActive({ organizationId: data[0].id })
        }
      })
      return
    }
    if (activeRole === 'member' && !loc.pathname.startsWith('/app/me')) {
      navigate({ to: '/app/me' })
    }
  }, [session.data, session.isPending, activeRole, navigate, loc.pathname])

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
            <div className="bg-white inline-block px-3 py-1.5 rounded-sm">
              <img src="/adc-paie-logo.png" alt="ADC Paie" className="h-6 w-auto" />
            </div>
          </Link>
          <button onClick={() => setDrawer(false)} className="lg:hidden w-8 h-8 rounded-sm hover:bg-white/10 flex items-center justify-center" aria-label="Fermer le menu">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isEmployeeMode ? (
          <Link to="/app/settings" className="px-6 py-4 border-b border-white/10 text-left hover:bg-white/5 block" title="Modifier les informations dans Réglages">
            <p className="text-[10px] tracking-[0.22em] uppercase text-n-400 font-semibold mb-1">Organisation</p>
            {isOrgLoading ? (
              <>
                <div className="h-4 w-40 bg-white/10 rounded-sm animate-pulse" />
                <div className="h-2.5 w-28 bg-white/5 rounded-sm animate-pulse mt-2" />
              </>
            ) : (
              <>
                <p className="text-sm font-semibold truncate">{org.name}</p>
                <p className="text-[11px] text-n-400 mt-0.5">IFU · {org.ifu}</p>
              </>
            )}
          </Link>
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
            <Link to={isEmployeeMode ? '/app/me' : '/app'} className="lg:hidden inline-flex items-center" title={isEmployeeMode ? 'Mon espace salarié' : 'Accueil dashboard'} aria-label="ADC Paie">
              <img src="/adc-paie-logo.png" alt="ADC Paie" className="h-6 w-auto" />
            </Link>
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
          <AppErrorBoundary>
            <Outlet />
          </AppErrorBoundary>
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
        onConfirm={async () => {
          setConfirmLogout(false)
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                // Pattern obligatoire : reload pour clear JWT cache (gotcha known)
                window.location.href = '/'
              },
            },
          })
        }}
      />
    </div>
  )
}

function GlobalHireWizard() {
  const open = useStore((s) => s.hireOpen)
  return <HireWizard open={open} onClose={() => store.closeHire()} />
}
