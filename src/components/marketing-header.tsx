import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, LayoutDashboard, Settings, LogOut, ChevronDown } from 'lucide-react'
import { authClient, useSession } from '../lib/auth-client'

export function MarketingHeader() {
  const session = useSession()
  const isAuthed = !!session.data
  const isLoading = session.isPending

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-n-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl font-semibold tracking-tight">ADC <span className="em-serif">Paie</span></Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-n-700">
          <Link to="/" hash="features" className="hover:text-orange transition-colors">Fonctionnalités</Link>
          <Link to="/" hash="pricing" className="hover:text-orange transition-colors">Tarifs</Link>
          <Link to="/calculatrice" className="hover:text-orange transition-colors" activeProps={{ className: 'text-orange' }}>Calculatrice</Link>
          <Link to="/aide" className="hover:text-orange transition-colors" activeProps={{ className: 'text-orange' }}>Aide & barèmes</Link>
        </nav>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="w-9 h-9 bg-n-100 rounded-full animate-pulse" />
          ) : isAuthed ? (
            <ProfileDropdown user={session.data!.user as { name?: string; email?: string }} />
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex items-center text-sm font-medium text-n-700 hover:text-orange transition-colors px-3 h-9">
                Se connecter
              </Link>
              <Link to="/signup" className="inline-flex items-center gap-2 bg-ink text-white px-4 h-9 text-[13px] font-semibold uppercase tracking-wider hover:bg-orange transition-colors">
                Créer mon espace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function ProfileDropdown({ user }: { user: { name?: string; email?: string } }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const displayName = user.name || user.email || 'Utilisateur'
  const initials = displayName
    .split(/[\s@]+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleLogout = async () => {
    setOpen(false)
    await authClient.signOut({
      fetchOptions: { onSuccess: () => { window.location.href = '/' } },
    })
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu du compte"
        aria-expanded={open}
        className="inline-flex items-center gap-2 pl-1 pr-2 h-10 rounded-full hover:bg-n-100 transition-colors"
      >
        <div className="w-8 h-8 bg-orange text-white text-xs font-semibold rounded-full flex items-center justify-center">
          {initials || '?'}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-n-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 bg-white border border-n-200 rounded-sm shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-n-100 bg-n-50">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            {user.email && user.email !== displayName && (
              <p className="text-[11px] text-n-500 truncate">{user.email}</p>
            )}
          </div>
          <div className="py-1">
            <button
              onClick={() => { setOpen(false); navigate({ to: '/app' }) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-orange-tint transition-colors text-left"
            >
              <LayoutDashboard className="w-4 h-4 text-n-500" />
              <span>Mon espace</span>
            </button>
            <button
              onClick={() => { setOpen(false); navigate({ to: '/app/settings' }) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-orange-tint transition-colors text-left"
            >
              <Settings className="w-4 h-4 text-n-500" />
              <span>Réglages</span>
            </button>
            <div className="border-t border-n-100 my-1" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 text-red-700 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
