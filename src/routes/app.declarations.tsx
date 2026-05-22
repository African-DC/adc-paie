import { createFileRoute } from '@tanstack/react-router'
import { Download, Upload, ExternalLink, FileText, Calendar } from 'lucide-react'
import { DECLARATIONS, EMPLOYEES, fcfa } from '../lib/mock'
import { store } from '../lib/store'
import { downloadDeclarationExcel, downloadBordereauCNPSPDF, downloadDISAExcel, downloadEtat301Excel } from '../lib/downloads'

export const Route = createFileRoute('/app/declarations')({ component: DeclarationsPage })

function DeclarationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Conformité légale</p>
        <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">Déclarations <span className="em-serif">obligatoires</span></h1>
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
                <th className="text-right px-4 py-3 text-[10px] tracking-[0.18em] uppercase font-semibold text-n-700">Montant FCFA</th>
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
                  <td className="px-4 py-3 text-center"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {d.type === 'Bordereau CNPS' && (
                        <button onClick={() => { downloadBordereauCNPSPDF(EMPLOYEES, d.period); store.toast('Bordereau CNPS PDF généré · prêt à signer et déposer', 'success') }} className="inline-flex items-center gap-1.5 border border-n-300 text-n-700 px-2.5 h-8 text-[11px] font-medium hover:bg-n-50 transition-colors rounded-sm" title="Bordereau PDF signable">
                          <FileText className="w-3 h-3" /> PDF
                        </button>
                      )}
                      {d.type === 'DISA + DASC annuels' ? (
                        <button onClick={() => { downloadDISAExcel(EMPLOYEES, 2025); store.toast('DISA + DASC 2025 téléchargés · à déposer sur e-CNPS avant le 31 mars', 'success') }} className={`inline-flex items-center gap-1.5 px-3 h-8 text-[11px] font-semibold uppercase tracking-wider rounded-sm transition-colors ${d.status === 'Validé' ? 'border border-n-300 text-n-700 hover:bg-n-50' : 'bg-orange text-white hover:bg-orange-deep'}`}>
                          <Download className="w-3 h-3" /> DISA + DASC
                        </button>
                      ) : d.type === 'État 301 annuel' ? (
                        <button onClick={() => { downloadEtat301Excel(EMPLOYEES, 2025); store.toast('État 301 annuel 2025 téléchargé · à déposer sur e-impots avant le 30 mai', 'success') }} className={`inline-flex items-center gap-1.5 px-3 h-8 text-[11px] font-semibold uppercase tracking-wider rounded-sm transition-colors ${d.status === 'Validé' ? 'border border-n-300 text-n-700 hover:bg-n-50' : 'bg-orange text-white hover:bg-orange-deep'}`}>
                          <Download className="w-3 h-3" /> État 301
                        </button>
                      ) : d.status === 'À soumettre' || d.status === 'En cours' ? (
                        <button onClick={() => { downloadDeclarationExcel(d.type.includes('CNPS') ? 'cnps' : 'dgi', d.period, EMPLOYEES); store.toast(`${d.type} générée · prête à soumettre sur ${d.type.includes('CNPS') ? 'e-CNPS' : 'e-impots'}`, 'success') }} className="inline-flex items-center gap-1.5 bg-orange text-white px-3 h-8 text-[11px] font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm">
                          <Upload className="w-3 h-3" /> Excel & soumettre
                        </button>
                      ) : (
                        <button onClick={() => { downloadDeclarationExcel(d.type.includes('CNPS') ? 'cnps' : 'dgi', d.period, EMPLOYEES); store.toast(`${d.type} téléchargée au format Excel`, 'success') }} className="inline-flex items-center gap-1.5 border border-n-300 text-n-700 px-3 h-8 text-[11px] font-medium hover:bg-n-50 transition-colors rounded-sm">
                          <Download className="w-3 h-3" /> Excel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-orange-tint border-l-4 border-orange p-6 rounded-sm">
          <p className="font-semibold text-ink">À savoir · pénalités CNPS et DGI</p>
          <p className="text-sm text-n-700 mt-2">CNPS · 0,05 % par jour de retard sur les cotisations impayées. DGI · 10 % de majoration le premier mois puis 3 % par mois suivant. ADC Paie alerte automatiquement J-5 avant chaque échéance.</p>
          <a href="https://e-impots.gouv.ci" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-orange-deep font-semibold text-sm hover:underline">
            Accéder à e-impots.gouv.ci <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="bg-white border border-n-200 p-6 rounded-sm">
          <p className="font-semibold text-ink inline-flex items-center gap-2"><Calendar className="w-4 h-4 text-orange" /> Calendrier des déclarations annuelles</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2"><strong className="text-orange-deep w-20 shrink-0">31 mars</strong><span className="text-n-700">DISA + DASC à la CNPS (récap salaires et cotisations N-1)</span></li>
            <li className="flex items-start gap-2"><strong className="text-orange-deep w-20 shrink-0">30 mai</strong><span className="text-n-700">État 301 à la DGI (récap des salaires N-1)</span></li>
            <li className="flex items-start gap-2"><strong className="text-orange-deep w-20 shrink-0">30 juin</strong><span className="text-n-700">État 301 prorogé pour les entreprises avec commissaire aux comptes</span></li>
            <li className="flex items-start gap-2"><strong className="text-orange-deep w-20 shrink-0">15 j+1</strong><span className="text-n-700">Bordereau CNPS et ITS mensuels (chaque mois)</span></li>
          </ul>
        </div>
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
