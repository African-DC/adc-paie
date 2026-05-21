import { useEffect, useRef, useState } from 'react'
import { Sparkles, X, Send, MessageSquare } from 'lucide-react'
import { useStore, store } from '../lib/store'

type Msg = { id: string; from: 'me' | 'adca'; text: string; streaming?: boolean }

const SUGGESTIONS = [
  'Calcule le net d\'un brut de 350 000 FCFA marié 2 enfants',
  'Quel est le barème ITS 2026 ?',
  'Génère le bordereau CNPS de novembre',
  'Quels sont mes prochaines échéances ?',
  'Combien me coûte un salarié à 500 000 FCFA brut ?',
]

function aiReply(q: string): string {
  const lower = q.toLowerCase()
  if (lower.includes('its') || lower.includes('barème')) {
    return `Le barème ITS 2026 est progressif sur quatre tranches annuelles :\n\n· 0 à 600 000 FCFA : 0 %\n· 600 001 à 1 200 000 FCFA : 10 %\n· 1 200 001 à 2 000 000 FCFA : 20 %\n· au-delà de 2 000 000 FCFA : 25 %\n\nLa base imposable est le brut moins la CNPS salariale (6,3 %) et l'abattement de frais professionnels (15 %), divisée par le quotient familial.`
  }
  if (lower.includes('net') && (lower.includes('brut') || lower.includes('xof'))) {
    const m = q.match(/(\d{2,3}[\s.]?\d{3})/)
    if (m) {
      const brut = parseInt(m[1].replace(/[\s.]/g, ''), 10)
      const cnps = brut * 0.063
      const its = brut * 0.075
      const igr = brut * 0.015
      const cn = brut * 0.015
      const net = brut - cnps - its - igr - cn
      const patron = brut * 0.17
      return `Pour un brut de ${brut.toLocaleString('fr-FR')} FCFA, marié avec deux enfants à charge :\n\n· Net à payer : environ ${Math.round(net).toLocaleString('fr-FR')} FCFA\n· CNPS salariale : ${Math.round(cnps).toLocaleString('fr-FR')} FCFA\n· ITS estimé : ${Math.round(its).toLocaleString('fr-FR')} FCFA\n· IGR : ${Math.round(igr).toLocaleString('fr-FR')} FCFA\n· CN : ${Math.round(cn).toLocaleString('fr-FR')} FCFA\n\nCoût total employeur : ${Math.round(brut + patron).toLocaleString('fr-FR')} FCFA (charges patronales 17 %).`
    }
  }
  if (lower.includes('cnps') && (lower.includes('bordereau') || lower.includes('génère'))) {
    return `Le bordereau CNPS de novembre 2026 est généré. Voici la synthèse :\n\n· 14 salariés affiliés\n· Cotisations salariales : 387 240 FCFA\n· Cotisations patronales : 1 044 360 FCFA\n· Total à verser : 1 431 600 FCFA\n· Échéance : 15 décembre 2026\n\nVous pouvez le télécharger au format Excel depuis l'écran Déclarations ou le soumettre directement à e-CNPS via l'intégration.`
  }
  if (lower.includes('échéance') || lower.includes('prochain')) {
    return `Vos trois prochaines échéances légales :\n\n1. 15 décembre 2026 · Bordereau CNPS novembre (1 857 200 FCFA)\n2. 15 décembre 2026 · État 301 DGI novembre (1 248 500 FCFA)\n3. 31 janvier 2027 · DAS annuelle CNPS et DGI\n\nADC Paie déclenche une alerte cinq jours avant chaque date limite.`
  }
  if (lower.includes('coûte') || lower.includes('coute') || lower.includes('coût total')) {
    return `Un salarié à 500 000 FCFA brut vous coûte au total environ 585 000 FCFA par mois :\n\n· Salaire brut : 500 000 FCFA\n· Charges patronales (retraite, famille, AT) : ~85 000 FCFA\n\nDont ce qui reste au salarié : ~412 500 FCFA net après CNPS, ITS, IGR et CN. Soit environ 82,5 % du brut.`
  }
  if (lower.includes('congé')) {
    return `Au regard de la Loi 2015-532, un salarié acquiert 2,2 jours ouvrables de congé par mois travaillé, soit 26,4 jours par an. Bonifications ancienneté : +1 jour à 5 ans, +2 à 10 ans, +3 à 15 ans, +5 à 20 ans. Les congés se posent dans le module Salariés depuis la fiche individuelle.`
  }
  if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('hello')) {
    return 'Bonjour. Je suis ADCA, votre assistante paie. Je peux vous aider à calculer un salaire, vérifier la conformité d\'une déclaration, ou répondre sur le Code du travail ivoirien. Que voulez-vous faire ?'
  }
  return `Je traite votre question. Je peux vous aider sur les barèmes CNPS, DGI, le Code du travail ivoirien, les déclarations légales et la génération de bulletins. Reformulez ou choisissez une des suggestions proposées.`
}

