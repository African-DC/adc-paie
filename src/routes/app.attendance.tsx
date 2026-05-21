import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Clock, UserCheck, UserX, AlertCircle, Search, X, ChevronLeft, ChevronRight, CheckCircle2, Coffee, LogIn, LogOut as LogOutIcon } from 'lucide-react'
import { EMPLOYEES } from '../lib/mock'
import { store } from '../lib/store'
import { downloadAttendanceSheetPDF } from '../lib/downloads'

export const Route = createFileRoute('/app/attendance')({ component: AttendancePage })

type Status = 'present' | 'late' | 'absent' | 'leave' | 'remote'

type Punch = { in?: string; out?: string; lunch?: number }

const STATUS_MAP: Record<Status, { label: string; bg: string; dot: string; icon: any }> = {
  present: { label: 'Présent',   bg: 'bg-green-100 text-green-800',  dot: 'bg-green-500',  icon: UserCheck },
  late:    { label: 'Retard',    bg: 'bg-orange-tint text-orange-deep', dot: 'bg-orange', icon: Clock },
  absent:  { label: 'Absent',    bg: 'bg-red-50 text-red-700',       dot: 'bg-red-500',    icon: UserX },
  leave:   { label: 'Congé',     bg: 'bg-n-100 text-n-700',          dot: 'bg-n-400',      icon: Coffee },
  remote:  { label: 'Télétravail', bg: 'bg-blue-50 text-blue-700',   dot: 'bg-blue-500',   icon: CheckCircle2 },
}

// Mock data initiale jour courant
function buildInitial(active: typeof EMPLOYEES) {
  const map = new Map<string, { status: Status; punch: Punch }>()
  active.forEach((e, i) => {
    const mod = (parseInt(e.id) * 13) % 10
    if (mod < 6) map.set(e.id, { status: 'present', punch: { in: `0${7 + (i % 2)}:${10 + (i * 7) % 50}`, out: undefined, lunch: 60 } })
    else if (mod === 6) map.set(e.id, { status: 'late', punch: { in: `09:${20 + i}`, lunch: 60 } })
    else if (mod === 7) map.set(e.id, { status: 'remote', punch: { in: `08:00`, lunch: 60 } })
    else if (mod === 8) map.set(e.id, { status: 'leave', punch: {} })
    else map.set(e.id, { status: 'absent', punch: {} })
  })
  return map
}

