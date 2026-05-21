import { useState } from 'react'
import { X, Send, CheckCircle2, Loader2, Smartphone, Building2, Archive, FileSpreadsheet, FileText, ShieldCheck, Clock } from 'lucide-react'
import { EMPLOYEES, computePayslip, fcfa } from '../lib/mock'
import { store } from '../lib/store'

type Provider = 'wave' | 'orange' | 'mtn' | 'bank'

const PROVIDERS: Array<{ id: Provider; name: string; fees: string; speed: string; logo?: string; fallback?: string; color: string; bg?: string }> = [
  { id: 'wave',   name: 'Wave',            fees: '0 %',          speed: '< 30 s',  logo: '/providers/wave.png',         color: '#1DCBEF', bg: '#1DCBEF' },
  { id: 'orange', name: 'Orange Money',    fees: '1,0 %',        speed: '< 1 min', logo: '/providers/orange-money.svg', color: '#FF6600', bg: '#000000' },
  { id: 'mtn',    name: 'MTN MoMo',        fees: '1,2 %',        speed: '< 1 min', logo: '/providers/mtn-momo.png',     color: '#FFCC00', bg: '#FFCC00' },
  { id: 'bank',   name: 'Virement bancaire', fees: '500 XOF/op.', speed: 'J+1',     fallback: '🏦', color: '#0a0a0a', bg: '#0a0a0a' },
]

