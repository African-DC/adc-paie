import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Calculator, ArrowRight, ArrowLeftRight, Sparkles, ShieldCheck, Mail, BookOpen, UserPlus, FileText, TrendingUp } from 'lucide-react'
import { fcfa, computePayslip } from '../lib/mock'
import { MarketingFooter } from '../components/marketing-footer'
import { MarketingHeader } from '../components/marketing-header'

export const Route = createFileRoute('/calculatrice')({ component: CalculatricePage })

function CalculatricePage() {
  const [mode, setMode] = useState<'brut-net' | 'net-brut'>('brut-net')
  const [brut, setBrut] = useState(350000)
  const [net, setNet] = useState(285000)
  const [married, setMarried] = useState(false)
  const [kids, setKids] = useState(0)
  const [showEmail, setShowEmail] = useState(false)

  const computed = useMemo(() => {
    if (mode === 'brut-net') return computePayslip(brut, kids, married)
    let lo = 50000, hi = 5_000_000
    for (let i = 0; i < 35; i++) {
      const mid = (lo + hi) / 2
      const r = computePayslip(mid, kids, married)
      if (r.net < net) lo = mid; else hi = mid
    }
    return computePayslip(hi, kids, married)
  }, [mode, brut, net, married, kids])

  const display = {
    brut: Math.round(computed.brut),
    net: Math.round(computed.net),
    cnps: Math.round(computed.cnps),
    its: Math.round(computed.its),
    igr: Math.round(computed.igr),
    cn: Math.round(computed.cn),
    patron: Math.round(computed.patron),
    total: Math.round(computed.total),
  }
  const parts = 1 + (married ? 0.5 : 0) + kids * 0.5
  const isBrutToNet = mode === 'brut-net'
  const tauxNet = display.brut > 0 ? Math.round((display.net / display.brut) * 100) : 0
  const majorationBrut = display.net > 0 ? ((display.brut / display.net - 1) * 100).toFixed(1).replace('.', ',') : '0'

  return (
    <div className="min-h-screen bg-n-50 flex flex-col">
      <MarketingHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 lg:px-8 py-10 lg:py-16">
        <div className="text-center mb-10">
          <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Outil gratuit</p>
          <h1 className="font-serif text-4xl lg:text-5xl font-semibold tracking-tight">
            {isBrutToNet ? <>Combien restera-t-il à votre <span className="em-serif">salarié</span> ?</> : <>Combien proposer dans le <span className="em-serif">contrat</span> ?</>}
          </h1>
          <p className="mt-3 text-n-700 max-w-2xl mx-auto">
            {isBrutToNet
              ? 'À partir d\'un salaire brut, calculez le net qui revient au salarié après CNPS, ITS, IGR et CN.'
              : 'À partir d\'un net cible, calculez le brut à inscrire au contrat pour garantir ce montant après retenues.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 bg-white border border-n-200 rounded-sm p-6 lg:p-7">
            <div className="flex items-center bg-n-100 rounded-sm p-1 mb-5">
              <button onClick={() => setMode('brut-net')} className={`flex-1 px-3 h-9 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${isBrutToNet ? 'bg-white shadow-sm text-ink' : 'text-n-600'}`}>Brut → Net</button>
              <button onClick={() => setMode('net-brut')} className={`flex-1 px-3 h-9 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${!isBrutToNet ? 'bg-white shadow-sm text-ink' : 'text-n-600'}`}>Net → Brut</button>
            </div>

            {isBrutToNet ? (
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-1 block">Salaire brut mensuel (XOF)</span>
                <input type="number" value={brut} onChange={(e) => setBrut(parseInt(e.target.value) || 0)} className="w-full h-14 px-4 border-2 border-n-300 rounded-sm text-2xl font-mono font-semibold focus:outline-none focus:border-orange" />
                <input type="range" min="60000" max="3000000" step="10000" value={brut} onChange={(e) => setBrut(parseInt(e.target.value))} className="w-full mt-2 accent-orange" />
                <div className="flex justify-between text-[10px] text-n-500 mt-1"><span>60 000</span><span>3 000 000</span></div>
              </label>
            ) : (
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-1 block">Net souhaité par le salarié (XOF)</span>
                <input type="number" value={net} onChange={(e) => setNet(parseInt(e.target.value) || 0)} className="w-full h-14 px-4 border-2 border-n-300 rounded-sm text-2xl font-mono font-semibold focus:outline-none focus:border-orange" />
                <input type="range" min="40000" max="2500000" step="5000" value={net} onChange={(e) => setNet(parseInt(e.target.value))} className="w-full mt-2 accent-orange" />
                <div className="flex justify-between text-[10px] text-n-500 mt-1"><span>40 000</span><span>2 500 000</span></div>
              </label>
            )}

            <div className="mt-6 space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium">Marié(e)</span>
                <input type="checkbox" checked={married} onChange={(e) => setMarried(e.target.checked)} className="w-5 h-5 accent-orange" />
              </label>
              <label className="block">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Enfants à charge</span>
                  <span className="font-mono text-sm text-orange-deep font-semibold">{kids}</span>
                </div>
                <input type="range" min="0" max="6" value={kids} onChange={(e) => setKids(parseInt(e.target.value))} className="w-full accent-orange" />
              </label>
              <div className="text-xs text-n-600 bg-orange-tint/40 border-l-2 border-orange p-3 rounded-sm">
                <strong>{parts}</strong> part{parts > 1 ? 's' : ''} fiscale{parts > 1 ? 's' : ''} · barème ITS appliqué par part
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="bg-ink text-white rounded-sm p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] tracking-[0.28em] uppercase text-orange font-semibold inline-flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3 h-3" /> {isBrutToNet ? 'Net à payer' : 'Brut à inscrire au contrat'}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-n-400">Barèmes 2026</p>
              </div>

              {isBrutToNet ? (
                <>
                  <p className="text-[11px] uppercase tracking-wider text-n-400">Net mensuel à verser au salarié</p>
                  <p className="font-serif text-5xl lg:text-6xl font-semibold tracking-tight mt-1">{fcfa(display.net)}</p>
                  <p className="text-sm text-n-300 mt-2">
                    À partir d'un brut de <strong className="text-white">{fcfa(display.brut)}</strong> ·{' '}
                    le salarié conserve <strong className="text-orange">{tauxNet} %</strong>
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm border-t border-white/15 pt-5">
                    <p className="text-n-400">CNPS salariale (6,3 %)</p><p className="font-mono text-right">- {fcfa(display.cnps)}</p>
                    <p className="text-n-400">ITS (quotient familial)</p><p className="font-mono text-right">- {fcfa(display.its)}</p>
                    <p className="text-n-400">IGR (1,5 %)</p><p className="font-mono text-right">- {fcfa(display.igr)}</p>
                    <p className="text-n-400">CN (1,5 %)</p><p className="font-mono text-right">- {fcfa(display.cn)}</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[11px] uppercase tracking-wider text-n-400">Brut mensuel à proposer dans le contrat</p>
                  <p className="font-serif text-5xl lg:text-6xl font-semibold tracking-tight mt-1">{fcfa(display.brut)}</p>
                  <p className="text-sm text-n-300 mt-2">
                    Pour garantir un net de <strong className="text-white">{fcfa(display.net)}</strong> ·{' '}
                    majoration de <strong className="text-orange">+{majorationBrut} %</strong> sur le net
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm border-t border-white/15 pt-5">
                    <p className="text-n-400">Net qui revient au salarié</p><p className="font-mono text-right text-white">{fcfa(display.net)}</p>
                    <p className="text-n-400">CNPS salariale retenue</p><p className="font-mono text-right">+ {fcfa(display.cnps)}</p>
                    <p className="text-n-400">ITS retenu</p><p className="font-mono text-right">+ {fcfa(display.its)}</p>
                    <p className="text-n-400">IGR + CN retenus</p><p className="font-mono text-right">+ {fcfa(display.igr + display.cn)}</p>
                    <p className="text-orange font-semibold border-t border-white/15 pt-2 mt-1">Brut résultant</p>
                    <p className="font-mono text-right font-semibold text-orange border-t border-white/15 pt-2 mt-1">{fcfa(display.brut)}</p>
                  </div>
                </>
              )}
            </div>

            {isBrutToNet ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white border border-n-200 rounded-sm p-5">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold">Charges patronales</p>
                  <p className="font-serif text-2xl font-semibold mt-1">{fcfa(display.patron)}</p>
                  <p className="text-[11px] text-n-500 mt-1">Retraite + AT + Prest. familiales (~17 %)</p>
                </div>
                <div className="bg-orange-tint border border-orange/30 rounded-sm p-5">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-orange-deep font-semibold">Coût total employeur</p>
                  <p className="font-serif text-2xl font-semibold mt-1 text-orange-deep">{fcfa(display.total)}</p>
                  <p className="text-[11px] text-n-700 mt-1">Brut + charges patronales</p>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white border border-n-200 rounded-sm p-5">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold inline-flex items-center gap-1.5"><TrendingUp className="w-3 h-3" /> Charges patronales</p>
                  <p className="font-serif text-2xl font-semibold mt-1">+ {fcfa(display.patron)}</p>
                  <p className="text-[11px] text-n-500 mt-1">À ajouter au brut (~17 %)</p>
                </div>
                <div className="bg-orange-tint border-2 border-orange rounded-sm p-5 shadow-sm">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-orange-deep font-semibold">💰 Coût total à prévoir</p>
                  <p className="font-serif text-3xl font-semibold mt-1 text-orange-deep">{fcfa(display.total)}</p>
                  <p className="text-[11px] text-n-700 mt-1">Budget mensuel embauche · brut + charges</p>
                </div>
              </div>
            )}

            {!showEmail ? (
              <button onClick={() => setShowEmail(true)} className="w-full bg-white border-2 border-orange/30 hover:border-orange text-ink rounded-sm p-5 text-left transition-colors group">
                <p className="font-semibold inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-orange" /> Recevez ce calcul en PDF par e-mail</p>
                <p className="text-xs text-n-600 mt-1">
                  {isBrutToNet
                    ? 'Avec le détail complet du bulletin et l\'attestation barème 2026 signée ADC.'
                    : 'Avec la simulation contractuelle complète à présenter à votre futur(e) salarié(e).'}
                </p>
              </button>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setShowEmail(false); alert('Simulation envoyée par e-mail. Vérifiez votre boîte de réception.') }} className="bg-white border border-n-200 rounded-sm p-5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-n-500 font-semibold mb-2 inline-flex items-center gap-1.5"><Mail className="w-3 h-3" /> Recevoir le PDF</p>
                <div className="flex items-center gap-2">
                  <input required type="email" placeholder="votre@email.ci" className="flex-1 h-11 px-3 border border-n-300 rounded-sm text-sm focus:outline-none focus:border-orange" />
                  <button type="submit" className="px-4 h-11 text-xs font-semibold uppercase tracking-wider bg-orange text-white rounded-sm hover:bg-orange-deep inline-flex items-center gap-1.5">
                    Envoyer <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-n-500 mt-2">Aucun spam. Vous pouvez vous désabonner en un clic.</p>
              </form>
            )}
          </div>
        </div>

        {isBrutToNet ? (
          <div className="mt-12 bg-gradient-to-br from-ink to-ink-2 text-white rounded-sm p-8 lg:p-10 flex items-center justify-between gap-6 flex-wrap">
            <div className="max-w-xl">
              <p className="text-[10px] tracking-[0.28em] uppercase text-orange font-semibold mb-2">Aller plus loin</p>
              <h2 className="font-serif text-2xl lg:text-3xl font-semibold">Éditez le bulletin officiel en 3 clics.</h2>
              <p className="mt-2 text-n-300 text-sm">ADC Paie ne se contente pas de calculer : nous éditons le bulletin conforme art. 32.5, déclarons CNPS et DGI, payons via Wave / Orange Money / MTN.</p>
            </div>
            <Link to="/app/payroll/payslip/$id" params={{ id: '1' }} className="bg-orange text-white px-6 h-12 inline-flex items-center text-sm font-semibold uppercase tracking-wider hover:bg-orange-deep rounded-sm gap-2">
              <FileText className="w-4 h-4" /> Voir un bulletin exemple <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-12 bg-gradient-to-br from-orange to-orange-deep text-white rounded-sm p-8 lg:p-10 flex items-center justify-between gap-6 flex-wrap">
            <div className="max-w-xl">
              <p className="text-[10px] tracking-[0.28em] uppercase text-white/80 font-semibold mb-2">Passer à l'action</p>
              <h2 className="font-serif text-2xl lg:text-3xl font-semibold">Embauchez avec ce brut en 5 étapes.</h2>
              <p className="mt-2 text-white/90 text-sm">Contrat CDI/CDD signé électroniquement, déclaration préalable à la CNPS, fiche salarié créée. Brut pré-rempli avec votre simulation.</p>
            </div>
            <Link to="/app" hash="hire" className="bg-white text-orange-deep px-6 h-12 inline-flex items-center text-sm font-semibold uppercase tracking-wider hover:bg-n-50 rounded-sm gap-2">
              <UserPlus className="w-4 h-4" /> Lancer le wizard d'embauche <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <div className="mt-10 grid md:grid-cols-3 gap-4">
          <Info icon={ShieldCheck} title="Calculs conformes 2026" desc="Barèmes CNPS, ITS progressif, IGR et CN à jour de la DGI." />
          <Info icon={BookOpen} title="Quotient familial inclus" desc="L'ITS tient compte de votre situation familiale et nombre d'enfants à charge." />
          <Info icon={Calculator} title="Réversible en 1 clic" desc="Donnez un net cible, la calculatrice déduit le brut à proposer dans le contrat." />
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}

function Info({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="bg-white border border-n-200 rounded-sm p-5">
      <Icon className="w-5 h-5 text-orange mb-2" />
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-n-600 mt-1 leading-relaxed">{desc}</p>
    </div>
  )
}
