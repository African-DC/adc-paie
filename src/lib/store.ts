import { useEffect, useState } from 'react'

type Notif = { id: string; title: string; desc: string; time: string; read: boolean; type: 'info' | 'warning' | 'success' }

export type Org = { name: string; ifu: string; cnps: string; sector: string; taux_at: string; city: string }
const DEFAULT_ORG: Org = { name: 'Sahel Industries SARL', ifu: 'CI-2104-A-098456', cnps: '048120', sector: 'Agro-industrie', taux_at: '3.5', city: 'Abidjan, Plateau' }
const ORG_KEY = 'adc-paie-org-v1'
function loadOrg(): Org { try { if (typeof localStorage === 'undefined') return DEFAULT_ORG; const s = localStorage.getItem(ORG_KEY); return s ? { ...DEFAULT_ORG, ...JSON.parse(s) } : DEFAULT_ORG } catch { return DEFAULT_ORG } }
function saveOrg(o: Org) { try { if (typeof localStorage !== 'undefined') localStorage.setItem(ORG_KEY, JSON.stringify(o)) } catch {} }

const NOTIFS_INITIAL: Notif[] = [
  { id: 'n1', title: 'Bordereau CNPS prêt', desc: 'La déclaration de novembre 2026 attend votre validation.', time: 'il y a 12 min', read: false, type: 'warning' },
  { id: 'n2', title: 'Paie d\'octobre validée', desc: 'Tous les bulletins ont été générés et envoyés.', time: 'il y a 2 jours', read: false, type: 'success' },
  { id: 'n3', title: 'Nouvel ITS publié', desc: 'Le barème ITS 2027 a été appliqué automatiquement.', time: 'il y a 5 jours', read: true, type: 'info' },
  { id: 'n4', title: 'Aïcha Koné a posé 5 jours de congé', desc: 'Du 23 au 27 décembre 2026. À valider.', time: 'il y a 1 semaine', read: true, type: 'info' },
]

type State = {
  spotlightOpen: boolean
  notifOpen: boolean
  chatOpen: boolean
  hireOpen: boolean
  onboardingDone: boolean
  toast: { id: string; msg: string; type: 'success' | 'info' | 'warning' } | null
  notifs: Notif[]
  org: Org
}

let state: State = {
  spotlightOpen: false,
  notifOpen: false,
  chatOpen: false,
  hireOpen: false,
  onboardingDone: false,
  toast: null,
  notifs: NOTIFS_INITIAL,
  org: loadOrg(),
}

const listeners = new Set<() => void>()

function setState(patch: Partial<State>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export function useStore<T>(selector: (s: State) => T): T {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force((n) => n + 1)
    listeners.add(l)
    return () => { listeners.delete(l) }
  }, [])
  return selector(state)
}

export const store = {
  openSpotlight: () => setState({ spotlightOpen: true }),
  closeSpotlight: () => setState({ spotlightOpen: false }),
  toggleSpotlight: () => setState({ spotlightOpen: !state.spotlightOpen }),
  toggleNotif: () => setState({ notifOpen: !state.notifOpen, chatOpen: false }),
  closeNotif: () => setState({ notifOpen: false }),
  toggleChat: () => setState({ chatOpen: !state.chatOpen, notifOpen: false }),
  closeChat: () => setState({ chatOpen: false }),
  openHire: () => setState({ hireOpen: true }),
  closeHire: () => setState({ hireOpen: false }),
  markAllRead: () => setState({ notifs: state.notifs.map((n) => ({ ...n, read: true })) }),
  markRead: (id: string) => setState({ notifs: state.notifs.map((n) => n.id === id ? { ...n, read: true } : n) }),
  setOrg: (patch: Partial<Org>) => { const next = { ...state.org, ...patch }; saveOrg(next); setState({ org: next }) },
  resetOrg: () => { saveOrg(DEFAULT_ORG); setState({ org: DEFAULT_ORG }) },
  getOrg: () => state.org,
  toast: (msg: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = String(Date.now())
    setState({ toast: { id, msg, type } })
    setTimeout(() => {
      if (state.toast?.id === id) setState({ toast: null })
    }, 3500)
  },
}
