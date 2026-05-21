import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ChevronLeft, Download, Mail, Printer } from 'lucide-react'
import { EMPLOYEES, TENANT, fcfa, computePayslip } from '../lib/mock'
import { store } from '../lib/store'

export const Route = createFileRoute('/app/payroll/payslip/$id')({
  loader: ({ params }) => {
    const e = EMPLOYEES.find((x) => x.id === params.id)
    if (!e) throw notFound()
    return { e }
  },
  component: PayslipPage,
  notFoundComponent: () => <p className="p-6">Bulletin introuvable.</p>,
})

function PayslipPage() {
  const { e } = Route.useLoaderData()
  const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link to="/app/payroll" className="inline-flex items-center gap-1.5 text-sm text-n-600 hover:text-orange">
          <ChevronLeft className="w-3.5 h-3.5" /> Retour au cycle de paie
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 border border-n-300 px-4 h-9 text-xs font-medium hover:bg-n-50 transition-colors rounded-sm">
            <Printer className="w-3.5 h-3.5" /> Imprimer
          </button>
          <button onClick={() => store.toast('Bulletin envoyé par e-mail au salarié', 'success')} className="inline-flex items-center gap-2 border border-n-300 px-4 h-9 text-xs font-medium hover:bg-n-50 transition-colors rounded-sm">
            <Mail className="w-3.5 h-3.5" /> Envoyer par e-mail
          </button>
          <button onClick={() => store.toast('Bulletin PDF téléchargé', 'success')} className="inline-flex items-center gap-2 bg-orange text-white px-4 h-9 text-xs font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm">
            <Download className="w-3.5 h-3.5" /> Télécharger PDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-n-200 max-w-[210mm] mx-auto p-10 shadow-sm" style={{ minHeight: '297mm' }}>
        <div className="flex items-start justify-between border-b-2 border-ink pb-4 mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-n-500 font-semibold">Bulletin de paie</p>
            <h1 className="font-serif text-2xl font-semibold tracking-tight mt-1">Période · Novembre 2026</h1>
            <p className="text-xs text-n-600 mt-1">Du 1<sup>er</sup> au 30 novembre · paiement le 5 décembre</p>
          </div>
          <div className="text-right">
            <p className="font-serif text-xl font-semibold">ADC Paie</p>
            <p className="text-[10px] uppercase tracking-wider text-n-500 mt-0.5">Édité par African Digit Consulting</p>
            <p className="font-mono text-[10px] text-n-600 mt-2">N° BUL-2026-11-{e.id.padStart(4, '0')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div className="border border-n-200 p-4 rounded-sm">
            <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-2">Employeur</p>
            <p className="font-semibold">{TENANT.name}</p>
            <p className="text-xs text-n-600 mt-1">{TENANT.city}</p>
            <p className="font-mono text-[11px] text-n-600 mt-2">IFU · {TENANT.ifu}</p>
            <p className="font-mono text-[11px] text-n-600">CNPS · {TENANT.cnps}</p>
          </div>
          <div className="border border-n-200 p-4 rounded-sm">
            <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-2">Salarié</p>
            <p className="font-semibold">{e.firstName} {e.lastName}</p>
            <p className="text-xs text-n-600 mt-1">{e.role} · {e.contract}</p>
            <p className="font-mono text-[11px] text-n-600 mt-2">Mat. CNPS · {e.matricule}</p>
            <p className="text-[11px] text-n-600">{e.family.situation} · {e.family.kids} enfant{e.family.kids > 1 ? 's' : ''}</p>
          </div>
        </div>

        <table className="w-full text-sm border-t-2 border-b-2 border-ink">
          <thead className="bg-n-50 border-b border-n-200">
            <tr>
              <th className="text-left px-3 py-2 text-[10px] uppercase tracking-[0.18em] font-semibold">Désignation</th>
              <th className="text-right px-3 py-2 text-[10px] uppercase tracking-[0.18em] font-semibold">Base</th>
              <th className="text-right px-3 py-2 text-[10px] uppercase tracking-[0.18em] font-semibold">Taux</th>
              <th className="text-right px-3 py-2 text-[10px] uppercase tracking-[0.18em] font-semibold">À payer</th>
              <th className="text-right px-3 py-2 text-[10px] uppercase tracking-[0.18em] font-semibold">À retenir</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-n-100"><td className="px-3 py-2 font-medium">Salaire de base</td><td className="text-right px-3 py-2 font-mono">22 j</td><td className="text-right px-3 py-2 text-n-500">—</td><td className="text-right px-3 py-2 font-mono">{fcfa(e.brut)}</td><td className="px-3 py-2"></td></tr>
            <tr className="bg-n-50 border-b border-n-100"><td className="px-3 py-2 font-semibold">Salaire brut</td><td className="px-3 py-2"></td><td className="px-3 py-2"></td><td className="text-right px-3 py-2 font-mono font-semibold">{fcfa(e.brut)}</td><td className="px-3 py-2"></td></tr>
            <tr className="border-b border-n-100"><td className="px-3 py-2 text-n-700">CNPS · retraite + CMU + famille + AT</td><td className="text-right px-3 py-2 font-mono">{fcfa(e.brut)}</td><td className="text-right px-3 py-2 font-mono">6,3 %</td><td className="px-3 py-2"></td><td className="text-right px-3 py-2 font-mono text-orange-deep">{fcfa(Math.round(p.cnps))}</td></tr>
            <tr className="border-b border-n-100"><td className="px-3 py-2 text-n-700">ITS · barème progressif quotient familial</td><td className="text-right px-3 py-2 font-mono">{fcfa(e.brut)}</td><td className="text-right px-3 py-2 text-n-500">progressif</td><td className="px-3 py-2"></td><td className="text-right px-3 py-2 font-mono text-orange-deep">{fcfa(Math.round(p.its))}</td></tr>
            <tr className="border-b border-n-100"><td className="px-3 py-2 text-n-700">IGR · Impôt Général sur le Revenu</td><td className="text-right px-3 py-2 font-mono">{fcfa(e.brut)}</td><td className="text-right px-3 py-2 font-mono">1,5 %</td><td className="px-3 py-2"></td><td className="text-right px-3 py-2 font-mono text-orange-deep">{fcfa(Math.round(p.igr))}</td></tr>
            <tr className="border-b border-n-100"><td className="px-3 py-2 text-n-700">CN · Contribution Nationale</td><td className="text-right px-3 py-2 font-mono">{fcfa(e.brut)}</td><td className="text-right px-3 py-2 font-mono">1,5 %</td><td className="px-3 py-2"></td><td className="text-right px-3 py-2 font-mono text-orange-deep">{fcfa(Math.round(p.cn))}</td></tr>
            <tr className="bg-orange-tint border-t-2 border-orange"><td className="px-3 py-3 font-semibold text-ink">NET À PAYER</td><td className="px-3 py-3"></td><td className="px-3 py-3"></td><td className="px-3 py-3"></td><td className="text-right px-3 py-3 font-serif text-xl font-semibold text-orange-deep">{fcfa(Math.round(p.net))}</td></tr>
          </tbody>
        </table>

        <div className="mt-6 grid grid-cols-2 gap-6 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-2">Charges patronales</p>
            <div className="space-y-1.5 text-n-700">
              <div className="flex justify-between"><span>Retraite (7,7 %)</span><span className="font-mono">{fcfa(Math.round(e.brut * 0.077))}</span></div>
              <div className="flex justify-between"><span>Prestations familiales (5,75 %)</span><span className="font-mono">{fcfa(Math.round(e.brut * 0.0575))}</span></div>
              <div className="flex justify-between"><span>Accidents du travail (3,5 %)</span><span className="font-mono">{fcfa(Math.round(e.brut * 0.035))}</span></div>
              <div className="flex justify-between font-semibold border-t border-n-200 pt-1.5 mt-1.5"><span>Total patronal</span><span className="font-mono">{fcfa(Math.round(p.patron))}</span></div>
              <div className="flex justify-between font-semibold text-ink"><span>Coût total employeur</span><span className="font-mono">{fcfa(Math.round(p.total))}</span></div>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-2">Mentions légales</p>
            <p className="text-n-600 leading-relaxed">Bulletin émis conformément à l'article 32.5 du Code du travail ivoirien (Loi 2015-532). Conservation obligatoire 5 ans. En cas de litige, ce document fait foi de la rémunération versée.</p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-n-200 grid grid-cols-3 gap-6 text-[10px] uppercase tracking-wider text-n-500">
          <div>Édité le 30/11/2026 par {TENANT.name}</div>
          <div className="text-center">ADC Paie · africandigitconsulting.com</div>
          <div className="text-right">Signé numériquement · v1.0</div>
        </div>
      </div>
    </div>
  )
}
