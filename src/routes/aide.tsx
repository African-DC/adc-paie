import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { BookOpen, Calculator, ArrowRight, ChevronDown, ChevronUp, ShieldCheck, Calendar, ScrollText } from 'lucide-react'
import { MarketingFooter } from '../components/marketing-footer'
import { MarketingHeader } from '../components/marketing-header'

export const Route = createFileRoute('/aide')({ component: AidePage })

const FAQ = [
  {
    q: 'Quel est le barème ITS 2026 en Côte d\'Ivoire ?',
    a: `L'ITS (Impôt sur les Traitements et Salaires) est progressif sur quatre tranches annuelles, calculées par part fiscale (quotient familial) :\n\n· 0 à 600 000 FCFA : 0 %\n· 600 001 à 1 200 000 FCFA : 10 %\n· 1 200 001 à 2 000 000 FCFA : 20 %\n· Au-delà de 2 000 000 FCFA : 25 %\n\nLa base imposable est le brut moins la CNPS salariale (6,3 %) moins un abattement de 15 % pour frais professionnels.`,
  },
  {
    q: 'Quels sont les taux CNPS salarié et patronal ?',
    a: `Cotisations salariales (à retenir sur le bulletin) :\n· Retraite : 6,3 % du brut plafonné à 70 000 FCFA/mois (45 fois le SMIG)\n\nCotisations patronales (à la charge de l'employeur) :\n· Retraite : 7,7 %\n· Prestations familiales : 5,75 %\n· Accidents du travail : 2 à 5 % selon le secteur (3,5 % par défaut)\n\nTotal patronal moyen : 16 à 18 % du brut.`,
  },
  {
    q: 'Quand soumettre l\'État 301 et le Bordereau CNPS ?',
    a: `L'État 301 (déclaration salariale DGI) et le Bordereau CNPS sont mensuels, à déposer au plus tard le 15 du mois suivant la période de paie.\n\nExemple : la paie de novembre 2026 doit être déclarée avant le 15 décembre 2026.\n\nADC Paie alerte automatiquement 5 jours avant chaque échéance.`,
  },
  {
    q: 'Quelle est la sanction en cas de retard de cotisation CNPS ou DGI ?',
    a: `CNPS : pénalité de 0,05 % par jour de retard sur les cotisations impayées.\n\nDGI : majoration de 10 % le premier mois de retard, puis 3 % par mois suivant.\n\nUne PME de 30 salariés qui paie en retard de 30 jours peut subir 50 000 à 200 000 FCFA de pénalités évitables. ADC Paie évite ce coût.`,
  },
  {
    q: 'Comment calculer l\'IGR et la CN ?',
    a: `IGR (Impôt Général sur le Revenu) : 1,5 % du brut, retenu à la source.\n\nCN (Contribution Nationale) : 1,5 % du brut, prélevée à la source (Loi 2003-308).\n\nLes deux sont reversées mensuellement avec l'État 301 à la DGI.`,
  },
  {
    q: 'Combien de jours de congés payés par mois ?',
    a: `Selon le Code du travail ivoirien (Loi 2015-532, art. 25) : 2,2 jours ouvrables par mois travaillé, soit 26,4 jours par an.\n\nBonifications d'ancienneté :\n· +1 jour à 5 ans\n· +2 jours à 10 ans\n· +3 jours à 15 ans\n· +5 jours à 20 ans`,
  },
  {
    q: 'Qu\'est-ce que l\'article 32.5 du Code du travail ?',
    a: `L'article 32.5 (Loi 2015-532) régit le bulletin de paie obligatoire. Il doit notamment mentionner :\n\n· L'identité de l'employeur (nom, IFU, CNPS)\n· L'identité du salarié (nom, matricule CNPS)\n· La période de paie\n· Le détail des éléments de rémunération et retenues\n· Le net à payer en chiffres et lettres\n· Les mentions légales obligatoires\n\nConservation obligatoire : 5 ans.`,
  },
  {
    q: 'Combien d\'utilisateurs / d\'écoles utilisent ADC en production ?',
    a: `African Digit Consulting est une agence basée à Grand-Bassam, fondée en 2023. Notre produit phare Klassci sert 10 écoles supérieures et plus de 7 600 étudiants en production continue.\n\nADC Paie est notre déclinaison Paie & RH, pensée pour les PME ivoiriennes. Demandez un accès beta à africandigitconsulting@gmail.com.`,
  },
]

