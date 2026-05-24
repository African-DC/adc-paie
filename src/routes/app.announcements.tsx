import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Megaphone, Plus, X, AlertCircle, Bell, Users, ChevronRight } from 'lucide-react'
import { store, useStore } from '../lib/store'
import { useSession } from '../lib/auth-client'

export const Route = createFileRoute('/app/announcements')({ component: AnnouncementsPage })

export type Annonce = {
  id: string
  titre: string
  corps: string
  priorite: 'info' | 'important' | 'urgent'
  destinataires: 'tous' | 'cdi' | 'managers'
  auteur: string
  date: string
}

const SEED: Annonce[] = [
  { id: 'a1', titre: 'Versement gratification fin d\'année 2026', corps: 'Chers collaborateurs, la gratification (13e mois) sera versée avec la paie de décembre 2026 le 5 janvier 2027. Vous recevrez un bulletin distinct via votre espace personnel. Merci pour votre implication tout au long de l\'année.', priorite: 'important', destinataires: 'tous', auteur: 'Marcel Djedje-li · DG', date: '20 mai 2026 · 09:14' },
  { id: 'a2', titre: 'Fermeture des bureaux du 24 au 31 décembre', corps: 'Les bureaux du Plateau seront fermés pour les congés de fin d\'année du 24 décembre 2026 au 2 janvier 2027 inclus. Une permanence d\'urgence sera assurée par Aïcha Koné (DRH) au +225 07 ** ** ** **.', priorite: 'info', destinataires: 'tous', auteur: 'Aïcha Koné · DRH', date: '18 mai 2026 · 16:42' },
  { id: 'a3', titre: 'Nouvelle mutuelle santé · à partir du 1er janvier', corps: 'Nous avons signé un partenariat avec NSIA Assurances pour une couverture santé étendue : remboursement 80 % (vs 70 % actuel), réseau de 250 prestataires en Côte d\'Ivoire, application mobile dédiée. Les cartes seront distribuées le 28 décembre.', priorite: 'important', destinataires: 'cdi', auteur: 'Aïcha Koné · DRH', date: '15 mai 2026 · 11:20' },
  { id: 'a4', titre: 'Formation obligatoire sécurité informatique', corps: 'Tous les managers sont invités à suivre la formation sécurité informatique en ligne avant le 30 juin. Lien envoyé par mail. Durée estimée : 1h30. Validation obligatoire pour le renouvellement des accès systèmes.', priorite: 'urgent', destinataires: 'managers', auteur: 'Marcel Djedje-li · DG', date: '14 mai 2026 · 08:30' },
]

