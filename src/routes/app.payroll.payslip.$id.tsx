import { createFileRoute, Link, notFound, useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Mail, Printer, Info, BookOpen, EyeOff } from 'lucide-react'
import { EMPLOYEES, TENANT, fcfa, computePayslip } from '../lib/mock'
import { store } from '../lib/store'
import { downloadPayslipPDF } from '../lib/downloads'

export const Route = createFileRoute('/app/payroll/payslip/$id')({
  loader: ({ params }) => {
    const e = EMPLOYEES.find((x) => x.id === params.id)
    if (!e) throw notFound()
    return { e }
  },
  component: PayslipPage,
  notFoundComponent: () => <p className="p-6">Bulletin introuvable.</p>,
  validateSearch: (s: Record<string, unknown>) => ({ from: s.from as string | undefined }),
})

function PayslipPage() {
  const { e } = Route.useLoaderData()
  const navigate = useNavigate()
  const loc = useLocation()
  const fromMe = ((loc as any).searchStr || (typeof window !== 'undefined' ? window.location.search : '') || '').includes('from=me')
  const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')
  const [explainAll, setExplainAll] = useState(false)
  const parts = 1 + (e.family.situation === 'marié(e)' ? 0.5 : 0) + e.family.kids * 0.5

  const active = EMPLOYEES.filter((x) => x.status === 'active')
  const idx = active.findIndex((x) => x.id === e.id)
  const prev = !fromMe && idx > 0 ? active[idx - 1] : null
  const next = !fromMe && idx >= 0 && idx < active.length - 1 ? active[idx + 1] : null

  useEffect(() => {
    if (fromMe) return
    const h = (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (ev.key === 'ArrowLeft' && prev) navigate({ to: '/app/payroll/payslip/$id', params: { id: prev.id } })
      if (ev.key === 'ArrowRight' && next) navigate({ to: '/app/payroll/payslip/$id', params: { id: next.id } })
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [prev, next, navigate, fromMe])

  const lines = [
    {
      key: 'base',
      label: 'Salaire de base',
      base: '22 j',
      rate: '—',
      due: fcfa(e.brut),
      retain: '',
      isPay: true,
      explainer: `Salaire mensuel brut contractuel de ${e.firstName} ${e.lastName}. Base 22 jours ouvrables × taux journalier ${fcfa(Math.round(e.brut / 22))}.`,
    },
    {
      key: 'brut',
      label: 'Salaire brut',
      base: '',
      rate: '',
      due: fcfa(e.brut),
      retain: '',
      isBold: true,
      explainer: 'Total brut avant retenues sociales et fiscales. Sert d\'assiette à toutes les cotisations CNPS et impôts ITS, IGR, CN.',
    },
    {
      key: 'cnps',
      label: 'CNPS · retraite + famille + AT',
      base: fcfa(e.brut),
      rate: '6,3 %',
      due: '',
      retain: fcfa(Math.round(p.cnps)),
      explainer: 'Caisse Nationale de Prévoyance Sociale. Part salariale 6,3 % du brut, plafond mensuel 3 375 000 FCFA (= 45 × SMIG). Décomposition : retraite 3,2 %, prestations familiales 0,75 %, accident travail 0,75 %, CMU 1,5 %. La quote-part patronale (16,9 %) est à la charge exclusive de l\'employeur.',
    },
    {
      key: 'cmu',
      label: 'CMU · Couverture Maladie Universelle',
      base: '—',
      rate: 'forfait',
      due: '',
      retain: fcfa(p.cmuSal),
      explainer: 'Couverture Maladie Universelle (régime obligatoire CI). Forfait 1 000 FCFA/mois partagé : 500 FCFA retenus sur le salaire + 500 FCFA à la charge de l\'employeur. Versé à la CNPS (collecteur pour la CNAM). Donne droit au remboursement de 70 % des actes médicaux (ticket modérateur 30 %).',
    },
    {
      key: 'its',
      label: 'ITS · barème progressif quotient familial',
      base: fcfa(e.brut),
      rate: 'progressif',
      due: '',
      retain: fcfa(Math.round(p.its)),
      explainer: `Impôt sur les Traitements et Salaires. Calculé par parts (quotient familial) : ${parts} part${parts > 1 ? 's' : ''} (1 + ${e.family.situation === 'marié(e)' ? '0,5 conjoint' : 'célibataire'} + ${e.family.kids} × 0,5 enfant). Tranches 2026 : 0-600k = 0 %, 600k-1,2M = 10 %, 1,2M-2M = 20 %, >2M = 25 % (annuel par part).`,
    },
    {
      key: 'igr',
      label: 'IGR · Impôt Général sur le Revenu',
      base: fcfa(e.brut),
      rate: '1,5 %',
      due: '',
      retain: fcfa(Math.round(p.igr)),
      explainer: 'Impôt Général sur le Revenu — taxe complémentaire perçue par la DGI sur l\'ensemble des revenus salariaux. Taux unique 1,5 % du brut, retenu à la source.',
    },
    {
      key: 'cn',
      label: 'CN · Contribution Nationale',
      base: fcfa(e.brut),
      rate: '1,5 %',
      due: '',
      retain: fcfa(Math.round(p.cn)),
      explainer: 'Contribution Nationale au développement économique et social (Loi 2003-308). Taux 1,5 % du brut, prélevé à la source. Reversée mensuellement avec l\'État 301.',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {fromMe ? (
            <Link to="/app/me" search={{ tab: 'payslips' } as any} className="inline-flex items-center gap-1.5 text-sm text-n-600 hover:text-orange">
              <ChevronLeft className="w-3.5 h-3.5" /> Retour à mes bulletins
            </Link>
          ) : (
            <>
              <Link to="/app/payroll" className="inline-flex items-center gap-1.5 text-sm text-n-600 hover:text-orange">
                <ChevronLeft className="w-3.5 h-3.5" /> Retour au cycle
              </Link>
              <div className="inline-flex items-center border border-n-200 rounded-sm overflow-hidden bg-white">
                <button
                  onClick={() => prev && navigate({ to: '/app/payroll/payslip/$id', params: { id: prev.id } })}
                  disabled={!prev}
                  title={prev ? `${prev.firstName} ${prev.lastName} (← flèche gauche)` : 'Premier bulletin du cycle'}
                  className="w-9 h-9 hover:bg-n-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center border-r border-n-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 text-[11px] font-mono text-n-600">{idx + 1} / {active.length}</span>
                <button
                  onClick={() => next && navigate({ to: '/app/payroll/payslip/$id', params: { id: next.id } })}
                  disabled={!next}
                  title={next ? `${next.firstName} ${next.lastName} (→ flèche droite)` : 'Dernier bulletin du cycle'}
                  className="w-9 h-9 hover:bg-n-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center border-l border-n-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => setExplainAll((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 h-9 text-xs font-medium uppercase tracking-wider transition-colors rounded-sm border ${
              explainAll ? 'bg-orange text-white border-orange' : 'bg-white text-ink border-n-300 hover:bg-n-50'
            }`}
            title="Active les explications pédagogiques de chaque ligne"
          >
            {explainAll ? <EyeOff className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
            {explainAll ? 'Masquer expli.' : 'Expliquer'}
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 border border-n-300 px-4 h-9 text-xs font-medium hover:bg-n-50 transition-colors rounded-sm">
            <Printer className="w-3.5 h-3.5" /> Imprimer
          </button>
          {!fromMe && (
            <button onClick={() => store.toast('Bulletin envoyé par e-mail au salarié', 'success')} className="inline-flex items-center gap-2 border border-n-300 px-4 h-9 text-xs font-medium hover:bg-n-50 transition-colors rounded-sm">
              <Mail className="w-3.5 h-3.5" /> Envoyer par e-mail
            </button>
          )}
          <button onClick={() => { downloadPayslipPDF(e); store.toast('Bulletin PDF téléchargé', 'success') }} className="inline-flex items-center gap-2 bg-orange text-white px-4 h-9 text-xs font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm">
            <Download className="w-3.5 h-3.5" /> Télécharger PDF
          </button>
        </div>
      </div>

      {explainAll && (
        <div className="bg-orange-tint border-l-4 border-orange p-4 rounded-sm text-sm text-n-700 max-w-[210mm] mx-auto print:hidden">
          <p className="font-semibold text-ink inline-flex items-center gap-2"><BookOpen className="w-4 h-4 text-orange" /> Mode pédagogique actif</p>
          <p className="mt-1 text-xs">Chaque ligne du bulletin est désormais accompagnée d'une explication détaillée. Survolez aussi individuellement les lignes en mode normal pour faire apparaître l'explication.</p>
        </div>
      )}

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
            <p className="text-[11px] text-n-600">{e.family.situation} · {e.family.kids} enfant{e.family.kids > 1 ? 's' : ''} · {parts} part{parts > 1 ? 's' : ''}</p>
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
            {lines.map((l) => (
              <PayslipLine key={l.key} line={l} explainAll={explainAll} />
            ))}
            <tr className="bg-orange-tint border-t-2 border-orange">
              <td className="px-3 py-3 font-semibold text-ink">NET À PAYER</td>
              <td className="px-3 py-3"></td>
              <td className="px-3 py-3"></td>
              <td className="px-3 py-3"></td>
              <td className="text-right px-3 py-3 font-serif text-xl font-semibold text-orange-deep">{fcfa(Math.round(p.net))}</td>
            </tr>
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

type Line = {
  key: string
  label: string
  base: string
  rate: string
  due: string
  retain: string
  isBold?: boolean
  isPay?: boolean
  explainer: string
}

function PayslipLine({ line, explainAll }: { line: Line; explainAll: boolean }) {
  const [hover, setHover] = useState(false)
  const show = hover || explainAll
  const isSubtotal = line.isBold

  return (
    <>
      <tr
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`border-b border-n-100 transition-colors cursor-help ${show && !isSubtotal ? 'bg-orange-tint/30' : ''} ${isSubtotal ? 'bg-n-50' : ''}`}
      >
        <td className={`px-3 py-2 ${isSubtotal ? 'font-semibold' : 'text-n-700'}`}>
          <span className="inline-flex items-center gap-1.5">
            {line.label}
            {!isSubtotal && <Info className={`w-3 h-3 transition-colors ${show ? 'text-orange' : 'text-n-300'}`} />}
          </span>
        </td>
        <td className={`text-right px-3 py-2 font-mono ${line.base ? '' : 'text-n-300'}`}>{line.base || ''}</td>
        <td className={`text-right px-3 py-2 ${line.rate === 'progressif' ? 'text-n-500' : line.rate ? 'font-mono' : 'text-n-300'}`}>{line.rate || ''}</td>
        <td className={`text-right px-3 py-2 font-mono ${isSubtotal ? 'font-semibold' : ''}`}>{line.due}</td>
        <td className={`text-right px-3 py-2 font-mono ${line.retain ? 'text-orange-deep' : ''}`}>{line.retain || ''}</td>
      </tr>
      {show && !isSubtotal && (
        <tr className="border-b border-n-100 bg-orange-tint/15">
          <td colSpan={5} className="px-3 py-2 text-[11px] text-n-700 italic leading-relaxed">
            <span className="inline-flex items-start gap-1.5">
              <Info className="w-3 h-3 text-orange mt-0.5 shrink-0" />
              {line.explainer}
            </span>
          </td>
        </tr>
      )}
    </>
  )
}
