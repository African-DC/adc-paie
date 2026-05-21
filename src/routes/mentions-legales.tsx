import { createFileRoute, Link } from '@tanstack/react-router'
import { MarketingFooter } from '../components/marketing-footer'
import { MarketingHeader } from '../components/marketing-header'

export const Route = createFileRoute('/mentions-legales')({ component: MentionsLegalesPage })

function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-n-50 flex flex-col">
      <MarketingHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Informations légales</p>
        <h1 className="font-serif text-4xl lg:text-5xl font-semibold tracking-tight">Mentions <span className="em-serif">légales</span></h1>
        <p className="mt-3 text-n-700">Conformément à la Loi n°2013-450 relative à la protection des données à caractère personnel et au Code du numérique de Côte d'Ivoire.</p>

        <article className="prose mt-10 space-y-6 text-sm text-n-700 leading-relaxed">
          <Section title="Éditeur du site">
            <p><strong>African Digit Consulting (ADC)</strong></p>
            <p>Adresse : Siti Dia, Grand-Bassam Monckey-ville, Sud-Comoé, Côte d'Ivoire</p>
            <p>E-mail : <a href="mailto:africandigitconsulting@gmail.com" className="text-orange hover:underline">africandigitconsulting@gmail.com</a></p>
            <p>Téléphone : <a href="tel:+22527327975 23" className="text-orange hover:underline">+225 27 32 79 75 23</a></p>
            <p>Site web : <a href="https://africandigitconsulting.com" target="_blank" rel="noreferrer" className="text-orange hover:underline">africandigitconsulting.com</a></p>
            <p>Directeur de la publication : Marcel Djedje-li</p>
          </Section>
          <Section title="Hébergement">
            <p>Le site adc-paie.vercel.app est hébergé par <strong>Vercel Inc.</strong>, 440 N Barranca Avenue #4133, Covina, CA 91723, USA.</p>
            <p>Réplication CDN sur les nœuds européens et africains (DKR · Dakar) pour latence optimale.</p>
          </Section>
          <Section title="Propriété intellectuelle">
            <p>L'ensemble du contenu du site (textes, graphismes, logos, code source) est protégé par le droit d'auteur. Toute reproduction, distribution ou modification sans autorisation préalable écrite est interdite.</p>
            <p>La marque <strong>ADC Paie</strong> est déposée auprès de l'Organisation Africaine de la Propriété Intellectuelle (OAPI).</p>
          </Section>
          <Section title="Données personnelles">
            <p>Les données collectées via le site (formulaires, calculatrice, démo) sont traitées conformément à la <strong>Loi n°2013-450</strong> sur la protection des données personnelles en Côte d'Ivoire et à la déclaration ARTCI n° XXXX-XXXX.</p>
            <p>Pour toute demande d'exercice de vos droits (accès, rectification, suppression), contactez notre DPO : <a href="mailto:africandigitconsulting@gmail.com" className="text-orange hover:underline">africandigitconsulting@gmail.com</a>.</p>
          </Section>
          <Section title="Cookies">
            <p>Le site n'utilise que des cookies strictement nécessaires au fonctionnement (session, préférences). Aucun cookie publicitaire ni de tracking tiers.</p>
          </Section>
          <Section title="Litiges">
            <p>Tout litige relatif à l'utilisation du site est soumis au droit ivoirien. Tribunal compétent : Tribunal de Première Instance d'Abidjan.</p>
          </Section>
          <p className="text-[11px] text-n-500 pt-6 border-t border-n-200">Mentions mises à jour le {new Date().toLocaleDateString('fr-FR')} · ADC v1.0</p>
        </article>

        <div className="mt-10 flex items-center gap-3 flex-wrap text-sm">
          <Link to="/cgv" className="px-3 h-9 bg-white border border-n-200 hover:border-orange rounded-sm inline-flex items-center">Conditions générales</Link>
          <Link to="/confidentialite" className="px-3 h-9 bg-white border border-n-200 hover:border-orange rounded-sm inline-flex items-center">Politique de confidentialité</Link>
          <Link to="/a-propos" className="px-3 h-9 bg-white border border-n-200 hover:border-orange rounded-sm inline-flex items-center">À propos d'ADC</Link>
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