const ECHEANCES_2026 = [
  { mois: 'Janvier',    dgi: '15/01', cnps: '15/01', note: 'DAS annuelle N-1 à déposer avant fin janvier' },
  { mois: 'Février',    dgi: '15/02', cnps: '15/02', note: '' },
  { mois: 'Mars',       dgi: '15/03', cnps: '15/03', note: 'Trimestre 1 : récap optionnel' },
  { mois: 'Avril',      dgi: '15/04', cnps: '15/04', note: '' },
  { mois: 'Mai',        dgi: '15/05', cnps: '15/05', note: '' },
  { mois: 'Juin',       dgi: '15/06', cnps: '15/06', note: 'Trimestre 2 : récap optionnel' },
  { mois: 'Juillet',    dgi: '15/07', cnps: '15/07', note: '' },
  { mois: 'Août',       dgi: '15/08', cnps: '15/08', note: '' },
  { mois: 'Septembre',  dgi: '15/09', cnps: '15/09', note: 'Trimestre 3 : récap optionnel' },
  { mois: 'Octobre',    dgi: '15/10', cnps: '15/10', note: '' },
  { mois: 'Novembre',   dgi: '15/11', cnps: '15/11', note: '' },
  { mois: 'Décembre',   dgi: '15/12', cnps: '15/12', note: 'Préparer la DAS annuelle' },
]

const GLOSSAIRE = [
  ['CNPS', 'Caisse Nationale de Prévoyance Sociale · gère retraite, prestations familiales et accidents du travail'],
  ['ITS', 'Impôt sur les Traitements et Salaires · barème progressif par parts fiscales'],
  ['IGR', 'Impôt Général sur le Revenu · taxe complémentaire 1,5 % du brut'],
  ['CN', 'Contribution Nationale · prélèvement de 1,5 % du brut au profit de l\'État (Loi 2003-308)'],
  ['IFU', 'Identifiant Fiscal Unique · numéro attribué par la DGI à chaque entreprise'],
  ['DPAE', 'Déclaration Préalable À l\'Embauche · à transmettre à la CNPS avant la prise de poste'],
  ['Bordereau CNPS', 'Document mensuel détaillant les cotisations sociales du mois'],
  ['État 301', 'Déclaration mensuelle DGI des salaires versés et impôts retenus'],
  ['DAS', 'Déclaration Annuelle des Salaires · récap fiscal et social en janvier N+1'],
  ['SMIG', 'Salaire Minimum Interprofessionnel Garanti · 75 000 FCFA/mois en Côte d\'Ivoire (2026)'],
]

