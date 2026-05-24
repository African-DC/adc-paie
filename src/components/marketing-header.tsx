import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

export function MarketingHeader() {
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
          <Link to="/login" className="hidden sm:inline-flex items-center text-sm font-medium text-n-700 hover:text-orange transition-colors px-3 h-9">
            Se connecter
          </Link>
          <Link to="/signup" className="inline-flex items-center gap-2 bg-ink text-white px-4 h-9 text-[13px] font-semibold uppercase tracking-wider hover:bg-orange transition-colors">
            Créer mon espace <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
