import { useState } from 'react'
import { X, ChevronRight, ChevronLeft, Check, FileSignature, User, Briefcase, Phone, Wallet, ShieldCheck, Sparkles } from 'lucide-react'
import { fcfa, computePayslip } from '../lib/mock'
import { store } from '../lib/store'
import { downloadContratPDF } from '../lib/downloads'

type Form = {
  firstName: string; lastName: string; gender: 'F' | 'M' | ''; birthDate: string; nationality: string
  contract: 'CDI' | 'CDD' | 'Stage'; role: string; startDate: string; endDate: string; trialMonths: number
  email: string; phone: string; address: string; emergency: string
  brut: number; bankProvider: 'wave' | 'orange' | 'mtn' | 'bank' | ''; bankRef: string; cnpsMat: string; familySituation: 'célibataire' | 'marié(e)'; kids: number
}

const INITIAL: Form = {
  firstName: '', lastName: '', gender: '', birthDate: '', nationality: 'Ivoirienne',
  contract: 'CDI', role: '', startDate: '', endDate: '', trialMonths: 3,
  email: '', phone: '', address: '', emergency: '',
  brut: 0, bankProvider: '', bankRef: '', cnpsMat: '', familySituation: 'célibataire', kids: 0,
}

const STEPS = [
  { id: 1, title: 'Identité',         icon: User,           sub: 'État civil du salarié' },
  { id: 2, title: 'Contrat',          icon: Briefcase,      sub: 'Type, dates, fonction' },
  { id: 3, title: 'Coordonnées',      icon: Phone,          sub: 'Contact et urgence' },
  { id: 4, title: 'Salaire & CNPS',   icon: Wallet,         sub: 'Rémunération, paiement, matricule' },
  { id: 5, title: 'Signature',        icon: FileSignature,  sub: 'Récap, contrat PDF, signature' },
]