function AidePage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)
  const [tab, setTab] = useState<'faq' | 'baremes' | 'echeances' | 'glossaire'>('faq')

  return (
    <div className="min-h-screen bg-n-50 flex flex-col">
      <MarketingHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 lg:px-8 py-10 lg:py-14">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Aide & ressources</p>
          <h1 className="font-serif text-4xl lg:text-5xl font-semibold tracking-tight">Le centre <span className="em-serif">paie & RH</span> ivoirien.</h1>
          <p className="mt-3 text-n-700 max-w-2xl mx-auto">Barèmes, échéances, glossaire et FAQ pour comprendre la paie en Côte d'Ivoire. Mis à jour avec les références 2026.</p>
        </div>

        <div className="flex items-center gap-1 border-b border-n-200 mb-6 overflow-x-auto">
          {([
            { v: 'faq', l: 'FAQ', icon: BookOpen },
            { v: 'baremes', l: 'Barèmes 2026', icon: Calculator },
            { v: 'echeances', l: 'Échéances annuelles', icon: Calendar },
            { v: 'glossaire', l: 'Glossaire', icon: ScrollText },
          ] as const).map((t) => (
            <button key={t.v} onClick={() => setTab(t.v)} className={`px-4 h-11 text-sm font-medium border-b-2 -mb-px transition-colors inline-flex items-center gap-2 ${tab === t.v ? 'border-orange text-orange' : 'border-transparent text-n-600 hover:text-ink'}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.l}
            </button>
          ))}
        </div>

        {tab === 'faq' && (
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <div key={i} className="bg-white border border-n-200 rounded-sm overflow-hidden">
                <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-n-50 transition-colors">
                  <p className="font-semibold text-sm pr-4">{f.q}</p>
                  {openIdx === i ? <ChevronUp className="w-4 h-4 text-orange shrink-0" /> : <ChevronDown className="w-4 h-4 text-n-400 shrink-0" />}
                </button>
                {openIdx === i && (
                  <div className="px-5 py-4 border-t border-n-100 bg-orange-tint/20">
                    <p className="text-sm text-n-700 leading-relaxed whitespace-pre-line">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'baremes' && (
          <div className="space-y-6">
            <div className="bg-white border border-n-200 rounded-sm p-6">
              <h2 className="font-serif text-xl font-semibold tracking-tight mb-4">Barème ITS 2026 par part fiscale</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-n-50 border-b border-n-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-n-700">Tranche annuelle (par part)</th>
                      <th className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-n-700">Taux</th>
                      <th className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-n-700">Impôt max par tranche</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[['0 à 600 000', '0 %', '0'], ['600 001 à 1 200 000', '10 %', '60 000'], ['1 200 001 à 2 000 000', '20 %', '160 000'], ['Au-delà de 2 000 000', '25 %', 'illimité']].map((r, i) => (
                      <tr key={i} className="border-b border-n-100 last:border-0"><td className="px-4 py-3">{r[0]}</td><td className="text-right px-4 py-3 font-mono font-semibold text-orange-deep">{r[1]}</td><td className="text-right px-4 py-3 font-mono text-n-600">{r[2]}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white border border-n-200 rounded-sm p-6">
              <h2 className="font-serif text-xl font-semibold tracking-tight mb-4">Cotisations sociales</h2>
              <div className="grid sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-2">À la charge du salarié</p>
                  <p>· CNPS retraite : <strong>6,3 %</strong> du brut</p>
                  <p>· IGR : <strong>1,5 %</strong> du brut</p>
                  <p>· CN : <strong>1,5 %</strong> du brut</p>
                  <p>· ITS : <strong>progressif</strong> par tranches</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-2">À la charge de l'employeur</p>
                  <p>· Retraite : <strong>7,7 %</strong></p>
                  <p>· Prestations familiales : <strong>5,75 %</strong></p>
                  <p>· Accidents du travail : <strong>2 à 5 %</strong> selon secteur</p>
                  <p>· Total moyen : <strong>~17 %</strong> du brut</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-tint border-l-4 border-orange p-5 rounded-sm">
              <p className="text-sm font-semibold text-ink inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-orange" /> Sources officielles</p>
              <p className="text-xs text-n-700 mt-2">DGI Côte d'Ivoire (e-impots.gouv.ci) · CNPS Côte d'Ivoire (cnps.ci) · Code du travail Loi 2015-532. Mis à jour au {new Date().toLocaleDateString('fr-FR')}.</p>
            </div>
          </div>
        )}

        {tab === 'echeances' && (
          <div className="bg-white border border-n-200 rounded-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-n-200 bg-n-50">
              <h2 className="font-serif text-lg font-semibold tracking-tight">Calendrier 2026 · CNPS et DGI</h2>
              <p className="text-xs text-n-500 mt-0.5">Toutes les déclarations sont à déposer le 15 du mois suivant la période de paie.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white border-b border-n-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-n-700">Mois de paie</th>
                    <th className="text-center px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-n-700">État 301 DGI</th>
                    <th className="text-center px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-n-700">Bordereau CNPS</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-n-700">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {ECHEANCES_2026.map((e, i) => (
                    <tr key={i} className="border-b border-n-100 last:border-0 hover:bg-n-50/50">
                      <td className="px-4 py-3 font-medium">{e.mois}</td>
                      <td className="text-center px-4 py-3 font-mono">{e.dgi}</td>
                      <td className="text-center px-4 py-3 font-mono">{e.cnps}</td>
                      <td className="px-4 py-3 text-xs text-n-600">{e.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'glossaire' && (
          <div className="bg-white border border-n-200 rounded-sm divide-y divide-n-100">
            {GLOSSAIRE.map(([term, def], i) => (
              <div key={i} className="px-5 py-4 grid sm:grid-cols-4 gap-3">
                <p className="font-serif text-lg font-semibold text-orange-deep sm:col-span-1">{term}</p>
                <p className="text-sm text-n-700 sm:col-span-3 leading-relaxed">{def}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-br from-ink to-ink-2 text-white rounded-sm p-8 flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="text-[10px] tracking-[0.28em] uppercase text-orange font-semibold mb-2">Automatiser tout cela</p>
            <h2 className="font-serif text-2xl font-semibold">Ces calculs faits en un clic avec ADC Paie.</h2>
            <p className="mt-1 text-n-300 text-sm">Bulletins, déclarations, paiements Mobile Money. 15 min par mois au lieu de 3 jours.</p>
          </div>
          <Link to="/app" className="bg-orange text-white px-5 h-11 inline-flex items-center text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep rounded-sm gap-2">
            Tester la démo gratuite <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
