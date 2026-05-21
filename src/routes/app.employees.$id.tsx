import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronLeft, Mail, Phone, MapPin, Calendar, FileText, Download, LogOut } from 'lucide-react'
import { EMPLOYEES, fcfa, computePayslip } from '../lib/mock'
import { store } from '../lib/store'
import { downloadPayslipPDF, downloadEmployeeDocument } from '../lib/downloads'
import { STCModal } from '../components/stc-modal'

export const Route = createFileRoute('/app/employees/$id')({
  loader: ({ params }) => {
    const e = EMPLOYEES.find((x) => x.id === params.id)
    if (!e) throw notFound()
    return { e }
  },
  component: EmployeeDetail,
  notFoundComponent: () => <p className="p-6">Salarié introuvable.</p>,
})

function EmployeeDetail() {
  const { e } = Route.useLoaderData()
  const [tab, setTab] = useState<'identity' | 'contract' | 'history' | 'docs'>('identity')
  const [stcOpen, setStcOpen] = useState(false)
  const p = computePayslip(e.brut, e.family.kids, e.family.situation === 'marié(e)')

  return (
    <div className="space-y-6">
      <Link to="/app/employees" className="inline-flex items-center gap-1.5 text-sm text-n-600 hover:text-orange">
        <ChevronLeft className="w-3.5 h-3.5" /> Retour à la liste
      </Link>

      <div className="bg-white border border-n-200 rounded-sm p-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="w-20 h-20 bg-orange text-white font-serif font-semibold text-2xl rounded-full flex items-center justify-center shrink-0">
            {e.firstName[0]}{e.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold">Fiche salarié · {e.matricule}</p>
            <h1 className="font-serif text-3xl font-semibold tracking-tight mt-1">{e.firstName} {e.lastName}</h1>
            <p className="font-serif italic text-orange text-lg mt-1">{e.role}</p>
            <div className="mt-3 flex items-center gap-4 flex-wrap text-sm text-n-600">
              <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm ${e.contract === 'CDI' ? 'bg-ink-2 text-white' : 'bg-orange-tint text-orange-deep'}`}>{e.contract}</span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Depuis {e.joinedAt}</span>
              <span className={`inline-flex items-center gap-1.5 ${e.status === 'active' ? 'text-green-700' : 'text-n-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${e.status === 'active' ? 'bg-green-500' : 'bg-n-400'}`} />
                {e.status === 'active' ? 'Actif' : 'En congé'}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => { downloadPayslipPDF(e); store.toast('Bulletin Novembre 2026 téléchargé', 'success') }} className="inline-flex items-center gap-2 bg-orange text-white px-4 h-9 text-xs font-semibold uppercase tracking-wider hover:bg-orange-deep transition-colors rounded-sm">
              <Download className="w-3.5 h-3.5" /> Bulletin du mois
            </button>
            <Link to="/app/payroll/payslip/$id" params={{ id: e.id }} className="inline-flex items-center gap-2 border border-n-300 px-4 h-9 text-xs font-medium hover:bg-n-50 transition-colors rounded-sm">
              <FileText className="w-3.5 h-3.5" /> Voir le bulletin
            </Link>
            <button onClick={() => setStcOpen(true)} className="inline-flex items-center gap-2 border border-red-300 text-red-700 hover:bg-red-50 px-4 h-9 text-xs font-medium transition-colors rounded-sm" title="Calculer le solde de tout compte et générer le certificat de travail">
              <LogOut className="w-3.5 h-3.5" /> Initier sortie / STC
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-n-200 flex gap-1 overflow-x-auto">
        {([
          { v: 'identity', l: 'Identité' },
          { v: 'contract', l: 'Contrat' },
          { v: 'history', l: 'Historique paie' },
          { v: 'docs', l: 'Documents' },
        ] as const).map((t) => (
          <button key={t.v} onClick={() => setTab(t.v)} className={`px-4 h-10 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.v ? 'border-orange text-orange' : 'border-transparent text-n-600 hover:text-ink'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === 'identity' && (
        <div className="bg-white border border-n-200 rounded-sm p-6 grid sm:grid-cols-2 gap-x-8 gap-y-4">
          <Info icon={Mail} label="E-mail" value={`${e.firstName.toLowerCase()}.${e.lastName.toLowerCase()}@example.ci`} />
          <Info icon={Phone} label="Téléphone" value="+225 07 ** ** ** **" />
          <Info icon={MapPin} label="Adresse" value="Cocody, Abidjan" />
          <Info icon={Calendar} label="Date d'embauche" value={e.joinedAt} />
          <Info label="Matricule CNPS" value={e.matricule} mono />
          <Info label="Situation familiale" value={`${e.family.situation} · ${e.family.kids} enfant${e.family.kids > 1 ? 's' : ''}`} />
        </div>
      )}

      {tab === 'contract' && (
        <div className="bg-white border border-n-200 rounded-sm p-6 grid sm:grid-cols-2 gap-x-8 gap-y-4">
          <Info label="Type de contrat" value={e.contract} />
          <Info label="Fonction" value={e.role} />
          <Info label="Date de prise de poste" value={e.joinedAt} />
          <Info label="Période d'essai" value="Validée" />
          <Info label="Salaire brut mensuel" value={fcfa(e.brut)} mono />
          <Info label="Coût total employeur" value={fcfa(Math.round(p.total))} mono />
          <Info label="Convention collective" value="Interprofessionnelle CI" />
          <Info label="Lieu de travail" value="Abidjan, Plateau" />
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-white border border-n-200 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-n-50 border-b border-n-200">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-n-700">Période</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-n-700">Brut</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-n-700">Retenues</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-orange">Net versé</th>
                  <th className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.18em] font-semibold text-n-700">Bulletin</th>
                </tr>
              </thead>
              <tbody>
                {['Novembre 2026','Octobre 2026','Septembre 2026','Août 2026','Juillet 2026','Juin 2026'].map((m, i) => (
                  <tr key={m} className="border-b border-n-100 hover:bg-n-50/50">
                    <td className="px-4 py-3 font-medium">{m}</td>
                    <td className="px-4 py-3 font-mono text-right">{fcfa(e.brut)}</td>
                    <td className="px-4 py-3 font-mono text-right text-n-600">- {fcfa(Math.round(p.cnps + p.its + p.igr + p.cn))}</td>
                    <td className="px-4 py-3 font-mono text-right font-semibold text-orange-deep">{fcfa(Math.round(p.net))}</td>
                    <td className="px-4 py-3 text-right">
                      {i === 0 ? (
                        <Link to="/app/payroll/payslip/$id" params={{ id: e.id }} className="text-xs font-semibold text-orange hover:underline">Voir</Link>
                      ) : (
                        <button onClick={() => { downloadPayslipPDF(e, m); store.toast(`Bulletin ${m} téléchargé`, 'success') }} className="text-xs text-n-600 hover:text-orange">PDF</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <STCModal open={stcOpen} employee={e} onClose={() => setStcOpen(false)} />

      {tab === 'docs' && (
        <div className="bg-white border border-n-200 rounded-sm p-6">
          <div className="grid sm:grid-cols-2 gap-3">
            {([
              ['Contrat de travail signé',   'contrat'],
              ['CNI / Passeport',            'cni'],
              ['Diplôme(s)',                 'diplome'],
              ['Justificatif de domicile',   'justif'],
              ['Attestation CNPS',           'cnps'],
              ['RIB Wave Business',          'rib'],
            ] as const).map(([d, kind]) => (
              <button key={d} onClick={() => { downloadEmployeeDocument(e, kind); store.toast(`${d} téléchargé`, 'success') }} className="flex items-center gap-3 p-3 bg-n-50 hover:bg-orange-tint border border-n-200 rounded-sm text-left transition-colors">
                <FileText className="w-4 h-4 text-orange shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{d}</p>
                  <p className="text-[10px] text-n-500">PDF · ajouté il y a {Math.floor(Math.random() * 12) + 1} mois</p>
                </div>
                <Download className="w-3.5 h-3.5 text-n-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Info({ icon: Icon, label, value, mono }: { icon?: any; label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-1 inline-flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </p>
      <p className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}
