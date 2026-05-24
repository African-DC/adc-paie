import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * Catch-all error boundary autour de <Outlet /> dans /app.
 * Évite l'écran blanc quand une Convex query throw ou qu'un composant explose.
 * Reload bouton pour récupération rapide.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    if (typeof console !== 'undefined') {
      console.error('[AppErrorBoundary]', error, info.componentStack)
    }
  }

  reset = () => {
    this.setState({ error: null })
    if (typeof window !== 'undefined') window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="w-14 h-14 mx-auto bg-orange-tint text-orange-deep rounded-full flex items-center justify-center mb-5">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Une erreur est survenue</h1>
        <p className="mt-3 text-n-700 leading-relaxed">
          Une partie de l'application a rencontré un problème. Vos données sont en sécurité dans Convex.
          Rafraîchissez la page pour reprendre.
        </p>
        <details className="mt-4 text-left max-w-md mx-auto">
          <summary className="text-[11px] text-n-500 cursor-pointer uppercase tracking-wider font-semibold">Détails techniques</summary>
          <pre className="mt-2 p-3 bg-n-50 border border-n-200 text-[11px] text-n-700 rounded-sm overflow-auto font-mono">
            {this.state.error.name}: {this.state.error.message}
          </pre>
        </details>
        <button
          onClick={this.reset}
          className="mt-6 bg-orange text-white px-5 h-10 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm"
        >
          <RefreshCw className="w-4 h-4" /> Rafraîchir la page
        </button>
      </div>
    )
  }
}
