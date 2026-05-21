import { createFileRoute, Link } from '@tanstack/react-router'
import { MarketingFooter } from '../components/marketing-footer'
import { MarketingHeader } from '../components/marketing-header'

export const Route = createFileRoute('/cgv')({ component: CGVPage })

function CGVPage() {
  return (
    <div className="min-h-screen bg-n-50 flex flex-col">
      <MarketingHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Cadre contractuel</p>
        <h1 className="font-serif text-4xl lg:text-5xl font-semibold tracking-tight">Conditions générales <span className="em-serif">de vente</span></h1>
        <p className="mt-3 text-n-700">Régissent l'utilisation du service ADC Paie entre African Digit Consulting (« nous ») et le client professionnel (« vous »).</p>

        <article className="mt-10 space-y-6 text-sm text-n-700 leading-relaxed">
          <Section title="1. Objet du contrat">
            <p>Les présentes CGV définissent les conditions d'accès et d'usage de la plateforme SaaS « ADC Paie », logiciel en ligne de gestion de la paie et des ressources humaines, exploité par African Digit Consulting.</p>
          </Section>
          <Section title="2. Souscription et tarification">
            <p>L'accès au service est conditionné à la souscription d'un abonnement mensuel ou annuel selon les tarifs en vigueur (Starter 49 000, Pro 149 000, Business 299 000 FCFA/mois, Enterprise sur devis).</p>
            <p>Le paiement s'effectue par virement bancaire ou Mobile Money (Wave, Orange Money, MTN MoMo).</p>
          </Section>
          <Section title="3. Engagements ADC Paie">
            <p>Nous nous engageons à : (i) maintenir la plateforme accessible 24/7 avec un SLA de 99,5 % (Pro) ou 99,9 % (Enterprise), (ii) appliquer les barèmes CNPS, ITS, IGR et CN à jour, (iii) sécuriser vos données (TLS 1.3, AES-256, sauvegardes journalières chiffrées).</p>
          </Section>
          <Section title="4. Engagements du client">
            <p>Vous vous engagez à : (i) fournir des informations exactes et à jour sur votre entreprise et vos salariés, (ii) ne pas utiliser le service à des fins illégales, (iii) régler les abonnements aux échéances.</p>
          </Section>
          <Section title="5. Période d'essai">
            <p>Tout nouveau client bénéficie de 14 jours d'essai gratuit, sans engagement ni carte bancaire requise.</p>
          </Section>
          <Section title="6. Résiliation">
            <p>L'abonnement est résiliable à tout moment avec un préavis de 30 jours. Vos données restent accessibles 90 jours après résiliation pour téléchargement, puis sont supprimées définitivement (conservation légale 5 ans des bulletins archivés en parallèle).</p>
          </Section>
          <Section title="7. Responsabilité">
            <p>Notre responsabilité est plafonnée au montant des abonnements payés sur les 12 derniers mois. Nous ne saurions être tenus responsables des conséquences d'informations erronées fournies par le client.</p>
          </Section>
          <Section title="8. Loi applicable">
            <p>Les CGV sont régies par le droit ivoirien. Tout litige est soumis au Tribunal de Première Instance d'Abidjan, après tentative de règlement amiable obligatoire.</p>
          </Section>
          <p className="text-[11px] text-n-500 pt-6 border-t border-n-200">CGV en vigueur depuis le {new Date().toLocaleDateString('fr-FR')} · Version 1.0</p>
        </article>

        <div className="mt-10 flex items-center gap-3 flex-wrap text-sm">
          <Link to="/mentions-legales" className="px-3 h-9 bg-white border border-n-200 hover:border-orange rounded-sm inline-flex items-center">Mentions légales</Link>
          <Link to="/confidentialite" className="px-3 h-9 bg-white border border-n-200 hover:border-orange rounded-sm inline-flex items-center">Politique de confidentialité</Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-xl font-semibold tracking-tight text-ink mb-2">{title}</h2>
      <div className="space-y-1.5">{children}</div>
    </section>
  )
}
