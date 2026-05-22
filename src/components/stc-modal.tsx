import { useState, useMemo } from 'react'
import { X, AlertTriangle, FileDown, FileText } from 'lucide-react'
import { type Employee, fcfa } from '../lib/mock'
import { computeSTC, downloadSTCPDF, downloadCertificatTravailPDF, type STCMotif } from '../lib/downloads'
import { store } from '../lib/store'

export function STCModal({ open, employee, onClose }: { open: boolean; employee: Employee; onClose: () => void }) {
  const [motif, setMotif] = useState<STCMotif>('demission')
  const [dateSortie, setDateSortie] = useState(new Date().toLocaleDateString('fr-FR'))
  const [conges, setConges] = useState('5')
  const [anneeAnc, setAnneeAnc] = useState('2')
  const [moisAnc, setMoisAnc] = useState('6')

  const anciennete = { years: parseInt(anneeAnc) || 0, months: parseInt(moisAnc) || 0 }
  const stc = useMemo(() => computeSTC(employee, motif, parseFloat(conges) || 0, anciennete), [employee, motif, conges, anciennete.years, anciennete.months])

  if (!open) return null

  const validate = () => {
    downloadSTCPDF(employee, motif, parseFloat(conges) || 0, anciennete, dateSortie)
    downloadCertificatTravailPDF(employee, dateSortie, anciennete)
    store.toast(`Sortie validée · STC et certificat de travail générés pour ${employee.firstName} ${employee.lastName}`, 'success')
    onClose()
  }

  const motifs: { v: STCMotif; l: string }[] = [
    { v: 'demission',                l: 'Démission' },
    { v: 'licenciement',             l: 'Licenciement' },
    { v: 'retraite',                 l: 'Départ à la retraite' },
    { v: 'fin-cdd',                  l: 'Fin de contrat (CDD)' },
    { v: 'rupture-conventionnelle',  l: 'Rupture conventionnelle' },
  ]

  return (
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-sm shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-n-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-orange font-semibold">Solde de tout compte</p>
            <h2 className="font-serif text-xl font-semibold tracking-tight mt-1">Initier la sortie de {employee.firstName} {employee.lastName}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 hover:bg-n-100 rounded-sm flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="bg-orange-tint border-l-4 border-orange p-4 rounded-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange shrink-0 mt-0.5" />
            <div className="text-sm text-n-700">
              <p className="font-semibold text-ink">Action irréversible</p>
              <p>Le STC dresse les indemnités finales selon le Code du travail (Loi 2015-532) et la convention collective interprofessionnelle CI. Deux PDF seront générés : <strong>Solde de tout compte</strong> + <strong>Certificat de travail</strong> (Art. 16.10).</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Motif de sortie</label>
              <select value={motif} onChange={(e) => setMotif(e.target.value as STCMotif)} className="mt-1 w-full border border-n-300 rounded-sm h-10 px-3 text-sm focus:border-orange focus:ring-1 focus:ring-orange outline-none">
                {motifs.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Date d'effet</label>
              <input type="text" value={dateSortie} onChange={(e) => setDateSortie(e.target.value)} placeholder="JJ/MM/AAAA" className="mt-1 w-full border border-n-300 rounded-sm h-10 px-3 text-sm focus:border-orange focus:ring-1 focus:ring-orange outline-none" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Ancienneté · années</label>
              <input type="number" min="0" value={anneeAnc} onChange={(e) => setAnneeAnc(e.target.value)} className="mt-1 w-full border border-n-300 rounded-sm h-10 px-3 text-sm font-mono focus:border-orange focus:ring-1 focus:ring-orange outline-none" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Ancienneté · mois</label>
              <input type="number" min="0" max="11" value={moisAnc} onChange={(e) => setMoisAnc(e.target.value)} className="mt-1 w-full border border-n-300 rounded-sm h-10 px-3 text-sm font-mono focus:border-orange focus:ring-1 focus:ring-orange outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Jours de congés payés non pris</label>
              <input type="number" min="0" value={conges} onChange={(e) => setConges(e.target.value)} className="mt-1 w-full border border-n-300 rounded-sm h-10 px-3 text-sm font-mono focus:border-orange focus:ring-1 focus:ring-orange outline-none" />
              <p className="text-[11px] text-n-500 mt-1">Droits CI : 2,2 jours ouvrables par mois travaillé (Art. 25.1 Code du travail).</p>
            </div>
          </div>

          <div className="bg-n-50 border border-n-200 rounded-sm overflow-hidden">
            <div className="px-4 py-3 bg-ink text-white">
              <p className="text-[10px] tracking-[0.22em] uppercase font-semibold">Aperçu du solde de tout compte</p>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <STCRow label="Salaire du mois de sortie" value={fcfa(Math.round(stc.salaireMois))} />
                {stc.preavis > 0 && <STCRow label={`Indemnité de préavis (${stc.preavisMois} mois)`} value={fcfa(Math.round(stc.preavis))} />}
                {stc.indemniteLicenciement > 0 && <STCRow label="Indemnité de licenciement (Art. 39 CC)" value={fcfa(Math.round(stc.indemniteLicenciement))} />}
                {stc.indemniteRetraite > 0 && <STCRow label="Indemnité de départ à la retraite" value={fcfa(Math.round(stc.indemniteRetraite))} />}
                {stc.indemnitePrecarite > 0 && <STCRow label="Indemnité de précarité fin CDD (Art. 14.6)" value={fcfa(Math.round(stc.indemnitePrecarite))} />}
                {stc.indemniteConges > 0 && <STCRow label={`Congés payés non pris (${stc.joursCongesNonPris} j)`} value={fcfa(Math.round(stc.indemniteConges))} />}
                {stc.proRataGratification > 0 && <STCRow label={`Prorata 13e mois (${stc.moisDepuisDerniereGrat}/12)`} value={fcfa(Math.round(stc.proRataGratification))} />}
              </tbody>
              <tfoot>
                <tr className="bg-orange text-white">
                  <td className="px-4 py-3 font-serif font-semibold uppercase tracking-wider text-xs">Total net dû</td>
                  <td className="px-4 py-3 text-right font-serif font-semibold text-lg">{fcfa(Math.round(stc.total))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-n-200 bg-n-50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 h-10 text-sm font-medium border border-n-300 hover:bg-n-100 rounded-sm">Annuler</button>
          <button onClick={validate} className="inline-flex items-center gap-2 bg-orange text-white px-5 h-10 text-xs font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm">
            <FileDown className="w-3.5 h-3.5" /> Valider et générer (STC + <FileText className="w-3.5 h-3.5 inline" /> certificat)
          </button>
        </div>
      </div>
    </div>
  )
}

function STCRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-n-100 last:border-0">
      <td className="px-4 py-2 text-n-700">{label}</td>
      <td className="px-4 py-2 text-right font-mono font-semibold">{value}</td>
    </tr>
  )
}