export function ADCAChat() {
  const open = useStore((s) => s.chatOpen)
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 'm0', from: 'adca', text: 'Bonjour Marcel. Je suis ADCA, votre assistante paie IA. Posez-moi une question sur la paie ivoirienne, ou utilisez une suggestion ci-dessous.' },
  ])
  const [draft, setDraft] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [msgs, open])

  if (!open) return null

  const send = (text: string) => {
    if (!text.trim()) return
    const userMsg: Msg = { id: String(Date.now()), from: 'me', text }
    setMsgs((m) => [...m, userMsg])
    setDraft('')
    // Streaming simulation
    const fullReply = aiReply(text)
    const replyId = String(Date.now() + 1)
    setMsgs((m) => [...m, { id: replyId, from: 'adca', text: '', streaming: true }])
    let i = 0
    const step = () => {
      i += Math.max(1, Math.floor(fullReply.length / 40))
      const chunk = fullReply.slice(0, i)
      setMsgs((m) => m.map((msg) => msg.id === replyId ? { ...msg, text: chunk } : msg))
      if (i < fullReply.length) {
        setTimeout(step, 30)
      } else {
        setMsgs((m) => m.map((msg) => msg.id === replyId ? { ...msg, streaming: false } : msg))
      }
    }
    setTimeout(step, 200)
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/20 lg:hidden" onClick={() => store.closeChat()} />
      <div className="fixed bottom-0 right-0 lg:bottom-6 lg:right-6 w-full lg:w-[400px] h-[calc(100dvh-3rem)] lg:h-[600px] bg-white border border-n-200 z-50 shadow-2xl flex flex-col rounded-sm">
        <div className="px-4 py-3 border-b border-n-200 flex items-center justify-between bg-ink-2 text-white rounded-t-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm tracking-tight">ADCA</p>
              <p className="text-[10px] text-n-300 leading-none">Assistant paie · en ligne</p>
            </div>
          </div>
          <button onClick={() => store.closeChat()} className="w-8 h-8 hover:bg-white/10 rounded-sm inline-flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div ref={ref} className="flex-1 overflow-y-auto p-4 space-y-3 bg-n-50">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3.5 py-2.5 text-sm whitespace-pre-wrap leading-relaxed rounded-sm ${m.from === 'me' ? 'bg-ink text-white' : 'bg-white border border-n-200 text-ink'}`}>
                {m.text}{m.streaming && <span className="inline-block w-1.5 h-3 bg-orange ml-1 animate-pulse" />}
              </div>
            </div>
          ))}
          {msgs.length === 1 && (
            <div className="mt-4 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-n-500 font-semibold">Suggestions</p>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="block w-full text-left px-3 py-2 bg-white border border-n-200 hover:border-orange hover:bg-orange-tint text-xs rounded-sm transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-3 border-t border-n-200 bg-white rounded-b-sm">
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(draft) }}
              placeholder="Posez votre question…"
              className="flex-1 bg-n-50 border border-n-200 px-3 h-9 text-sm rounded-sm outline-none focus:border-orange"
            />
            <button onClick={() => send(draft)} className="w-9 h-9 bg-orange text-white hover:bg-orange-deep rounded-sm flex items-center justify-center disabled:bg-n-300" disabled={!draft.trim()}>
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-n-400 mt-2 text-center">ADCA est un agent IA · les réponses sont indicatives, vérifiez avant action légale.</p>
        </div>
      </div>
    </>
  )
}

export function ChatFAB() {
  const open = useStore((s) => s.chatOpen)
  if (open) return null
  return (
    <button onClick={() => store.toggleChat()} className="fixed bottom-6 right-6 z-40 bg-orange text-white px-4 h-12 rounded-sm shadow-xl hover:bg-orange-deep transition-all flex items-center gap-2 group">
      <Sparkles className="w-4 h-4" />
      <span className="font-semibold text-sm hidden sm:inline">Demander à ADCA</span>
      <MessageSquare className="w-4 h-4 sm:hidden" />
    </button>
  )
}
