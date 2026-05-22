import { Outlet, createRootRoute, HeadContent, Link, Scripts } from '@tanstack/react-router'
import { Home, ArrowLeft, Search } from 'lucide-react'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import { convex } from '../lib/convex-client'
import { authClient } from '../lib/auth-client'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'ADC Paie & RH · African Digit Consulting' },
      { name: 'description', content: 'ADC Paie & RH · SaaS conforme CNPS et DGI pour les PME ivoiriennes. African Digit Consulting.' },
      { name: 'theme-color', content: '#f97316' },
      { property: 'og:title', content: 'ADC Paie & RH · Le SaaS paie conforme des PME ivoiriennes' },
      { property: 'og:description', content: 'Calcul automatique CNPS, ITS, IGR. Bulletins PDF. Déclarations DGI. Conçu par African Digit Consulting.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: '/logo-adc.png' },
    ],
    links: [
      { rel: 'icon', type: 'image/png', href: '/logo-adc-icon.png' },
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500;1,9..144,600&family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        <ConvexBetterAuthProvider client={convex} authClient={authClient}>
          {children}
        </ConvexBetterAuthProvider>
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundPage() {
  const isApp = typeof window !== 'undefined' && window.location.pathname.startsWith('/app')
  return (
    <div className="min-h-screen bg-n-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full text-center">
        <p className="font-serif text-[8rem] lg:text-[12rem] font-semibold tracking-tighter leading-none text-orange/20">404</p>
        <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold -mt-4">Page introuvable</p>
        <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight mt-4">
          Cette page n'existe <span className="em-serif">pas</span>.
        </h1>
        <p className="mt-4 text-n-700 leading-relaxed">
          Le lien que vous avez suivi est peut-être obsolète, ou la page a été déplacée. Voici quelques destinations populaires.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={isApp ? '/app' : '/'} className="inline-flex items-center gap-2 bg-orange text-white px-5 h-11 text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep rounded-sm transition-colors">
            <Home className="w-4 h-4" /> {isApp ? 'Accueil dashboard' : 'Accueil ADC Paie'}
          </Link>
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 border border-n-300 text-n-700 px-5 h-11 text-sm font-medium hover:bg-white rounded-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Page précédente
          </button>
        </div>
        <div className="mt-10 pt-8 border-t border-n-200">
          <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-3">Ou explorez</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <Link to="/calculatrice" className="px-3 h-8 bg-white border border-n-200 hover:border-orange rounded-sm inline-flex items-center">Calculatrice paie</Link>
            <Link to="/aide" className="px-3 h-8 bg-white border border-n-200 hover:border-orange rounded-sm inline-flex items-center">Aide & barèmes</Link>
            <Link to="/a-propos" className="px-3 h-8 bg-white border border-n-200 hover:border-orange rounded-sm inline-flex items-center">À propos</Link>
            <Link to="/app" className="px-3 h-8 bg-white border border-n-200 hover:border-orange rounded-sm inline-flex items-center">Démo</Link>
          </div>
          <p className="mt-6 text-[11px] text-n-500 inline-flex items-center gap-1.5">
            <Search className="w-3 h-3" /> Astuce : appuyez sur <kbd className="bg-white border border-n-200 px-1.5 py-0.5 font-mono text-[10px] rounded-sm mx-1">⌘ K</kbd> dans la démo pour rechercher.
          </p>
        </div>
      </div>
    </div>
  )
}
