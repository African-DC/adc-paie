import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Sparkles, MapPin, Calendar, Users, Building2, Mail, Phone, Award, Heart, Target } from 'lucide-react'
import { MarketingFooter } from '../components/marketing-footer'
import { MarketingHeader } from '../components/marketing-header'

export const Route = createFileRoute('/a-propos')({ component: AProposPage })

const TEAM = [
  { name: 'Marcel Djedje-li',  role: 'Fondateur & Head of Dev',    bio: 'Développeur full-stack basé à Abidjan, 3+ ans d\'expérience B2B (NSIA Banque, Klassci 10 écoles).',  initials: 'MD' },
  { name: 'Équipe Produit',     role: '3 développeurs front + back', bio: 'Spécialistes React, Node.js, infrastructure cloud Vercel + RunPod.',                              initials: 'EP' },
  { name: 'Équipe Conformité',  role: '2 consultants RH & paie',     bio: 'Veille permanente barèmes DGI, CNPS, jurisprudence Code du travail ivoirien.',                  initials: 'EC' },
  { name: 'Équipe Design',      role: '2 designers UI/UX',           bio: 'Design system editorial · typographie Fraunces · standards accessibilité WCAG AA.',              initials: 'ED' },
  { name: 'Équipe Support',     role: '2 customer success',          bio: 'Support WhatsApp, e-mail et téléphonique · français et baoulé · 9h-18h.',                        initials: 'ES' },
]

const VALEURS = [
  { icon: Award,  title: 'Conformité avant tout',       desc: 'Les barèmes 2026 sont appliqués automatiquement. Aucune marge d\'erreur sur les déclarations légales.' },
  { icon: Heart,  title: 'Au service des PME',          desc: 'Notre produit est conçu en partant des besoins du DRH, du comptable et du dirigeant — pas de l\'ingénieur.' },
  { icon: Target, title: 'Souveraineté technologique',  desc: 'Le digital africain pour les entreprises africaines. Hébergement régional, support local, équipe locale.' },
]

function AProposPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <MarketingHeader />

      <main className="flex-1">
        <section className="dot-pattern">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
            <div className="max-w-3xl">
              <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-3">À propos d'African Digit Consulting</p>
              <h1 className="font-serif text-4xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
                Le digital au service<br /><span className="em-serif">des peuples.</span>
              </h1>
              <p className="mt-6 text-lg text-n-700 leading-relaxed">
                African Digit Consulting est une agence digitale basée à Grand-Bassam, Côte d'Ivoire. Depuis 2023, nous concevons des plateformes SaaS pensées pour les organisations africaines : écoles, PME, institutions publiques et privées.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Metric value="2023"   label="Année de fondation" />
              <Metric value="10+"    label="Experts dans l'équipe" />
              <Metric value="50+"    label="Projets livrés" />
              <Metric value="7 600+" label="Étudiants gérés via Klassci" accent />
            </div>
          </div>
        </section>

        <section className="bg-n-50 border-y border-n-200">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
            <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-3">Notre mission</p>
            <h2 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight max-w-3xl">Outiller les organisations ivoiriennes avec des SaaS qui rivalisent <span className="em-serif">mondialement.</span></h2>
            <p className="mt-5 text-n-700 max-w-3xl leading-relaxed">
              Nous croyons que les PME, écoles et institutions africaines méritent les mêmes outils numériques que leurs homologues européens ou nord-américains, adaptés à leur réalité réglementaire, économique et culturelle. ADC Paie incarne cette mission pour le marché de la paie et des ressources humaines en Côte d'Ivoire.
            </p>
            <div className="mt-10 grid md:grid-cols-3 gap-4">
              {VALEURS.map((v) => (
                <div key={v.title} className="bg-white border border-n-200 rounded-sm p-6">
                  <v.icon className="w-6 h-6 text-orange mb-3" />
                  <p className="font-serif text-lg font-semibold tracking-tight">{v.title}</p>
                  <p className="text-sm text-n-700 mt-2 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
            <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-3">L'équipe</p>
            <h2 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight max-w-3xl">Dix professionnels qui font tourner <span className="em-serif">la plateforme.</span></h2>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEAM.map((t) => (
                <div key={t.name} className="bg-n-50 border border-n-200 rounded-sm p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-orange text-white font-serif font-semibold text-base rounded-full flex items-center justify-center shrink-0">{t.initials}</div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-[11px] text-orange-deep uppercase tracking-wider font-semibold mt-0.5">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-n-700 mt-3 leading-relaxed">{t.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ink text-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-[11px] tracking-[0.28em] uppercase text-orange font-semibold mb-3">Notre adresse</p>
                <h2 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">Basés à Grand-Bassam, <span className="em-serif text-orange">Sud-Comoé.</span></h2>
                <p className="mt-5 text-n-300 leading-relaxed max-w-md">
                  Grand-Bassam, ancienne capitale coloniale classée UNESCO, est notre port d'attache. Nous travaillons à 45 km du Plateau d'Abidjan, loin du tumulte, proches de l'océan.
                </p>
                <div className="mt-8 space-y-3 text-sm">
                  <div className="inline-flex items-center gap-3"><MapPin className="w-4 h-4 text-orange" /> Siti Dia, Grand-Bassam Monckey-ville, Sud-Comoé</div>
                  <div className="block"><a href="mailto:africandigitconsulting@gmail.com" className="inline-flex items-center gap-3 hover:text-orange transition-colors"><Mail className="w-4 h-4 text-orange" /> africandigitconsulting@gmail.com</a></div>
                  <div className="block"><a href="tel:+22527327975 23" className="inline-flex items-center gap-3 hover:text-orange transition-colors"><Phone className="w-4 h-4 text-orange" /> +225 27 32 79 75 23</a></div>
                  <div className="block"><a href="https://africandigitconsulting.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 hover:text-orange transition-colors"><Building2 className="w-4 h-4 text-orange" /> africandigitconsulting.com</a></div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-sm p-8">
                <Calendar className="w-6 h-6 text-orange mb-3" />
                <p className="font-serif text-2xl font-semibold tracking-tight">Notre parcours</p>
                <ul className="mt-6 space-y-4 text-sm border-l-2 border-orange pl-5">
                  <li>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-orange font-semibold">2023</p>
                    <p className="font-semibold text-white mt-1">Fondation ADC à Grand-Bassam</p>
                    <p className="text-n-400 text-xs mt-0.5">Premier client : refonte digitale d'une école technique</p>
                  </li>
                  <li>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-orange font-semibold">2024</p>
                    <p className="font-semibold text-white mt-1">Lancement de Klassci</p>
                    <p className="text-n-400 text-xs mt-0.5">SaaS de gestion scolaire pour écoles supérieures · 10 établissements aujourd'hui</p>
                  </li>
                  <li>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-orange font-semibold">2025</p>
                    <p className="font-semibold text-white mt-1">Mission NSIA Banque</p>
                    <p className="text-n-400 text-xs mt-0.5">Modernisation de portails internes B2B pour l'un des plus grands groupes financiers de la sous-région</p>
                  </li>
                  <li>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-orange font-semibold">2026</p>
                    <p className="font-semibold text-white mt-1">Lancement d'ADC Paie</p>
                    <p className="text-n-400 text-xs mt-0.5">Notre 2e produit phare, pour les 56 000 PME formelles de Côte d'Ivoire</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 text-center">
            <Users className="w-8 h-8 text-orange mx-auto mb-4" />
            <h2 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">Travaillons ensemble.</h2>
            <p className="mt-3 text-n-700 max-w-xl mx-auto">Une question, un projet, ou simplement envie de tester ADC Paie ? Notre équipe répond sous 4 heures ouvrées.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/app" className="bg-orange text-white px-6 h-12 inline-flex items-center justify-center text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep rounded-sm gap-2">
                Tester la démo <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="mailto:africandigitconsulting@gmail.com?subject=Demande%20de%20rendez-vous%20ADC%20Paie" className="border border-ink text-ink px-6 h-12 inline-flex items-center justify-center text-sm font-semibold uppercase tracking-wider hover:bg-ink hover:text-white rounded-sm gap-2 transition-colors">
                <Mail className="w-4 h-4" /> Prendre rendez-vous
              </a>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  )
}

function Metric({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className={`p-5 rounded-sm border ${accent ? 'bg-orange-tint border-orange/30' : 'bg-white border-n-200'}`}>
      <p className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight leading-none">{value}</p>
      <p className={`text-[10px] uppercase tracking-[0.22em] font-semibold mt-3 ${accent ? 'text-orange-deep' : 'text-n-500'}`}>{label}</p>
    </div>
  )
}
