import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Download, FileText, Calendar, Mail, Phone, MapPin, ShieldCheck, Sparkles, Plus, ChevronRight, CheckCircle2, Clock } from 'lucide-react'
import { EMPLOYEES, fcfa, computePayslip } from '../lib/mock'
import { store } from '../lib/store'

export const Route = createFileRoute('/app/me')({ component: MePage })

const ME_ID = '4'
const MONTHS = ['Novembre 2026', 'Octobre 2026', 'Septembre 2026', 'Août 2026', 'Juillet 2026', 'Juin 2026', 'Mai 2026', 'Avril 2026', 'Mars 2026', 'Février 2026', 'Janvier 2026', 'Décembre 2025']

function MePage() {
  const me = EMPLOYEES.find((e) => e.id === ME_ID)!
  const [tab, setTab] = useState<'home' | 'payslips' | 'leave' | 'docs'>('home')
  const [showLeave, setShowLeave] = useState(false)
  const [showDocReq, setShowDocReq] = useState(false)
  const p = computePayslip(me.brut, me.family.kids, me.family.situation === 'marié(e)')
  const initials = `${me.firstName[0]}${me.lastName[0]}`

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-ink to-ink-2 text-white rounded-sm p-6 md:p-8">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="w-16 h-16 bg-orange text-white font-serif font-semibold text-xl rounded-full flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-orange font-semibold">Mon espace salarié</p>
            <h1 className="font-serif text-3xl font-semibold tracking-tight mt-1">Bonjour, <span className="text-orange italic font-medium">{me.firstName}</span>.</h1>
            <p className="mt-2 text-n-300 text-sm">Consultez vos bulletins, soldes de congés et documents personnels. Toutes vos données restent confidentielles.</p>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-[10px] uppercase tracking-wider text-n-400">Matricule</p>
            <p className="font-mono text-xs text-white mt-0.5">{me.matricule}</p>
            <p className="text-[10px] uppercase tracking-wider text-n-400 mt-2">Statut</p>
            <p className="text-xs text-white mt-0.5 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Actif · {me.contract}
            </p>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-3">
          <SelfKPI label="Net du mois" value={fcfa(Math.round(p.net))} sub="Versement le 5 décembre" />
          <SelfKPI label="Congés disponibles" value="18 j" sub="Acquis sur l'année en cours" />
          <SelfKPI label="Dernier bulletin" value="Nov. 2026" sub="Disponible au téléchargement" />
        </div>
      </div>

      <div className="border-b border-n-200 flex gap-1 overflow-x-auto">
        {([
          { v: 'home', l: 'Accueil' },
          { v: 'payslips', l: 'Mes bulletins' },
          { v: 'leave', l: 'Mes congés' },
          { v: 'docs', l: 'Mes documents' },
        ] as const).map((t) => (
          <button key={t.v} onClick={() => setTab(t.v)} className={`px-4 h-10 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.v ? 'border-orange text-orange' : 'border-transparent text-n-600 hover:text-ink'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === 'home' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-n-200 rounded-sm p-6">
            <h2 className="font-serif text-xl font-semibold tracking-tight mb-4">Mes informations</h2>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <Info icon={Mail} label="E-mail" value={`${me.firstName.toLowerCase()}.${me.lastName.toLowerCase()}@example.ci`} />
              <Info icon={Phone} label="Téléphone" value="+225 07 ** ** ** **" />
              <Info icon={MapPin} label="Adresse" value="Cocody, Abidjan" />
              <Info icon={Calendar} label="Date d'embauche" value={me.joinedAt} />
              <Info label="Poste" value={me.role} />
              <Info label="Contrat" value={me.contract} />
              <Info label="Situation familiale" value={`${me.family.situation} · ${me.family.kids} enfant${me.family.kids > 1 ? 's' : ''}`} />
              <Info label="Salaire brut mensuel" value={fcfa(me.brut)} mono />
            </div>
            <button onClick={() => store.toast('Demande de mise à jour envoyée aux RH', 'success')} className="mt-5 text-xs font-semibold uppercase tracking-wider text-orange hover:text-orange-deep inline-flex items-center gap-1.5">
              Demander une mise à jour <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-orange-tint border-l-4 border-orange p-5 rounded-sm">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-orange shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink text-sm">Astuce IA</p>
                  <p className="text-xs text-n-700 mt-1 leading-relaxed">Votre net devrait augmenter de <strong>+18 000 XOF</strong> en janvier 2027 grâce à la révision automatique du quotient familial.</p>
                </div>
              </div>
            </div>
            <button onClick={() => setShowLeave(true)} className="w-full bg-white border border-n-200 hover:border-orange p-4 rounded-sm text-left transition-colors group">
              <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-1">Demande rapide</p>
              <p className="font-semibold text-sm group-hover:text-orange transition-colors">Poser des congés</p>
              <p className="text-xs text-n-600 mt-1">Solde 18 jours · validation manager sous 48 h</p>
            </button>
            <button onClick={() => setShowDocReq(true)} className="w-full bg-white border border-n-200 hover:border-orange p-4 rounded-sm text-left transition-colors group">
              <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-1">Demande rapide</p>
              <p className="font-semibold text-sm group-hover:text-orange transition-colors">Attestation de travail</p>
              <p className="text-xs text-n-600 mt-1">Génération automatique en PDF signé</p>
            </button>
          </div>
        </div>
      )}

      {tab === 'payslips' && (
        <div className="bg-white border border-n-200 rounded-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-n-200 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold tracking-tight">Bulletins de paie · 12 derniers mois</h2>
            <button onClick={() => store.toast('Archive ZIP de tous les bulletins préparée', 'success')} className="text-xs font-semibold text-orange hover:text-orange-deep uppercase tracking-wider inline-flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Tout télécharger
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-n-50 border-b border-n-200">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-n-700">Période</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-n-700">Brut</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-n-700">Retenues</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-orange">Net</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-n-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((m, i) => (
                  <tr key={m} className="border-b border-n-100 hover:bg-n-50/50">
                    <td className="px-4 py-3 font-medium">{m}{i === 0 && <span className="ml-2 inline-block px-1.5 py-0.5 bg-orange text-white text-[9px] font-bold uppercase tracking-wider rounded-sm">Nouveau</span>}</td>
                    <td className="px-4 py-3 font-mono text-right">{fcfa(me.brut)}</td>
                    <td className="px-4 py-3 font-mono text-right text-n-600">- {fcfa(Math.round(p.cnps + p.its + p.igr + p.cn))}</td>
                    <td className="px-4 py-3 font-mono text-right font-semibold text-orange-deep">{fcfa(Math.round(p.net))}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {i === 0 && (
                          <Link to="/app/payroll/payslip/$id" params={{ id: me.id }} className="text-xs font-semibold text-orange hover:underline">Voir</Link>
                        )}
                        <button onClick={() => store.toast(`Bulletin ${m} téléchargé`, 'success')} className="text-xs text-n-600 hover:text-orange inline-flex items-center gap-1">
                          <Download className="w-3 h-3" /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'leave' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-3">
            <SelfStat label="Acquis 2026" value="22 j" tone="default" />
            <SelfStat label="Pris" value="4 j" tone="default" />
            <SelfStat label="Solde restant" value="18 j" tone="accent" />
          </div>
          <div className="bg-white border border-n-200 rounded-sm">
            <div className="px-6 py-4 border-b border-n-200 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold tracking-tight">Mes demandes</h2>
              <button onClick={() => setShowLeave(true)} className="inline-flex items-center gap-2 bg-orange text-white px-3 h-8 text-xs font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm">
                <Plus className="w-3.5 h-3.5" /> Nouvelle demande
              </button>
            </div>
            <ul className="divide-y divide-n-100">
              {[
                { dates: '15-19 août 2026', kind: 'Congés payés', days: '5 j', status: 'Validé' },
                { dates: '23 mai 2026', kind: 'Maladie', days: '1 j', status: 'Validé' },
                { dates: '02-05 janvier 2027', kind: 'Congés payés', days: '4 j', status: 'En attente' },
              ].map((r, i) => (
                <li key={i} className="px-6 py-3 flex items-center gap-4">
                  <div className="w-9 h-9 bg-n-100 rounded-full flex items-center justify-center shrink-0">
                    {r.status === 'Validé' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-orange" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{r.kind} · {r.dates}</p>
                    <p className="text-[11px] text-n-500">{r.days}</p>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm ${r.status === 'Validé' ? 'bg-green-100 text-green-700' : 'bg-orange-tint text-orange-deep'}`}>{r.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tab === 'docs' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { name: 'Contrat de travail signé', sub: 'CDI · signé électroniquement', icon: ShieldCheck },
              { name: 'Attestation de travail', sub: 'À la demande · génération auto', icon: FileText },
              { name: 'Attestation CNPS', sub: 'À jour · novembre 2026', icon: ShieldCheck },
              { name: 'Solde de tout compte', sub: 'Indisponible · contrat actif', icon: FileText, locked: true },
              { name: 'Reçu fiscal annuel 2025', sub: 'Pour déclaration DGI', icon: FileText },
              { name: 'Avenant salaire 2026', sub: 'Signé le 12/01/2026', icon: FileText },
            ].map((d) => (
              <button
                key={d.name}
                disabled={d.locked}
                onClick={() => d.name === 'Attestation de travail' ? setShowDocReq(true) : store.toast(`${d.name} téléchargé`, 'success')}
                className={`flex items-center gap-3 p-4 bg-white border border-n-200 rounded-sm text-left transition-colors ${d.locked ? 'opacity-50 cursor-not-allowed' : 'hover:border-orange hover:bg-orange-tint/30'}`}
              >
                <d.icon className="w-5 h-5 text-orange shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{d.name}</p>
                  <p className="text-[11px] text-n-500 truncate">{d.sub}</p>
                </div>
                {!d.locked && <Download className="w-3.5 h-3.5 text-n-400" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {showLeave && <LeaveRequestModal onClose={() => setShowLeave(false)} />}
      {showDocReq && <DocRequestModal onClose={() => setShowDocReq(false)} />}
    </div>
  )
}

function Info({ icon: Icon, label, value, mono }: { icon?: any; label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-1 inline-flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </p>
      <p className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}

function SelfKPI({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-4 rounded-sm">
      <p className="text-[10px] uppercase tracking-[0.22em] text-n-400 font-semibold">{label}</p>
      <p className="font-serif text-xl font-semibold mt-1.5">{value}</p>
      <p className="text-[11px] text-n-400 mt-1">{sub}</p>
    </div>
  )
}

function SelfStat({ label, value, tone }: { label: string; value: string; tone: 'default' | 'accent' }) {
  return (
    <div className={`p-5 rounded-sm border ${tone === 'accent' ? 'bg-orange-tint border-orange/30' : 'bg-white border-n-200'}`}>
      <p className={`text-[10px] tracking-[0.22em] uppercase font-semibold ${tone === 'accent' ? 'text-orange-deep' : 'text-n-500'}`}>{label}</p>
      <p className="font-serif font-semibold text-2xl mt-2">{value}</p>
    </div>
  )
}

function LeaveRequestModal({ onClose }: { onClose: () => void }) {
  const [kind, setKind] = useState('Congés payés')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [reason, setReason] = useState('')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    store.toast('Demande de congé envoyée au manager', 'success')
    onClose()
  }
  return (
    <div className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md rounded-sm shadow-2xl">
        <div className="px-6 py-4 border-b border-n-200">
          <h3 className="font-serif text-lg font-semibold tracking-tight">Nouvelle demande de congé</h3>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Type">
            <select required value={kind} onChange={(e) => setKind(e.target.value)} className="w-full h-10 px-3 border border-n-300 rounded-sm bg-white text-sm">
              <option>Congés payés</option>
              <option>Maladie</option>
              <option>Familial (mariage, naissance, décès)</option>
              <option>Sans solde</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Du">
              <input required type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full h-10 px-3 border border-n-300 rounded-sm text-sm" />
            </Field>
            <Field label="Au">
              <input required type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full h-10 px-3 border border-n-300 rounded-sm text-sm" />
            </Field>
          </div>
          <Field label="Motif (optionnel)">
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full px-3 py-2 border border-n-300 rounded-sm text-sm" placeholder="Précision pour votre manager…" />
          </Field>
        </div>
        <div className="px-6 pb-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 h-10 text-sm border border-n-300 rounded-sm hover:bg-n-50">Annuler</button>
          <button type="submit" className="px-4 h-10 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep">Envoyer la demande</button>
        </div>
      </form>
    </div>
  )
}

function DocRequestModal({ onClose }: { onClose: () => void }) {
  const [reason, setReason] = useState('Demande de visa')
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    store.toast('Attestation générée et envoyée par e-mail', 'success')
    onClose()
  }
  return (
    <div className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md rounded-sm shadow-2xl">
        <div className="px-6 py-4 border-b border-n-200">
          <h3 className="font-serif text-lg font-semibold tracking-tight">Demander une attestation</h3>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Objet">
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full h-10 px-3 border border-n-300 rounded-sm bg-white text-sm">
              <option>Demande de visa</option>
              <option>Dossier bancaire</option>
              <option>Location immobilière</option>
              <option>Démarche administrative</option>
              <option>Autre</option>
            </select>
          </Field>
          <div className="bg-orange-tint border border-orange/20 p-3 rounded-sm text-xs text-n-700">
            <p className="inline-flex items-center gap-1.5 font-semibold text-ink mb-1"><Sparkles className="w-3.5 h-3.5 text-orange" /> Génération automatique</p>
            <p>Votre attestation sera générée immédiatement, signée numériquement, et envoyée à votre adresse e-mail professionnelle.</p>
          </div>
        </div>
        <div className="px-6 pb-5 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 h-10 text-sm border border-n-300 rounded-sm hover:bg-n-50">Annuler</button>
          <button type="submit" className="px-4 h-10 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep">Générer</button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-1 block">{label}</span>
      {children}
    </label>
  )
}