export function PaySalariesModal({ open, onClose, total, count }: { open: boolean; onClose: () => void; total: number; count: number }) {
  const [provider, setProvider] = useState<Provider>('wave')
  const [phase, setPhase] = useState<'select' | 'review' | 'sending' | 'done'>('select')
  const [pin, setPin] = useState('')
  const active = EMPLOYEES.filter((e) => e.status === 'active')
  const p = PROVIDERS.find((x) => x.id === provider)!

  if (!open) return null

  const startSending = () => {
    setPhase('sending')
    setTimeout(() => setPhase('done'), 2400)
  }

  const close = () => {
    setPhase('select')
    setPin('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[85] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={close}>
      <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-n-200 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-semibold tracking-tight inline-flex items-center gap-2">
              <Send className="w-4 h-4 text-orange" /> Payer les salaires
            </h3>
            <p className="text-xs text-n-500 mt-0.5">{count} bulletins · {fcfa(total)} à verser</p>
          </div>
          <button onClick={close} className="w-8 h-8 hover:bg-n-100 rounded-sm flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        {phase === 'select' && (
          <div className="p-6 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-3">Méthode de paiement</p>
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              {PROVIDERS.map((pr) => (
                <button key={pr.id} onClick={() => setProvider(pr.id)} className={`flex items-start gap-3 p-4 rounded-sm border-2 text-left transition-all ${provider === pr.id ? 'border-orange bg-orange-tint/30' : 'border-n-200 hover:border-n-300'}`}>
                  <div className="w-11 h-11 rounded-sm flex items-center justify-center shrink-0 overflow-hidden border border-n-200" style={{ background: pr.bg }}>
                    {pr.logo ? (
                      <img src={pr.logo} alt={`${pr.name} logo`} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-xl">{pr.fallback}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{pr.name}</p>
                    <p className="text-[11px] text-n-500 mt-0.5">Frais {pr.fees} · {pr.speed}</p>
                  </div>
                  {provider === pr.id && <CheckCircle2 className="w-4 h-4 text-orange shrink-0 mt-0.5" />}
                </button>
              ))}
            </div>
            <div className="bg-n-50 border border-n-200 p-4 rounded-sm">
              <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-2">Récapitulatif</p>
              <div className="text-sm space-y-1.5">
                <div className="flex justify-between"><span className="text-n-600">Montant net à verser</span><span className="font-mono font-semibold">{fcfa(total)}</span></div>
                <div className="flex justify-between"><span className="text-n-600">Frais {p.name}</span><span className="font-mono">{fcfa(Math.round(total * 0.01))}</span></div>
                <div className="flex justify-between font-semibold border-t border-n-200 pt-1.5 mt-1.5"><span>Total débit compte employeur</span><span className="font-mono text-orange-deep">{fcfa(total + Math.round(total * 0.01))}</span></div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={close} className="px-4 h-10 text-sm border border-n-300 rounded-sm hover:bg-n-50">Annuler</button>
              <button onClick={() => setPhase('review')} className="px-4 h-10 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep">Continuer</button>
            </div>
          </div>
        )}

        {phase === 'review' && (
          <div className="p-6 overflow-y-auto flex-1">
            <p className="text-sm text-n-700 mb-4">Vérifiez la liste des virements avant validation. Code PIN OTP requis pour signer l'opération.</p>
            <div className="border border-n-200 rounded-sm mb-4 max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-n-50 sticky top-0">
                  <tr><th className="text-left px-3 py-2 font-semibold">Bénéficiaire</th><th className="text-left px-3 py-2 font-semibold">N° {p.name}</th><th className="text-right px-3 py-2 font-semibold">Montant</th></tr>
                </thead>
                <tbody>
                  {active.slice(0, 10).map((e) => {
                    const pp = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
                    return (
                      <tr key={e.id} className="border-b border-n-100 last:border-0">
                        <td className="px-3 py-2">{e.firstName} {e.lastName}</td>
                        <td className="px-3 py-2 font-mono text-n-600">+225 0{Math.floor(Math.random() * 9)} ** ** ** **</td>
                        <td className="px-3 py-2 text-right font-mono font-semibold">{fcfa(Math.round(pp.net))}</td>
                      </tr>
                    )
                  })}
                  {active.length > 10 && (
                    <tr><td colSpan={3} className="px-3 py-2 text-center text-n-500 text-[11px]">+ {active.length - 10} autres bénéficiaires…</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-1 block">Code PIN OTP envoyé par SMS</span>
              <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" maxLength={4} inputMode="numeric" className="w-32 h-12 px-4 border border-n-300 rounded-sm font-mono text-2xl tracking-[0.4em] text-center focus:outline-none focus:border-orange" />
              <p className="text-[10px] text-n-500 mt-1">Démo : tapez n'importe quels 4 chiffres</p>
            </label>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={() => setPhase('select')} className="px-4 h-10 text-sm border border-n-300 rounded-sm hover:bg-n-50">Précédent</button>
              <button disabled={pin.length < 4} onClick={startSending} className="px-4 h-10 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2">
                <Send className="w-3.5 h-3.5" /> Envoyer les paiements
              </button>
            </div>
          </div>
        )}

        {phase === 'sending' && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-orange animate-spin mb-4" />
            <p className="font-serif text-xl font-semibold">Envoi des paiements en cours</p>
            <p className="text-sm text-n-600 mt-2">Connexion à {p.name}…</p>
            <p className="text-[11px] text-n-500 mt-1">Ne fermez pas cette fenêtre. {count} virements à traiter.</p>
          </div>
        )}

        {phase === 'done' && (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <p className="font-serif text-2xl font-semibold">{count} paiements envoyés</p>
            <p className="text-sm text-n-600 mt-2">Montant total versé : <strong className="text-orange-deep">{fcfa(total)}</strong> via {p.name}.</p>
            <p className="text-[11px] text-n-500 mt-1">Réf. opération · OPE-{Date.now().toString().slice(-8)}</p>
            <div className="mt-6 grid sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-green-50 p-3 rounded-sm"><p className="font-semibold text-green-700">{count}</p><p className="text-n-600">Réussis</p></div>
              <div className="bg-orange-tint p-3 rounded-sm"><p className="font-semibold text-orange-deep">0</p><p className="text-n-600">En attente</p></div>
              <div className="bg-n-50 p-3 rounded-sm"><p className="font-semibold">0</p><p className="text-n-600">Échecs</p></div>
            </div>
            <button onClick={() => { close(); store.toast('Justificatifs de paiement archivés', 'success') }} className="mt-6 px-5 h-10 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep">
              Archiver et fermer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const AUDIT_ITEMS = [
  { id: 'bulletins',  label: 'Bulletins PDF (tous salariés)',          icon: FileText,        size: '2,4 Mo', mandatory: true },
  { id: 'livre',      label: 'Livre de paie Excel (.xlsx)',             icon: FileSpreadsheet, size: '180 Ko', mandatory: true },
  { id: 'cnps',       label: 'Bordereau CNPS au format e-CNPS',         icon: ShieldCheck,     size: '45 Ko',  mandatory: true },
  { id: 'dgi',        label: 'État 301 DGI (e-impots.gouv.ci)',         icon: ShieldCheck,     size: '32 Ko',  mandatory: true },
  { id: 'recap',      label: 'Récap charges et retenues (PDF)',         icon: FileText,        size: '52 Ko',  mandatory: false },
  { id: 'audit',      label: 'Manifest signé numériquement (audit.json)', icon: ShieldCheck,   size: '8 Ko',   mandatory: false },
]

export function ExportAuditModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sel, setSel] = useState<string[]>(AUDIT_ITEMS.map((i) => i.id))
  const [phase, setPhase] = useState<'select' | 'building' | 'ready'>('select')

  if (!open) return null

  const toggle = (id: string) => {
    const item = AUDIT_ITEMS.find((i) => i.id === id)!
    if (item.mandatory) return
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  const build = () => {
    setPhase('building')
    setTimeout(() => setPhase('ready'), 1800)
  }

  const download = () => {
    store.toast('Archive audit-paie-nov2026.zip téléchargée', 'success')
    setPhase('select')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[85] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-n-200 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold tracking-tight inline-flex items-center gap-2">
            <Archive className="w-4 h-4 text-orange" /> Export audit complet
          </h3>
          <button onClick={onClose} className="w-8 h-8 hover:bg-n-100 rounded-sm flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        {phase === 'select' && (
          <>
            <div className="p-6">
              <p className="text-sm text-n-700 mb-4">Génère une archive ZIP contenant tous les documents requis en cas de contrôle CNPS ou DGI. Conservation légale 5 ans.</p>
              <ul className="space-y-2">
                {AUDIT_ITEMS.map((i) => (
                  <li key={i.id}>
                    <label className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-colors ${sel.includes(i.id) ? 'border-orange bg-orange-tint/30' : 'border-n-200 hover:border-n-300'} ${i.mandatory ? 'opacity-95' : ''}`}>
                      <input type="checkbox" checked={sel.includes(i.id)} onChange={() => toggle(i.id)} disabled={i.mandatory} className="w-4 h-4 accent-orange" />
                      <i.icon className="w-4 h-4 text-orange shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{i.label}</p>
                        <p className="text-[10px] text-n-500">{i.size}{i.mandatory && ' · Obligatoire'}</p>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-6 pb-5 flex items-center justify-end gap-2">
              <button onClick={onClose} className="px-4 h-10 text-sm border border-n-300 rounded-sm hover:bg-n-50">Annuler</button>
              <button onClick={build} className="px-4 h-10 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep inline-flex items-center gap-2">
                <Archive className="w-3.5 h-3.5" /> Générer l'archive
              </button>
            </div>
          </>
        )}

        {phase === 'building' && (
          <div className="p-12 flex flex-col items-center text-center">
            <Loader2 className="w-10 h-10 text-orange animate-spin mb-4" />
            <p className="font-serif text-lg font-semibold">Génération de l'archive…</p>
            <p className="text-sm text-n-600 mt-1">Signature numérique en cours.</p>
          </div>
        )}

        {phase === 'ready' && (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Archive className="w-7 h-7 text-green-600" />
            </div>
            <p className="font-serif text-xl font-semibold">Archive prête</p>
            <p className="font-mono text-xs text-n-600 mt-2">audit-paie-nov2026.zip · 2,7 Mo</p>
            <p className="text-[11px] text-n-500 mt-1">SHA-256 vérifié · signature ADC</p>
            <button onClick={download} className="mt-6 px-5 h-10 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep">
              Télécharger
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