function AnnouncementsPage() {
  const session = useSession()
  const isEmployeeMode = useStore((s) => {
    if (typeof window === 'undefined') return false
    return window.location.pathname.startsWith('/app/me') || window.location.search.includes('from=me')
  })
  const [annonces, setAnnonces] = useState<Annonce[]>(session.data ? [] : SEED)
  const [showNew, setShowNew] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Communication interne</p>
          <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">Annonces <span className="em-serif">RH</span></h1>
          <p className="mt-2 text-n-700">Notes de service, communications de la direction et actualités RH adressées aux équipes.</p>
        </div>
        {!isEmployeeMode && (
          <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-2 bg-orange text-white px-4 h-9 text-xs font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm">
            <Plus className="w-3.5 h-3.5" /> Nouvelle annonce
          </button>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <KPI label="Annonces actives" value={String(annonces.length)} icon={Megaphone} />
        <KPI label="Urgentes" value={String(annonces.filter((a) => a.priorite === 'urgent').length)} icon={AlertCircle} accent />
        <KPI label="Audience moyenne" value="14 salariés" icon={Users} />
      </div>

      <div className="space-y-3">
        {annonces.map((a) => (
          <AnnonceCard key={a.id} a={a} />
        ))}
      </div>

      {showNew && <NewAnnonceModal onClose={() => setShowNew(false)} onCreate={(a) => { setAnnonces([a, ...annonces]); store.toast('Annonce publiée · notifiée à 14 salariés', 'success'); setShowNew(false) }} />}
    </div>
  )
}

function KPI({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent?: boolean }) {
  return (
    <div className={`p-5 rounded-sm border ${accent ? 'bg-orange-tint border-orange/30' : 'bg-white border-n-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] tracking-[0.22em] uppercase text-n-500 font-semibold">{label}</p>
        <Icon className={`w-4 h-4 ${accent ? 'text-orange' : 'text-n-400'}`} />
      </div>
      <p className="font-serif font-semibold text-2xl tracking-tight leading-none">{value}</p>
    </div>
  )
}

function AnnonceCard({ a }: { a: Annonce }) {
  const [open, setOpen] = useState(false)
  const prio = {
    info:      { bg: 'bg-n-100', text: 'text-n-700', border: 'border-n-300', label: 'Information' },
    important: { bg: 'bg-orange-tint', text: 'text-orange-deep', border: 'border-orange', label: 'Important' },
    urgent:    { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500', label: 'Urgent' },
  }[a.priorite]
  const cible = { tous: 'Tous les salariés', cdi: 'CDI uniquement', managers: 'Managers' }[a.destinataires]

  return (
    <div className={`bg-white border border-n-200 rounded-sm overflow-hidden border-l-4 ${prio.border}`}>
      <button onClick={() => setOpen(!open)} className="w-full px-5 py-4 flex items-start gap-4 text-left hover:bg-n-50/50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm ${prio.bg} ${prio.text}`}>{prio.label}</span>
            <span className="text-[11px] text-n-500">{a.date}</span>
            <span className="text-[11px] text-n-500">·</span>
            <span className="text-[11px] text-n-500 inline-flex items-center gap-1"><Users className="w-3 h-3" /> {cible}</span>
          </div>
          <h3 className="font-serif text-lg font-semibold tracking-tight">{a.titre}</h3>
          {!open && <p className="text-sm text-n-600 mt-1 line-clamp-1">{a.corps}</p>}
        </div>
        <ChevronRight className={`w-4 h-4 text-n-400 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1">
          <div className="bg-n-50 p-4 rounded-sm border border-n-200">
            <p className="text-sm text-n-700 leading-relaxed whitespace-pre-wrap">{a.corps}</p>
          </div>
          <p className="mt-3 text-[11px] text-n-500">Publié par <strong className="text-n-700">{a.auteur}</strong></p>
        </div>
      )}
    </div>
  )
}

function NewAnnonceModal({ onClose, onCreate }: { onClose: () => void; onCreate: (a: Annonce) => void }) {
  const [titre, setTitre] = useState('')
  const [corps, setCorps] = useState('')
  const [priorite, setPriorite] = useState<Annonce['priorite']>('info')
  const [destinataires, setDestinataires] = useState<Annonce['destinataires']>('tous')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titre.trim() || !corps.trim()) return
    onCreate({
      id: 'a' + Date.now(),
      titre: titre.trim(),
      corps: corps.trim(),
      priorite,
      destinataires,
      auteur: 'Marcel Djedje-li · DG',
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    })
  }

  return (
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} className="bg-white rounded-sm shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-n-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-orange font-semibold">Communication interne</p>
            <h2 className="font-serif text-xl font-semibold tracking-tight mt-1">Nouvelle annonce</h2>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 hover:bg-n-100 rounded-sm flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Titre</label>
            <input required value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex. Versement gratification fin d'année" className="mt-1 w-full border border-n-300 rounded-sm h-10 px-3 text-sm focus:border-orange focus:ring-1 focus:ring-orange outline-none" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Message</label>
            <textarea required value={corps} onChange={(e) => setCorps(e.target.value)} rows={6} placeholder="Rédigez votre annonce…" className="mt-1 w-full border border-n-300 rounded-sm px-3 py-2 text-sm focus:border-orange focus:ring-1 focus:ring-orange outline-none" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Priorité</label>
              <select value={priorite} onChange={(e) => setPriorite(e.target.value as any)} className="mt-1 w-full border border-n-300 rounded-sm h-10 px-3 text-sm focus:border-orange focus:ring-1 focus:ring-orange outline-none">
                <option value="info">Information</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Destinataires</label>
              <select value={destinataires} onChange={(e) => setDestinataires(e.target.value as any)} className="mt-1 w-full border border-n-300 rounded-sm h-10 px-3 text-sm focus:border-orange focus:ring-1 focus:ring-orange outline-none">
                <option value="tous">Tous les salariés (14)</option>
                <option value="cdi">CDI uniquement (12)</option>
                <option value="managers">Managers uniquement (3)</option>
              </select>
            </div>
          </div>
          <div className="bg-orange-tint border-l-4 border-orange p-3 rounded-sm flex items-start gap-2">
            <Bell className="w-4 h-4 text-orange shrink-0 mt-0.5" />
            <p className="text-xs text-n-700">Les destinataires recevront une notification dans leur espace salarié dès la publication.</p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-n-200 bg-n-50 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 h-10 text-sm font-medium border border-n-300 hover:bg-n-100 rounded-sm">Annuler</button>
          <button type="submit" className="inline-flex items-center gap-2 bg-orange text-white px-5 h-10 text-xs font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm">
            Publier l'annonce
          </button>
        </div>
      </form>
    </div>
  )
}