function AttendancePage() {
  const active = EMPLOYEES.filter((e) => e.status === 'active')
  const [punches, setPunches] = useState(() => buildInitial(active))
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | Status>('all')

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const stats = useMemo(() => {
    let present = 0, late = 0, absent = 0, leave = 0, remote = 0
    punches.forEach((p) => {
      if (p.status === 'present') present++
      else if (p.status === 'late') late++
      else if (p.status === 'absent') absent++
      else if (p.status === 'leave') leave++
      else if (p.status === 'remote') remote++
    })
    return { present, late, absent, leave, remote, total: active.length }
  }, [punches, active.length])

  const visible = useMemo(() => {
    const nq = norm(query)
    return active.filter((e) => {
      const p = punches.get(e.id)
      if (!p) return false
      if (filter !== 'all' && p.status !== filter) return false
      if (!nq) return true
      return norm(`${e.firstName} ${e.lastName} ${e.role}`).includes(nq)
    })
  }, [active, punches, query, filter])

  const handleSetStatus = (id: string, status: Status) => {
    setPunches((prev) => {
      const next = new Map(prev)
      const cur = next.get(id) || { status: 'absent', punch: {} }
      const punch = status === 'absent' || status === 'leave' ? {} : { ...cur.punch, in: cur.punch.in || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
      next.set(id, { status, punch })
      return next
    })
    store.toast(`Statut mis à jour : ${STATUS_MAP[status].label}`, 'success')
  }

  const handleClockOut = (id: string) => {
    setPunches((prev) => {
      const next = new Map(prev)
      const cur = next.get(id)
      if (cur && !cur.punch.out) {
        next.set(id, { ...cur, punch: { ...cur.punch, out: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) } })
      }
      return next
    })
    store.toast('Sortie enregistrée', 'success')
  }

  const taux = active.length > 0 ? Math.round(((stats.present + stats.late + stats.remote) / stats.total) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] tracking-[0.28em] uppercase text-n-500 font-semibold mb-2">Pointage du jour</p>
          <h1 className="font-serif text-3xl lg:text-4xl font-semibold tracking-tight">Présences & <span className="em-serif">absences</span></h1>
          <p className="mt-2 text-n-700 capitalize">{today}</p>
        </div>
        <button onClick={() => { downloadAttendanceSheetPDF(active, punches); store.toast('Feuille de présence PDF téléchargée', 'success') }} className="inline-flex items-center gap-2 border border-n-300 text-n-700 px-4 h-9 text-xs font-semibold uppercase tracking-wider hover:bg-n-50 transition-colors rounded-sm">
          <CheckCircle2 className="w-3.5 h-3.5" /> Feuille du jour (PDF)
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Présents"    value={String(stats.present)}  total={String(stats.total)} color="green"   icon={UserCheck} />
        <Stat label="Retards"     value={String(stats.late)}     total={String(stats.total)} color="orange"  icon={Clock} />
        <Stat label="Télétravail" value={String(stats.remote)}   total={String(stats.total)} color="blue"    icon={CheckCircle2} />
        <Stat label="Congés"      value={String(stats.leave)}    total={String(stats.total)} color="default" icon={Coffee} />
        <Stat label="Absents"     value={String(stats.absent)}   total={String(stats.total)} color="red"     icon={UserX} />
      </div>

      <div className="bg-gradient-to-r from-ink to-ink-2 text-white rounded-sm p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange/20 border-2 border-orange flex items-center justify-center">
            <span className="font-serif text-xl font-semibold text-orange">{taux}%</span>
          </div>
          <div>
            <p className="font-semibold">Taux de présence aujourd'hui</p>
            <p className="text-xs text-n-300 mt-0.5">{stats.present + stats.late + stats.remote} sur {stats.total} salariés en activité (présents, télétravail ou retard)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button className="px-3 h-8 rounded-sm bg-white/10 hover:bg-white/20 inline-flex items-center gap-1.5"><ChevronLeft className="w-3.5 h-3.5" /> Hier</button>
          <button className="px-3 h-8 rounded-sm bg-orange text-white font-semibold">Aujourd'hui</button>
          <button className="px-3 h-8 rounded-sm bg-white/10 hover:bg-white/20 inline-flex items-center gap-1.5">Demain <ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-n-200 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {([
            { v: 'all', l: `Tous (${stats.total})` },
            { v: 'present', l: `Présents (${stats.present})` },
            { v: 'late', l: `Retards (${stats.late})` },
            { v: 'remote', l: `Télétravail (${stats.remote})` },
            { v: 'leave', l: `Congés (${stats.leave})` },
            { v: 'absent', l: `Absents (${stats.absent})` },
          ] as const).map((t) => (
            <button key={t.v} onClick={() => setFilter(t.v as any)} className={`px-3 h-9 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors ${filter === t.v ? 'bg-ink text-white' : 'text-n-700 hover:bg-n-100'}`}>{t.l}</button>
          ))}
        </div>
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-n-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un salarié…" className="w-full h-9 pl-8 pr-7 border border-n-300 rounded-sm text-xs bg-white focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20" />
          {query && <button onClick={() => setQuery('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 hover:bg-n-100 rounded-sm inline-flex items-center justify-center"><X className="w-3 h-3 text-n-500" /></button>}
        </div>
      </div>

      <div className="bg-white border border-n-200 rounded-sm overflow-hidden">
        {visible.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-8 h-8 text-n-300 mx-auto mb-2" />
            <p className="text-sm text-n-500">Aucun salarié dans cette catégorie.</p>
          </div>
        ) : (
          <ul className="divide-y divide-n-100">
            {visible.map((e) => {
              const p = punches.get(e.id)!
              const status = STATUS_MAP[p.status]
              return (
                <li key={e.id} className="px-5 py-3 flex items-center gap-4 flex-wrap hover:bg-n-50/50 transition-colors">
                  <Link to="/app/employees/$id" params={{ id: e.id }} className="flex items-center gap-3 group min-w-[200px]">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 bg-n-100 group-hover:bg-orange group-hover:text-white text-n-700 font-semibold text-xs rounded-full flex items-center justify-center transition-colors">{e.firstName[0]}{e.lastName[0]}</div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${status.dot} rounded-full border-2 border-white`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium group-hover:text-orange transition-colors">{e.firstName} {e.lastName}</p>
                      <p className="text-[10px] text-n-500">{e.role}</p>
                    </div>
                  </Link>
                  <div className="flex-1 min-w-[150px] flex items-center gap-3">
                    <span className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-sm inline-flex items-center gap-1.5 ${status.bg}`}>
                      <status.icon className="w-3 h-3" />
                      {status.label}
                    </span>
                    {p.punch.in && (
                      <span className="text-[11px] text-n-600 inline-flex items-center gap-1 font-mono">
                        <LogIn className="w-3 h-3 text-green-600" /> {p.punch.in}
                        {p.punch.out && <><LogOutIcon className="w-3 h-3 text-red-500 ml-1" /> {p.punch.out}</>}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {p.status !== 'absent' && p.status !== 'leave' && p.punch.in && !p.punch.out && (
                      <button onClick={() => handleClockOut(e.id)} className="px-3 h-8 text-[11px] font-semibold border border-orange text-orange-deep hover:bg-orange-tint rounded-sm inline-flex items-center gap-1.5">
                        <LogOutIcon className="w-3 h-3" /> Pointer sortie
                      </button>
                    )}
                    <div className="relative group/menu">
                      <button className="px-3 h-8 text-[11px] font-medium border border-n-300 hover:bg-n-50 rounded-sm">Changer statut</button>
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-n-200 rounded-sm shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                        {(['present', 'late', 'remote', 'leave', 'absent'] as Status[]).map((s) => (
                          <button key={s} onClick={() => handleSetStatus(e.id, s)} className="w-full px-3 py-2 text-left text-xs hover:bg-orange-tint inline-flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${STATUS_MAP[s].dot}`} />
                            {STATUS_MAP[s].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <InfoCard icon={Clock} title="Horaires standards" desc="Lundi–Vendredi · 8h–17h · Pause déjeuner 12h–13h (1h non-comptée)" />
        <InfoCard icon={CheckCircle2} title="Décompte automatique" desc="Les heures pointées alimentent automatiquement la paie du mois (heures sup, primes assiduité)" />
        <InfoCard icon={AlertCircle} title="Tolérance retard" desc="Au-delà de 15 min, le salarié est marqué en retard. Personnalisable dans Réglages." />
      </div>
    </div>
  )
}

function Stat({ label, value, total, color, icon: Icon }: { label: string; value: string; total: string; color: 'green' | 'orange' | 'blue' | 'red' | 'default'; icon: any }) {
  const colors: Record<typeof color, string> = {
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-tint border-orange/30 text-orange-deep',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    default: 'bg-white border-n-200 text-n-700',
  }
  return (
    <div className={`p-4 rounded-sm border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] tracking-[0.22em] uppercase font-semibold">{label}</p>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <p className="font-serif font-semibold text-2xl tracking-tight leading-none">{value}<span className="text-sm text-n-500 font-sans">/{total}</span></p>
    </div>
  )
}

function InfoCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="bg-white border border-n-200 rounded-sm p-5">
      <Icon className="w-5 h-5 text-orange mb-2" />
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-n-600 mt-1 leading-relaxed">{desc}</p>
    </div>
  )
}
