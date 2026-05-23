import { createFileRoute, Link } from '@tanstack/react-router'
import { MarketingFooter } from '../components/marketing-footer'
import { MarketingHeader } from '../components/marketing-header'
import { ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/confidentialite')({ component: ConfidentialitePage })

function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-n-50 flex flex-col">
      <MarketingHeader />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Protection des données</p>
        <h1 className="font-serif text-4xl lg:text-5xl font-semibold tracking-tight">Politique de <span className="em-serif">confidentialité</span></h1>
        <p className="mt-3 text-n-700">Comment ADC Paie collecte, utilise et protège vos données personnelles et celles de vos salariés.</p>

        <div className="mt-8 p-4 bg-orange-tint border-l-4 border-orange rounded-sm flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-orange shrink-0 mt-0.5" />
          <p className="text-sm text-n-700"><strong>Engagement clé.</strong> Nous ne vendons jamais vos données. Nous ne partageons aucune information avec des tiers, sauf obligation légale (CNPS, DGI) ou consentement explicite de votre part.</p>
        </div>

        <article className="mt-10 space-y-6 text-sm text-n-700 leading-relaxed">
          <Section title="Données collectées">
            <p>Nous traitons trois catégories de données :</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Données client</strong> : raison sociale, IFU, CNPS employeur, coordonnées, mode de paiement</li>
              <li><strong>Données salariés</strong> : identité, matricule CNPS, contrat, salaire, coordonnées bancaires/Mobile Money</li>
              <li><strong>Données techniques</strong> : adresse IP, navigateur, logs de connexion (pour la sécurité et l'audit)</li>
            </ul>
          </Section>
          <Section title="Finalités du traitement">
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Édition des bulletins de paie conformément à l'art. 32.5 du Code du travail</li>
              <li>Calcul et déclaration des cotisations CNPS et impôts DGI</li>
              <li>Versement des salaires via les partenaires de paiement</li>
              <li>Conservation légale 5 ans des bulletins archivés (Loi 2015-532)</li>
              <li>Sécurité, audit, prévention de la fraude</li>
            </ul>
          </Section>
          <Section title="Base légale">
            <p>Le traitement repose sur trois bases : (i) <strong>exécution du contrat</strong> SaaS qui vous lie à ADC, (ii) <strong>obligations légales</strong> de l'employeur (CNPS, DGI), (iii) <strong>intérêt légitime</strong> à sécuriser la plateforme.</p>
          </Section>
          <Section title="Hébergement et localisation">
            <p>L'application est servie par <strong>Vercel</strong> (Edge Network global, certifié ISO 27001 et SOC 2 Type II) avec CDN optimisé pour l'Afrique de l'Ouest (PoP de Lagos, Johannesburg).</p>
            <p>Le backend de données et le stockage des bulletins de paie sont opérés par <strong>Convex</strong>, infrastructure hébergée sur Amazon Web Services (AWS) — régions <code className="font-mono text-xs">us-east-1</code> (Virginie) ou <code className="font-mono text-xs">eu-west-1</code> (Irlande) selon le déploiement. Toutes les requêtes sont chiffrées TLS 1.3 en transit et AES-256 au repos. AWS détient les certifications ISO 27001, SOC 2 Type II, PCI DSS, HIPAA.</p>
            <p>L'authentification est gérée par <strong>Better Auth</strong> via le composant officiel Convex (single-store, pas de DB tierce). Les mots de passe sont hachés en argon2id, jamais stockés en clair.</p>
            <p>Le transfert international de vos données est encadré par les <strong>Data Processing Addendums (DPA)</strong> AWS et Vercel signés par African Digit Consulting. Une demande d'autorisation a été déposée auprès de l'ARTCI conformément à la Loi 2013-450.</p>
          </Section>
          <Section title="Sécurité">
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Chiffrement <strong>TLS 1.3</strong> de bout en bout</li>
              <li>Chiffrement <strong>AES-256</strong> au repos sur les disques</li>
              <li>Authentification à deux facteurs (MFA) disponible pour tous les comptes administrateurs</li>
              <li><strong>Audit log immuable hash-chained SHA-256</strong> de toutes les actions sensibles : chaque entrée porte le hash de l'entrée précédente, rendant toute altération détectable (conservation 5 ans conforme Code travail CI Loi 2015-532)</li>
              <li><strong>Multi-tenant strict</strong> : chaque entreprise cliente est isolée logiquement via un identifiant d'organisation (organizationId) vérifié à chaque requête serveur — aucun risque de fuite cross-tenant</li>
              <li>Mots de passe hachés en <strong>argon2id</strong>, jamais stockés en clair</li>
              <li>Tests d'intrusion annuels par cabinet tiers</li>
            </ul>
          </Section>
          <Section title="Durée de conservation">
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Données actives</strong> : pendant toute la durée du contrat</li>
              <li><strong>Bulletins de paie</strong> : 5 ans après émission (obligation légale)</li>
              <li><strong>Audit log</strong> : 5 ans</li>
              <li><strong>Données de prospects</strong> : 3 ans après le dernier contact</li>
            </ul>
          </Section>
          <Section title="Vos droits">
            <p>Conformément à la <strong>Loi n°2013-450</strong>, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Accès</strong> : obtenir copie de vos données</li>
              <li><strong>Rectification</strong> : corriger une information inexacte</li>
              <li><strong>Suppression</strong> : effacer vos données (sous réserve des obligations légales de conservation)</li>
              <li><strong>Portabilité</strong> : récupérer vos données dans un format structuré (export ZIP RGPD-compatible disponible dans Réglages)</li>
              <li><strong>Opposition</strong> : refuser le traitement à des fins de prospection</li>
            </ul>
            <p>Pour exercer ces droits, contactez notre DPO : <a href="mailto:africandigitconsulting@gmail.com" className="text-orange hover:underline">africandigitconsulting@gmail.com</a>. Nous répondons sous 30 jours.</p>
          </Section>
          <Section title="Cookies">
            <p>Le site adc-paie.vercel.app n'utilise que des cookies strictement nécessaires : session de connexion, préférences d'interface (mode salarié, onboarding). Aucun cookie publicitaire, aucun tracker tiers (Google Analytics, Facebook Pixel, etc.).</p>
          </Section>
          <Section title="Contact">
            <p>Délégué à la Protection des Données (DPO) : Marcel Djedje-li</p>
            <p>E-mail : <a href="mailto:africandigitconsulting@gmail.com" className="text-orange hover:underline">africandigitconsulting@gmail.com</a></p>
            <p>Autorité de contrôle : Autorité de Régulation des Télécommunications de Côte d'Ivoire (ARTCI)</p>
          </Section>
          <p className="text-[11px] text-n-500 pt-6 border-t border-n-200">Politique en vigueur depuis le {new Date().toLocaleDateString('fr-FR')} · Version 1.0</p>
        </article>

        <div className="mt-10 flex items-center gap-3 flex-wrap text-sm">
          <Link to="/mentions-legales" className="px-3 h-9 bg-white border border-n-200 hover:border-orange rounded-sm inline-flex items-center">Mentions légales</Link>
          <Link to="/cgv" className="px-3 h-9 bg-white border border-n-200 hover:border-orange rounded-sm inline-flex items-center">Conditions générales</Link>
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
