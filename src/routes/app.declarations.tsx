import { createFileRoute } from '@tanstack/react-router'
import { Download, Upload, ExternalLink } from 'lucide-react'
import { DECLARATIONS, fcfa } from '../lib/mock'

export const Route = createFileRoute('/app/declarations')({
  component: DeclarationsPage,
})

function DeclarationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Conformité légale</p>
        <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">
          Déclarations <span className="em-serif">obligatoires</span>
        </h1>
        <p className="mt-2 text-n-700">Vos exports CNPS et DGI au format attendu par les plateformes officielles.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-n-200 rounded-sm p-5">
          <p className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">À soumettre</p>
          <p className="font-serif text-3xl font-semibold mt-2 text-orange-deep">{DECLARATIONS.filter(d => d.status === 'À soumettre').length}</p>
          <p className="text-xs text-n-600 mt-1">Échéance proche</p>
        </div>
        <div className="bg-white border border-n-200 rounded-sm p-5">
          <p className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">En cours</p>
          <p className="font-serif text-3xl font-semibold mt-2">{DECLARATIONS.filter(d => d.status === 'En cours').length}</p>
          <p className="text-xs text-n-600 mt-1">À finaliser</p>
        </div>
        <div className="bg-white border border-n-200 rounded-sm p-5">
          <p className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Validés</p>
          <p className="font-serif text-3xl font-semibold mt-2 text-green-700">{DECLARATIONS.filter(d => d.status === 'Validé').length}</p>
          <p className="text-xs text-n-600 mt-1">Conformes</p>
        </div>
      </div>

      <div className="bg-white border border-n-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-n-50 border-b border-n-200">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Type</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Période</th>
                <th className="text-left px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Échéance</th>
                <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Montant XOF</th>
                <th className="text-center px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Statut</th>
                <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {DECLARATIONS.map((d) => (
                <tr key={d.id} className="border-b border-n-100 hover:bg-n-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{d.type}</p>
                    <p className="text-[11px] text-n-500">{d.type.includes('CNPS') ? 'e-CNPS' : 'e-impots.gouv.ci'}</p>
                  </td>
                  <td className="px-4 py-3 text-n-700">{d.period}</td>
                  <td className="px-4 py-3 font-mono text-xs">{d.due}</td>
                  <td className="px-4 py-3 font-mono text-right font-semibold">{fcfa(d.amount)}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {d.status === 'À soumettre' || d.status === 'En cours' ? (
                      <button className="inline-flex items-center gap-1.5 bg-orange text-white px-3 h-8 text-[11px] font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm">
                        <Upload className="w-3 h-3" /> Soumettre
                      </button>
                    ) : (
                      <button className="inline-flex items-center gap-1.5 border border-n-300 text-n-700 px-3 h-8 text-[11px] font-medium hover:bg-n-50 transition-colors rounded-sm">
                        <Download className="w-3 h-3" /> Télécharger
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-orange-tint border-l-4 border-orange p-6 rounded-sm">
        <p className="font-semibold text-ink">À savoir · pénalités CNPS et DGI</p>
        <p className="text-sm text-n-700 mt-2">
          CNPS · 0,05 % par jour de retard sur les cotisations impayées. DGI · 10 % de majoration le premier mois puis 3 % par mois suivant. ADC Paie alerte automatiquement J-5 avant chaque échéance.
        </p>
        <a href="https://e-impots.gouv.ci" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-orange-deep font-semibold text-sm hover:underline">
          Accéder à e-impots.gouv.ci <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'À soumettre': 'bg-orange text-white',
    'En cours': 'bg-orange-tint text-orange-deep',
    'Soumis': 'bg-n-100 text-n-700',
    'Validé': 'bg-green-100 text-green-800',
  }
  return <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm ${map[status] || 'bg-n-100 text-n-700'}`}>{status}</span>
}