export function HireWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<Form>(INITIAL)
  const [signing, setSigning] = useState(false)
  const [done, setDone] = useState(false)

  if (!open) return null

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))

  const valid = (s: number): boolean => {
    if (s === 1) return !!(form.firstName && form.lastName && form.gender && form.birthDate)
    if (s === 2) return !!(form.role && form.startDate && (form.contract === 'CDI' || form.endDate))
    if (s === 3) return !!(form.email && form.phone && form.address)
    if (s === 4) return form.brut > 0 && !!form.bankProvider && !!form.cnpsMat
    return true
  }

  const finalize = () => {
    setSigning(true)
    setTimeout(() => {
      downloadContratPDF(form)
      setSigning(false)
      setDone(true)
    }, 1800)
  }

  const close = () => {
    setStep(1); setForm(INITIAL); setSigning(false); setDone(false); onClose()
  }

  const preview = form.brut > 0 ? computePayslip(form.brut, form.kids, form.familySituation === 'marié(e)') : null

  return (
    <div className="fixed inset-0 z-[85] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={close}>
      <div className="bg-white w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-n-200 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-semibold tracking-tight inline-flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-orange" /> Embaucher un nouveau salarié
            </h3>
            <p className="text-xs text-n-500 mt-0.5">Wizard conforme Code du travail ivoirien (Loi 2015-532)</p>
          </div>
          <button onClick={close} className="w-8 h-8 hover:bg-n-100 rounded-sm flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        {!done && (
          <div className="px-6 py-4 bg-n-50 border-b border-n-200">
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${step > s.id ? 'bg-green-600 text-white' : step === s.id ? 'bg-orange text-white' : 'bg-n-200 text-n-500'}`}>
                    {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
                  </div>
                  <div className="hidden md:block min-w-0">
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${step === s.id ? 'text-orange-deep' : step > s.id ? 'text-green-700' : 'text-n-500'}`}>{s.title}</p>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-px ${step > s.id ? 'bg-green-600' : 'bg-n-300'}`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {done ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-serif text-2xl font-semibold">Embauche enregistrée</p>
              <p className="text-sm text-n-600 mt-2">
                <strong>{form.firstName} {form.lastName}</strong> a été ajouté(e) à votre effectif.
              </p>
              <div className="mt-6 max-w-md mx-auto bg-orange-tint border border-orange/30 rounded-sm p-4 text-left text-xs space-y-1 text-n-700">
                <p className="font-semibold text-ink inline-flex items-center gap-1.5 mb-1"><Sparkles className="w-3 h-3 text-orange" /> Documents générés automatiquement</p>
                <p>· Contrat {form.contract} signé numériquement (PDF)</p>
                <p>· Déclaration préalable à l'embauche CNPS (DPAE)</p>
                <p>· Fiche salarié dans votre annuaire</p>
                <p>· Identifiants e-mail pro envoyés au salarié</p>
              </div>
              <button onClick={close} className="mt-6 px-5 h-10 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep">Fermer</button>
            </div>
          ) : signing ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-serif text-lg font-semibold">Signature électronique en cours…</p>
              <p className="text-sm text-n-600 mt-2">Génération du contrat PDF, déclaration CNPS, création de la fiche.</p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Prénom *"><input required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} className={inputCls} placeholder="Mariam" /></Field>
                    <Field label="Nom *"><input required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} className={inputCls} placeholder="Diallo" /></Field>
                  </div>
                  <Field label="Genre *">
                    <div className="flex gap-2">
                      {[['F', 'Féminin'], ['M', 'Masculin']].map(([v, l]) => (
                        <button key={v} type="button" onClick={() => set('gender', v as any)} className={`px-4 h-10 text-sm rounded-sm border transition-colors flex-1 ${form.gender === v ? 'border-orange bg-orange-tint text-orange-deep font-semibold' : 'border-n-300 hover:bg-n-50'}`}>{l}</button>
                      ))}
                    </div>
                  </Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Date de naissance *"><input required type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} className={inputCls} /></Field>
                    <Field label="Nationalité"><input value={form.nationality} onChange={(e) => set('nationality', e.target.value)} className={inputCls} /></Field>
                  </div>
                  <div className="p-3 bg-n-50 border border-n-200 rounded-sm text-xs text-n-700 inline-flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange shrink-0 mt-0.5" />
                    <span>Ces informations sont confidentielles, chiffrées AES-256, et stockées en conformité avec la loi 2013-450 sur la protection des données personnelles.</span>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <Field label="Type de contrat *">
                    <div className="grid grid-cols-3 gap-2">
                      {(['CDI', 'CDD', 'Stage'] as const).map((c) => (
                        <button key={c} type="button" onClick={() => set('contract', c)} className={`px-3 py-3 text-sm rounded-sm border-2 transition-colors text-left ${form.contract === c ? 'border-orange bg-orange-tint' : 'border-n-200 hover:border-n-300'}`}>
                          <p className={`font-semibold ${form.contract === c ? 'text-orange-deep' : ''}`}>{c}</p>
                          <p className="text-[10px] text-n-500 mt-0.5">{c === 'CDI' ? 'Indéterminée' : c === 'CDD' ? 'Déterminée' : 'École / formation'}</p>
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Fonction / poste *"><input required value={form.role} onChange={(e) => set('role', e.target.value)} className={inputCls} placeholder="Ex : Comptable senior, Développeur full-stack" /></Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Date de prise de poste *"><input required type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className={inputCls} /></Field>
                    {form.contract !== 'CDI' && <Field label="Date de fin *"><input required type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} className={inputCls} /></Field>}
                  </div>
                  <Field label="Période d'essai (mois)">
                    <input type="number" min="0" max="6" value={form.trialMonths} onChange={(e) => set('trialMonths', parseInt(e.target.value) || 0)} className={inputCls} />
                  </Field>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <Field label="E-mail professionnel *"><input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} placeholder="mariam.diallo@example.ci" /></Field>
                  <Field label="Téléphone *"><input required value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} placeholder="+225 07 ** ** ** **" /></Field>
                  <Field label="Adresse *"><input required value={form.address} onChange={(e) => set('address', e.target.value)} className={inputCls} placeholder="Quartier, ville" /></Field>
                  <Field label="Contact d'urgence (nom + téléphone)"><input value={form.emergency} onChange={(e) => set('emergency', e.target.value)} className={inputCls} placeholder="Ex : Aminata Diallo · +225 05 ** ** ** **" /></Field>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <Field label="Salaire brut mensuel (FCFA) *"><input required type="number" value={form.brut || ''} onChange={(e) => set('brut', parseInt(e.target.value) || 0)} className={inputCls} placeholder="250 000" /></Field>
                  <Field label="Matricule CNPS *"><input required value={form.cnpsMat} onChange={(e) => set('cnpsMat', e.target.value)} className={inputCls + ' font-mono'} placeholder="CI-XXXXXXXX" /></Field>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Situation familiale">
                      <select value={form.familySituation} onChange={(e) => set('familySituation', e.target.value as any)} className={inputCls + ' bg-white'}>
                        <option>célibataire</option>
                        <option>marié(e)</option>
                      </select>
                    </Field>
                    <Field label="Nombre d'enfants à charge">
                      <input type="number" min="0" max="10" value={form.kids} onChange={(e) => set('kids', parseInt(e.target.value) || 0)} className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Mode de versement du salaire *">
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        ['wave', 'Wave', '#1DCBEF'],
                        ['orange', 'Orange Money', '#FF6600'],
                        ['mtn', 'MTN MoMo', '#FFCC00'],
                        ['bank', 'Virement bancaire', '#0a0a0a'],
                      ] as const).map(([v, l, c]) => (
                        <button key={v} type="button" onClick={() => set('bankProvider', v)} className={`px-3 h-10 text-sm rounded-sm border-2 transition-colors text-left inline-flex items-center gap-2 ${form.bankProvider === v ? 'border-orange bg-orange-tint' : 'border-n-200'}`}>
                          <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: c }} />
                          {l}
                        </button>
                      ))}
                    </div>
                  </Field>
                  {form.bankProvider && (
                    <Field label={form.bankProvider === 'bank' ? 'RIB / IBAN' : `Numéro ${form.bankProvider === 'wave' ? 'Wave' : form.bankProvider === 'orange' ? 'Orange Money' : 'MTN MoMo'}`}>
                      <input value={form.bankRef} onChange={(e) => set('bankRef', e.target.value)} className={inputCls + ' font-mono'} placeholder={form.bankProvider === 'bank' ? 'CI93 CI125 ... ' : '+225 07 ** ** ** **'} />
                    </Field>
                  )}
                  {preview && (
                    <div className="bg-n-50 border border-n-200 rounded-sm p-4 text-sm">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-2">Aperçu calcul net</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                        <p className="text-n-600">Brut</p><p className="font-mono text-right">{fcfa(form.brut)}</p>
                        <p className="text-n-600">CNPS 6,3 %</p><p className="font-mono text-right text-orange-deep">- {fcfa(Math.round(preview.cnps))}</p>
                        <p className="text-n-600">ITS (prog.)</p><p className="font-mono text-right text-orange-deep">- {fcfa(Math.round(preview.its))}</p>
                        <p className="text-n-600">IGR + CN (3 %)</p><p className="font-mono text-right text-orange-deep">- {fcfa(Math.round(preview.igr + preview.cn))}</p>
                        <p className="font-semibold border-t border-n-200 pt-1.5 mt-1">Net à payer</p><p className="font-mono text-right font-semibold text-orange-deep border-t border-n-200 pt-1.5 mt-1">{fcfa(Math.round(preview.net))}</p>
                        <p className="text-n-600">Coût total employeur</p><p className="font-mono text-right">{fcfa(Math.round(preview.total))}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div className="bg-ink text-white rounded-sm p-5">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-orange font-semibold mb-2">Récapitulatif</p>
                    <p className="font-serif text-xl font-semibold">{form.firstName} {form.lastName}</p>
                    <p className="text-sm text-n-300 mt-0.5">{form.role} · {form.contract}{form.contract !== 'CDI' ? ` jusqu'au ${form.endDate}` : ''}</p>
                    <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                      <div><p className="text-n-400">Date de prise de poste</p><p>{form.startDate}</p></div>
                      <div><p className="text-n-400">Période d'essai</p><p>{form.trialMonths} mois</p></div>
                      <div><p className="text-n-400">E-mail pro</p><p className="truncate">{form.email}</p></div>
                      <div><p className="text-n-400">Téléphone</p><p>{form.phone}</p></div>
                      <div><p className="text-n-400">Salaire brut</p><p className="font-mono">{fcfa(form.brut)}</p></div>
                      <div><p className="text-n-400">Net estimé</p><p className="font-mono text-orange">{preview ? fcfa(Math.round(preview.net)) : '—'}</p></div>
                      <div><p className="text-n-400">Mode versement</p><p>{form.bankProvider}</p></div>
                      <div><p className="text-n-400">Matricule CNPS</p><p className="font-mono">{form.cnpsMat}</p></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <CheckRow label="Contrat de travail (PDF)" detail={`Modèle ADC ${form.contract} conforme Loi 2015-532 · pré-rempli`} />
                    <CheckRow label="Déclaration préalable d'embauche (DPAE)" detail="Soumise automatiquement à e-CNPS · accusé sous 24 h" />
                    <CheckRow label="Création des accès" detail={`Compte salarié et e-mail ${form.email}`} />
                  </div>
                  <p className="text-[11px] text-n-500">En cliquant sur « Signer électroniquement », vous certifiez l'exactitude des informations. Le contrat sera signé via Acrobat Sign / DocuSign et archivé 5 ans.</p>
                </div>
              )}
            </>
          )}
        </div>

        {!done && !signing && (
          <div className="px-6 py-4 border-t border-n-200 flex items-center justify-between gap-2">
            <button onClick={() => step > 1 ? setStep(step - 1) : close()} className="px-4 h-10 text-sm border border-n-300 rounded-sm hover:bg-n-50 inline-flex items-center gap-1.5">
              {step === 1 ? 'Annuler' : <><ChevronLeft className="w-3.5 h-3.5" /> Précédent</>}
            </button>
            <p className="text-[11px] text-n-500 hidden sm:block">Étape {step}/{STEPS.length} · {STEPS[step - 1].sub}</p>
            {step < 5 ? (
              <button disabled={!valid(step)} onClick={() => setStep(step + 1)} className="px-4 h-10 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5">
                Suivant <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button onClick={finalize} className="px-5 h-10 text-sm font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep inline-flex items-center gap-1.5">
                <FileSignature className="w-3.5 h-3.5" /> Signer électroniquement
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const inputCls = 'w-full h-10 px-3 border border-n-300 rounded-sm text-sm bg-white focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-1 block">{label}</span>
      {children}
    </label>
  )
}

function CheckRow({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-orange-tint/30 border border-orange/20 rounded-sm">
      <div className="w-5 h-5 rounded-full bg-orange text-white flex items-center justify-center shrink-0 mt-0.5">
        <Check className="w-3 h-3" />
      </div>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-n-600 mt-0.5">{detail}</p>
      </div>
    </div>
  )
}

