import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Building2, Users, Shield, Bell, History, X, Edit3, Check, CheckCircle2, AlertCircle, LogIn, FileSignature, Send, Wallet, Trash2 } from 'lucide-react'
import { TENANT } from '../lib/mock'
import { store } from '../lib/store'

export const Route = createFileRoute('/app/settings')({ component: SettingsPage })

function SettingsPage() {
  const [toggles, setToggles] = useState({ mfa: true, login_alert: true, multi_session: false, deadline: true, monthly: true, whatsapp: false })
  const flip = (k: keyof typeof toggles) => {
    const next = !toggles[k]
    setToggles({ ...toggles, [k]: next })
    store.toast(next ? 'Préférence activée' : 'Préférence désactivée', 'success')
  }
  const [tenant, setTenant] = useState({ name: TENANT.name, ifu: TENANT.ifu, cnps: TENANT.cnps, sector: TENANT.sector, taux_at: String(TENANT.taux_at), city: TENANT.city })
  const [editing, setEditing] = useState<string | null>(null)
  const setField = (k: string, v: string) => setTenant((t) => ({ ...t, [k]: v }))
  const saveField = (k: string) => { setEditing(null); store.toast(`${({ name: 'Raison sociale', ifu: 'IFU', cnps: 'CNPS', sector: 'Secteur', taux_at: 'Taux AT', city: 'Ville' } as any)[k]} mis à jour`, 'success') }
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Configuration</p>
        <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">Réglages de l'<span className="em-serif">espace</span></h1>
        <p className="mt-2 text-n-700">Identifiants légaux de votre entreprise et préférences de la plateforme.</p>
      </div>

      <div className="space-y-6">
        <Card title="Informations légales" icon={Building2}>
          <EditableField label="Raison sociale"            k="name"    value={tenant.name}    editing={editing} setEditing={setEditing} onChange={setField} onSave={saveField} />
          <EditableField label="IFU (DGI)"                 k="ifu"     value={tenant.ifu}     editing={editing} setEditing={setEditing} onChange={setField} onSave={saveField} mono />
          <EditableField label="Numéro CNPS employeur"     k="cnps"    value={tenant.cnps}    editing={editing} setEditing={setEditing} onChange={setField} onSave={saveField} mono />
          <EditableField label="Secteur d'activité"        k="sector"  value={tenant.sector}  editing={editing} setEditing={setEditing} onChange={setField} onSave={saveField} />
          <EditableField label="Taux Accidents du travail" k="taux_at" value={tenant.taux_at} editing={editing} setEditing={setEditing} onChange={setField} onSave={saveField} suffix=" %" />
          <EditableField label="Ville"                     k="city"    value={tenant.city}    editing={editing} setEditing={setEditing} onChange={setField} onSave={saveField} />
        </Card>

        <Card title="Équipe et rôles" icon={Users}>
          <div className="space-y-3">
            {[
              { name: 'Marcel Djedje-li', role: 'Administrateur', email: 'marcel@adc-paie.ci' },
              { name: 'Aïcha Koné', role: 'DRH', email: 'aicha.kone@example.ci' },
              { name: 'Mamadou Diabaté', role: 'Comptable', email: 'mamadou.diabate@example.ci' },
            ].map((u) => (
              <div key={u.email} className="flex items-center justify-between gap-4 py-2 border-b border-n-100 last:border-0">
                <div>
                  <p className="font-medium text-sm">{u.name}</p>
                  <p className="text-xs text-n-500">{u.email}</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm bg-orange-tint text-orange-deep">{u.role}</span>
              </div>
            ))}
          </div>
          <button onClick={() => store.toast('Modal d\'invitation disponible en tier Pro', 'info')} className="mt-4 text-sm font-semibold text-orange hover:text-orange-deep">+ Inviter un collaborateur</button>
        </Card>

        <Card title="Sécurité" icon={Shield}>
          <Toggle k="mfa" label="Authentification à deux facteurs (MFA)" desc="Recommandé pour l'accès aux données salariés" toggles={toggles} flip={flip} />
          <Toggle k="login_alert" label="Notifications de connexion suspecte" desc="Alerte e-mail en cas de connexion depuis un nouvel appareil" toggles={toggles} flip={flip} />
          <Toggle k="multi_session" label="Sessions multiples" desc="Autoriser la connexion simultanée sur plusieurs appareils" toggles={toggles} flip={flip} />
        </Card>

        <Card title="Notifications" icon={Bell}>
          <Toggle k="deadline" label="Rappel échéances CNPS et DGI" desc="Alerte 5 jours avant chaque date limite" toggles={toggles} flip={flip} />
          <Toggle k="monthly" label="Récap mensuel par e-mail" desc="Synthèse de la paie du mois envoyée le 1er du mois suivant" toggles={toggles} flip={flip} />
          <Toggle k="whatsapp" label="Alertes WhatsApp Business" desc="Notifications légales urgentes via WhatsApp" toggles={toggles} flip={flip} />
        </Card>

        <Card title="Journal d'audit" icon={History}>
          <p className="text-xs text-n-600 mb-4">Toutes les actions sensibles sont tracées pour la conformité. Conservation 5 ans, hash SHA-256 signé, accès restreint.</p>
          <ul className="divide-y divide-n-100 -mx-6">
            {AUDIT_LOG.map((l, i) => (
              <li key={i} className="px-6 py-3 flex items-start gap-3">
                <l.icon className={`w-4 h-4 mt-0.5 shrink-0 ${l.severity === 'high' ? 'text-orange' : l.severity === 'success' ? 'text-green-600' : 'text-n-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{l.action}</p>
                  <p className="text-[11px] text-n-500 mt-0.5">{l.actor} · IP {l.ip} · {l.when}</p>
                </div>
              </li>
            ))}
          </ul>
          <button onClick={() => store.toast('Export audit log au format CSV téléchargé', 'success')} className="mt-4 text-xs font-semibold text-orange hover:text-orange-deep uppercase tracking-wider">Exporter le journal complet (CSV)</button>
        </Card>

        <Card title="Zone dangereuse" icon={AlertCircle}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-tint/40 border border-orange/30 rounded-sm">
              <div>
                <p className="text-sm font-semibold">Exporter toutes les données</p>
                <p className="text-[11px] text-n-600">Archive ZIP RGPD-compatible · 12 mois de données</p>
              </div>
              <button onClick={() => store.toast('Export RGPD lancé · vous recevrez un lien sous 24 h', 'success')} className="px-3 h-8 text-xs font-semibold border border-orange text-orange-deep hover:bg-orange-tint rounded-sm">Exporter</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-sm">
              <div>
                <p className="text-sm font-semibold text-red-800">Clôturer l'espace</p>
                <p className="text-[11px] text-red-600">Suppression définitive après période légale 5 ans</p>
              </div>
              <button onClick={() => store.toast('Demande de clôture envoyée · validation manuelle ADC requise', 'warning')} className="px-3 h-8 text-xs font-semibold border border-red-300 text-red-700 hover:bg-red-100 rounded-sm inline-flex items-center gap-1.5">
                <Trash2 className="w-3 h-3" /> Demander
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

const AUDIT_LOG: Array<{ action: string; actor: string; ip: string; when: string; severity: 'normal' | 'high' | 'success'; icon: any }> = [
  { action: 'Paiement de 14 bulletins via Wave (4 375 871 XOF)', actor: 'Marcel Djedje-li', ip: '154.0.20.84', when: 'Aujourd\'hui · 16:42', severity: 'success', icon: Send },
  { action: 'Modification du salaire de Kouassi Brou (520 000 → 550 000 XOF)', actor: 'Aïcha Koné · DRH', ip: '154.0.20.91', when: 'Aujourd\'hui · 14:18', severity: 'high', icon: Edit3 },
  { action: 'Avance de 75 000 XOF approuvée pour Sékou Touré', actor: 'Marcel Djedje-li', ip: '154.0.20.84', when: 'Hier · 17:05', severity: 'normal', icon: Wallet },
  { action: 'Soumission Bordereau CNPS Octobre 2026 (1 812 400 XOF)', actor: 'Mamadou Diabaté · Comptable', ip: '154.0.20.77', when: '15 nov. 2026 · 09:30', severity: 'success', icon: CheckCircle2 },
  { action: 'Connexion depuis nouvel appareil (Chrome · Abidjan)', actor: 'Marcel Djedje-li', ip: '154.0.20.84', when: '14 nov. 2026 · 08:12', severity: 'normal', icon: LogIn },
  { action: 'Signature contrat CDI · Ousmane Coulibaly', actor: 'Aïcha Koné · DRH', ip: '154.0.20.91', when: '15 sept. 2026 · 11:00', severity: 'success', icon: FileSignature },
]

function Card({ title, icon: Icon, children }: any) {
  return (
    <section className="bg-white border border-n-200 rounded-sm p-6">
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-n-100">
        <Icon className="w-4 h-4 text-orange" />
        <h2 className="font-serif text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function EditableField({ label, k, value, editing, setEditing, onChange, onSave, mono, suffix }: { label: string; k: string; value: string; editing: string | null; setEditing: (v: string | null) => void; onChange: (k: string, v: string) => void; onSave: (k: string) => void; mono?: boolean; suffix?: string }) {
  const isEditing = editing === k
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b border-n-100 last:border-0">
      <p className="text-[11px] uppercase tracking-wider text-n-500 font-semibold pt-1">{label}</p>
      <div className="sm:col-span-2 flex items-center justify-between gap-3">
        {isEditing ? (
          <>
            <input
              autoFocus
              value={value}
              onChange={(e) => onChange(k, e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSave(k); if (e.key === 'Escape') setEditing(null) }}
              className={`flex-1 h-9 px-3 border border-orange rounded-sm text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange/20 ${mono ? 'font-mono' : ''}`}
            />
            <button onClick={() => onSave(k)} className="w-8 h-8 bg-orange text-white rounded-sm flex items-center justify-center hover:bg-orange-deep" title="Enregistrer"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={() => setEditing(null)} className="w-8 h-8 border border-n-300 rounded-sm flex items-center justify-center hover:bg-n-50" title="Annuler"><X className="w-3.5 h-3.5" /></button>
          </>
        ) : (
          <>
            <p className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}{suffix}</p>
            <button onClick={() => setEditing(k)} className="text-xs text-orange hover:text-orange-deep font-semibold inline-flex items-center gap-1"><Edit3 className="w-3 h-3" /> Modifier</button>
          </>
        )}
      </div>
    </div>
  )
}

function Toggle({ k, label, desc, toggles, flip }: any) {
  const checked = toggles[k]
  return (
    <button onClick={() => flip(k)} className="w-full flex items-start justify-between gap-4 py-3 border-b border-n-100 last:border-0 text-left">
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-n-500 mt-0.5">{desc}</p>
      </div>
      <div className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${checked ? 'bg-orange' : 'bg-n-300'}`}>
        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
    </button>
  )
}
