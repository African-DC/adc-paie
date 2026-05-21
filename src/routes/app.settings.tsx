import { createFileRoute } from '@tanstack/react-router'
import { Building2, Users, Shield, Bell } from 'lucide-react'
import { TENANT } from '../lib/mock'

export const Route = createFileRoute('/app/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Configuration</p>
        <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">
          Réglages de l'<span className="em-serif">espace</span>
        </h1>
        <p className="mt-2 text-n-700">Identifiants légaux de votre entreprise et préférences de la plateforme.</p>
      </div>

      <div className="space-y-6">
        <Card title="Informations légales" icon={Building2}>
          <Field label="Raison sociale" value={TENANT.name} />
          <Field label="IFU (DGI)" value={TENANT.ifu} mono />
          <Field label="Numéro CNPS employeur" value={TENANT.cnps} mono />
          <Field label="Secteur d'activité" value={TENANT.sector} />
          <Field label="Taux Accidents du travail" value={`${TENANT.taux_at} %`} />
          <Field label="Ville" value={TENANT.city} />
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
          <button className="mt-4 text-sm font-semibold text-orange hover:text-orange-deep">+ Inviter un collaborateur</button>
        </Card>

        <Card title="Sécurité" icon={Shield}>
          <Toggle label="Authentification à deux facteurs (MFA)" desc="Recommandé pour l'accès aux données salariés" checked />
          <Toggle label="Notifications de connexion suspecte" desc="Alerte e-mail en cas de connexion depuis un nouvel appareil" checked />
          <Toggle label="Sessions multiples" desc="Autoriser la connexion simultanée sur plusieurs appareils" />
        </Card>

        <Card title="Notifications" icon={Bell}>
          <Toggle label="Rappel échéances CNPS et DGI" desc="Alerte 5 jours avant chaque date limite" checked />
          <Toggle label="Récap mensuel par e-mail" desc="Synthèse de la paie du mois envoyée le 1er du mois suivant" checked />
          <Toggle label="Alertes WhatsApp Business" desc="Notifications légales urgentes via WhatsApp" />
        </Card>
      </div>
    </div>
  )
}

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

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b border-n-100 last:border-0">
      <p className="text-[11px] uppercase tracking-wider text-n-500 font-semibold pt-1">{label}</p>
      <div className="sm:col-span-2 flex items-center justify-between gap-3">
        <p className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</p>
        <button className="text-xs text-orange hover:text-orange-deep font-semibold">Modifier</button>
      </div>
    </div>
  )
}

function Toggle({ label, desc, checked }: { label: string; desc: string; checked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-n-100 last:border-0">
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-n-500 mt-0.5">{desc}</p>
      </div>
      <div className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${checked ? 'bg-orange' : 'bg-n-300'}`}>
        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
    </div>
  )
}
