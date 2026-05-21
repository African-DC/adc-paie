import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Calculator, FileText, FileCheck2, Wallet, ShieldCheck, Building2, Check } from 'lucide-react'
import { MarketingFooter } from '../components/marketing-footer'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-n-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-xl font-semibold tracking-tight">ADC <span className="em-serif">Paie</span></Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-n-700">
            <a href="#features" className="hover:text-orange transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-orange transition-colors">Tarifs</a>
            <Link to="/calculatrice" className="hover:text-orange transition-colors">Calculatrice</Link>
            <Link to="/aide" className="hover:text-orange transition-colors">Aide & barèmes</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/app" className="inline-flex items-center gap-2 bg-ink text-white px-4 h-9 text-[13px] font-semibold uppercase tracking-wider hover:bg-orange transition-colors">
              Démo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <section className="dot-pattern relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-3 text-[11px] tracking-[0.28em] uppercase text-n-700 font-semibold mb-6">
                <span className="w-8 h-px bg-orange" />Produit ADC · SaaS Conformité
              </div>
              <h1 className="font-serif text-[clamp(2.75rem,6.5vw,5.5rem)] font-semibold leading-[0.95] tracking-tight">
                Une paie<br /><span className="em-serif">en règle.</span><br />Sans cabinet.
              </h1>
              <p className="mt-8 max-w-xl text-lg text-n-700 leading-relaxed">
                Calcul automatique CNPS, ITS, IGR et CN selon les barèmes 2026. Bulletins conformes au Code du travail ivoirien. Exports prêts pour e-CNPS et e-impots.gouv.ci.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link to="/app" className="inline-flex items-center justify-between gap-3 bg-ink text-white px-6 h-12 text-sm font-semibold uppercase tracking-wider hover:bg-orange transition-colors">
                  Tester la démo <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#pricing" className="inline-flex items-center justify-between gap-3 border border-ink text-ink px-6 h-12 text-sm font-semibold uppercase tracking-wider hover:bg-ink hover:text-white transition-colors">
                  Voir les tarifs <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="lg:col-span-4">
              <p className="font-serif italic text-xl text-n-700 leading-relaxed border-l-2 border-orange pl-5 max-w-sm">
                « Bulletins, déclarations, paiements. Tout en quinze minutes par mois, plus jamais trois jours. »
              </p>
              <p className="mt-4 text-[10px] tracking-[0.28em] uppercase text-n-500 pl-5">— Pilote interne · novembre 2026</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ink-glow text-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 relative z-10">
          <p className="text-[10px] tracking-[0.28em] uppercase text-orange font-semibold mb-8 inline-flex items-center gap-3">
            <span className="w-8 h-px bg-orange" />Le constat
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {[
              { num: '56', unit: 'mille', label: 'PME formelles ivoiriennes ciblées' },
              { num: '30', unit: '%', label: 'PME font des erreurs ITS qui coûtent en redressements' },
              { num: '3', unit: 'jours', label: 'Économisés chaque mois par PME de trente salariés' },
              { num: '15', unit: 'min', label: 'Pour clôturer une paie complète avec ADC' },
            ].map((k) => (
              <div key={k.label} className="border-l border-orange/40 pl-5">
                <div className="flex items-baseline gap-2 text-white">
                  <span className="font-serif font-semibold text-5xl lg:text-6xl leading-none tracking-tight">{k.num}</span>
                  <span className="text-orange text-base font-medium">{k.unit}</span>
                </div>
                <p className="mt-3 text-[11px] tracking-wider uppercase text-n-300 leading-snug max-w-[180px]">{k.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="dot-pattern">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
          <div className="mb-16 max-w-3xl">
            <p className="text-[11px] tracking-[0.28em] uppercase text-n-700 font-semibold mb-5 inline-flex items-center gap-3">
              <span className="w-8 h-px bg-orange" /> Fonctionnalités
            </p>
            <h2 className="font-serif text-4xl lg:text-5xl font-semibold leading-tight tracking-tight">
              Six modules. <span className="em-serif">Zéro</span> manipulation Excel.
            </h2>
            <p className="mt-6 text-lg text-n-700 leading-relaxed">
              Chaque module répond à une obligation légale ivoirienne précise. Aucun gadget décoratif.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Calculator, title: 'Moteur de calcul', desc: 'CNPS 6,3 % salarié et 16 à 18 % patronal. ITS quotient familial, IGR, CN. Barèmes 2026.' },
              { icon: FileText, title: 'Bulletins PDF', desc: 'Conformes art. 32.5 du Code du travail. Mentions légales complètes, archivage signé.' },
              { icon: FileCheck2, title: 'Exports légaux', desc: 'Bordereau CNPS et État 301 DGI au format attendu par e-CNPS et e-impots.gouv.ci.' },
              { icon: Wallet, title: 'Wave Business', desc: 'Paiement des salaires en lot via Wave, virement ou Orange Money. Réconciliation auto.' },
              { icon: ShieldCheck, title: 'Conformité ARTCI', desc: 'Audit trail signé, MFA obligatoire, chiffrement TLS 1.3 et AES-256. Loi 2013-450 respectée.' },
              { icon: Building2, title: 'Multi-établissements', desc: 'Une PME, plusieurs sites. Rôles fins : DRH, comptable, dirigeant, self-service.' },
            ].map((f, i) => (
              <div key={f.title} className="bg-n-50 border-t-2 border-orange p-6 rounded-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-serif italic text-orange text-2xl font-medium">0{i + 1}</span>
                  <f.icon className="w-5 h-5 text-orange" />
                </div>
                <h3 className="font-semibold text-lg mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-n-700 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tools" className="bg-n-50 border-y border-n-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-3 text-[11px] tracking-[0.28em] uppercase text-n-700 font-semibold mb-6">
                <span className="w-8 h-px bg-orange" />Outils gratuits
              </div>
              <h2 className="font-serif text-4xl lg:text-5xl font-semibold leading-tight tracking-tight">
                Essayez les <span className="em-serif">barèmes 2026</span><br />sans créer de compte.
              </h2>
              <p className="mt-6 text-lg text-n-700 leading-relaxed max-w-xl">
                Calculez un net depuis un brut, l'inverse pour une embauche, ou consultez les barèmes ITS, CNPS, IGR et CN à jour. Tout en accès libre, sans inscription.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/calculatrice" className="inline-flex items-center justify-between gap-3 bg-orange text-white px-6 h-12 text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors">
                  Calculatrice brut↔net <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/aide" className="inline-flex items-center justify-between gap-3 border border-ink text-ink px-6 h-12 text-sm font-semibold uppercase tracking-wider hover:bg-ink hover:text-white transition-colors">
                  Aide & barèmes <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="bg-ink text-white rounded-sm p-7 lg:p-8 shadow-2xl relative">
              <div className="absolute -top-3 left-7 bg-orange text-white text-[10px] uppercase tracking-[0.22em] font-semibold px-3 py-1">Aperçu calcul</div>
              <p className="text-[11px] uppercase tracking-wider text-n-400 mt-2">Pour un brut de</p>
              <p className="font-serif text-3xl font-semibold">350 000 XOF</p>
              <p className="text-[11px] uppercase tracking-wider text-n-400 mt-4">Net mensuel à payer</p>
              <p className="font-serif text-5xl font-semibold text-orange leading-none">271 921 XOF</p>
              <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm border-t border-white/15 pt-4">
                <p className="text-n-400">CNPS 6,3 %</p><p className="font-mono text-right">- 22 050</p>
                <p className="text-n-400">ITS progressif</p><p className="font-mono text-right">- 45 529</p>
                <p className="text-n-400">IGR 1,5 %</p><p className="font-mono text-right">- 5 250</p>
                <p className="text-n-400">CN 1,5 %</p><p className="font-mono text-right">- 5 250</p>
              </div>
              <Link to="/calculatrice" className="mt-5 inline-flex items-center gap-1.5 text-orange text-sm font-semibold hover:underline">
                Personnaliser ce calcul <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
          <div className="mb-16 max-w-3xl">
            <p className="text-[11px] tracking-[0.28em] uppercase text-n-700 font-semibold mb-5 inline-flex items-center gap-3">
              <span className="w-8 h-px bg-orange" /> Tarification SaaS
            </p>
            <h2 className="font-serif text-4xl lg:text-5xl font-semibold leading-tight tracking-tight">
              Quatre tiers. Toujours <span className="em-serif">moins cher</span> qu'un cabinet.
            </h2>
            <p className="mt-6 text-lg text-n-700 leading-relaxed">
              La pénalité moyenne CNPS évitée chaque année rembourse six mois d'abonnement Pro.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: 'Starter', price: '49 000', target: 'PME 1 à 10 employés', features: ['Paie + bulletins PDF', '1 utilisateur', 'Exports CNPS et DGI', 'Support e-mail'] },
              { name: 'Pro', price: '149 000', target: 'PME 11 à 30 employés', popular: true, features: ['Tout Starter', 'Congés et absences', '3 utilisateurs', 'Wave Business', 'Support WhatsApp'] },
              { name: 'Business', price: '299 000', target: 'PME 31 à 100 employés', features: ['Tout Pro', 'Multi-établissements', 'API REST', '10 utilisateurs', 'Support prioritaire'] },
              { name: 'Enterprise', price: 'sur devis', target: 'Plus de 100 employés', features: ['Hébergement dédié', 'SLA 99,9 %', 'Intégrations sur mesure', 'Account Manager'] },
            ].map((t) => (
              <div key={t.name} className={`relative p-6 rounded-sm flex flex-col ${t.popular ? 'border-2 border-orange bg-orange-tint' : 'border border-n-200 bg-n-50'}`}>
                {t.popular && <span className="absolute -top-3 left-6 bg-orange text-white text-[10px] tracking-widest uppercase font-bold px-2.5 py-1">Recommandé</span>}
                <p className="text-[10px] tracking-[0.22em] uppercase font-semibold text-n-600">{t.name}</p>
                <p className="mt-3 font-serif font-semibold text-3xl tracking-tight">
                  {t.price === 'sur devis' ? <span className="text-2xl">Sur devis</span> : <>{t.price} <span className="text-sm text-orange font-medium">XOF / mois</span></>}
                </p>
                <p className="font-serif italic text-sm text-n-600 mt-1">{t.target}</p>
                <ul className="mt-5 space-y-2 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-n-700">
                      <Check className="w-4 h-4 text-orange mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/app" className={`mt-6 inline-flex items-center justify-between gap-2 px-4 h-10 text-xs font-semibold uppercase tracking-wider transition-colors ${t.popular ? 'bg-orange text-white hover:bg-orange-deep' : 'bg-ink text-white hover:bg-orange'}`}>
                  Démo gratuite <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-12 bg-orange-tint border-l-4 border-orange p-6">
            <p className="text-ink">
              Soit <strong>8 000 à 20 000 XOF par salarié et par mois</strong> selon le tier, contre 20 000 à 50 000 XOF chez un cabinet d'expertise comptable. <span className="em-serif">Le ROI est immédiat dès le premier mois.</span>
            </p>
          </div>
        </div>
      </section>

      <section id="trust" className="ink-glow text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <p className="text-[11px] tracking-[0.28em] uppercase text-orange font-semibold mb-5 inline-flex items-center gap-3">
                <span className="w-8 h-px bg-orange" /> Pourquoi ADC
              </p>
              <h2 className="font-serif text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-white">
                Trois ans en production,<br /><span className="em-serif">trois preuves</span> tangibles.
              </h2>
              <p className="mt-6 text-n-300 leading-relaxed">
                African Digit Consulting est une agence basée à Grand-Bassam, fondée en 2023. Notre produit phare Klassci sert dix écoles supérieures et plus de sept mille étudiants en production continue.
              </p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-3 gap-6">
              {[
                { num: '10', label: 'Écoles en production via Klassci' },
                { num: '50+', label: 'Projets livrés depuis 2023' },
                { num: '10+', label: 'Experts digitaux dans l\'équipe' },
              ].map((k) => (
                <div key={k.label} className="border-t border-orange/40 pt-4">
                  <div className="font-serif text-white text-5xl font-semibold tracking-tight">{k.num}</div>
                  <p className="mt-3 text-[10px] tracking-wider uppercase text-orange font-semibold leading-snug">{k.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-16 max-w-3xl pl-6" style={{borderLeft:'3px solid var(--color-orange)'}}>
            <p className="font-serif italic text-2xl leading-snug text-white">
              « ADC a compris notre métier avant de nous proposer une solution technique. C'est rare, et c'est ce qui fait toute la différence sur la durée. »
            </p>
            <p className="mt-4 text-[10px] tracking-[0.22em] uppercase text-n-400 font-semibold">Direction académique · Client Klassci</p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-24 text-center">
          <h2 className="font-serif text-4xl lg:text-6xl font-semibold leading-tight tracking-tight">
            Prêt à clôturer votre <span className="em-serif">prochaine paie</span><br />en quinze minutes ?
          </h2>
          <p className="mt-6 text-lg text-n-700 max-w-2xl mx-auto">
            Accédez à la démo interactive immédiatement. Aucun engagement, aucune carte bancaire.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/app" className="inline-flex items-center justify-between gap-3 bg-orange text-white px-7 h-12 text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors">
              Tester la démo maintenant <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="mailto:africandigitconsulting@gmail.com?subject=Demande%20beta%20ADC%20Paie" className="inline-flex items-center justify-between gap-3 border border-ink text-ink px-7 h-12 text-sm font-semibold uppercase tracking-wider hover:bg-ink hover:text-white transition-colors">
              Demander un accès beta <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
