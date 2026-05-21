import { useState } from 'react'
import { X, Gift, FileDown } from 'lucide-react'
import { EMPLOYEES, fcfa } from '../lib/mock'
import { downloadGratificationsZip } from '../lib/downloads'
import { store } from '../lib/store'

export function GratificationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mois, setMois] = useState('11')
  const [period, setPeriod] = useState('Décembre 2026')
  const [running, setRunning] = useState(false)
  const active = EMPLOYEES.filter((e) => e.status === 'active')
  const moisN = Math.max(1, Math.min(12, parseInt(mois) || 12))
  const total = active.reduce((s, e) => s + Math.round((e.brut * moisN) / 12), 0)

  if (!open) return null

  const verser = async () => {
    setRunning(true)
    store.toast(`Génération de ${active.length} bulletins de gratification…`, 'info')
    await downloadGratificationsZip(active, moisN, period)
    store.toast(`Gratifications ${period} versées · ZIP téléchargé (${active.length} bulletins + bordereau récap)`, 'success')
    setRunning(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-sm shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-n-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-tint text-orange rounded-full flex items-center justify-center"><Gift className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] tracking-[0.22em] uppercase text-orange font-semibold">Gratification 13<sup>e</sup> mois</p>
              <h2 className="font-serif text-xl font-semibold tracking-tight mt-0.5">Verser la gratification annuelle</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 hover:bg-n-100 rounded-sm flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-n-700">Calcul automatique de la gratification de fin d'année selon l'usage en Côte d'Ivoire : <strong>1/12 du brut annuel</strong>, proratisé pour les arrivées en cours d'année.</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Mois acquis (sur 12)</label>
              <input type="number" min="1" max="12" value={mois} onChange={(e) => setMois(e.target.value)} className="mt-1 w-full border border-n-300 rounded-sm h-10 px-3 text-sm font-mono focus:border-orange focus:ring-1 focus:ring-orange outline-none" />
              <p className="text-[11px] text-n-500 mt-1">Par défaut : 11 mois (nov. de l'année courante)</p>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Période de versement</label>
              <input type="text" value={period} onChange={(e) => setPeriod(e.target.value)} className="mt-1 w-full border border-n-300 rounded-sm h-10 px-3 text-sm focus:border-orange focus:ring-1 focus:ring-orange outline-none" />
            </div>
          </div>

          <div className="bg-n-50 border border-n-200 rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink text-white">
                <tr>
                  <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider font-semibold">Salarié</th>
                  <th className="text-right px-4 py-2 text-[10px] uppercase tracking-wider font-semibold">Brut mensuel</th>
                  <th className="text-right px-4 py-2 text-[10px] uppercase tracking-wider font-semibold">Gratification</th>
                </tr>
              </thead>
              <tbody>
                {active.map((e) => (
                  <tr key={e.id} className="border-b border-n-100 last:border-0">
                    <td className="px-4 py-2">
                      <p className="font-medium">{e.firstName} {e.lastName}</p>
                      <p className="text-[11px] text-n-500">{e.role}</p>
                    </td>
                    <td className="px-4 py-2 text-right font-mono">{fcfa(e.brut)}</td>
                    <td className="px-4 py-2 text-right font-mono font-semibold text-orange-deep">{fcfa(Math.round((e.brut * moisN) / 12))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-orange text-white">
                <tr>
                  <td className="px-4 py-3 font-serif font-semibold uppercase tracking-wider text-xs" colSpan={2}>Total à verser · {active.length} salariés</td>
                  <td className="px-4 py-3 text-right font-serif font-semibold text-lg">{fcfa(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-n-200 bg-n-50 flex items-center justify-end gap-3">
          <button onClick={onClose} disabled={running} className="px-4 h-10 text-sm font-medium border border-n-300 hover:bg-n-100 rounded-sm disabled:opacity-50">Annuler</button>
          <button onClick={verser} disabled={running} className="inline-flex items-center gap-2 bg-orange text-white px-5 h-10 text-xs font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm disabled:opacity-60">
            <FileDown className="w-3.5 h-3.5" /> {running ? 'Génération…' : 'Verser et générer ZIP'}
          </button>
        </div>
      </div>
    </div>
  )
}
