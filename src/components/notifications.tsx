import { X, AlertCircle, CheckCircle2, Info, BellOff } from 'lucide-react'
import { useStore, store } from '../lib/store'

export function NotificationsPanel() {
  const open = useStore((s) => s.notifOpen)
  const notifs = useStore((s) => s.notifs)
  const unread = notifs.filter((n) => !n.read).length
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/20" onClick={() => store.closeNotif()} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white border-l border-n-200 z-50 shadow-2xl flex flex-col">
        <div className="px-5 py-4 border-b border-n-200 flex items-center justify-between">
          <div>
            <p className="font-serif text-lg font-semibold tracking-tight">Notifications</p>
            <p className="text-[11px] text-n-500">{unread} non lue{unread > 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <button onClick={() => store.markAllRead()} className="text-[11px] uppercase tracking-wider font-semibold text-orange hover:text-orange-deep px-2 py-1">
                Tout marquer lu
              </button>
            )}
            <button onClick={() => store.closeNotif()} className="w-8 h-8 hover:bg-n-100 rounded-sm inline-flex items-center justify-center">
              <X className="w-4 h-4 text-n-500" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-n-500">
              <BellOff className="w-8 h-8 mb-3 text-n-300" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <ul>
              {notifs.map((n) => {
                const Icon = n.type === 'warning' ? AlertCircle : n.type === 'success' ? CheckCircle2 : Info
                const color = n.type === 'warning' ? 'text-orange' : n.type === 'success' ? 'text-green-600' : 'text-n-500'
                return (
                  <li key={n.id} className={`px-5 py-4 border-b border-n-100 cursor-pointer hover:bg-n-50 ${!n.read ? 'bg-orange-tint/30' : ''}`} onClick={() => store.markRead(n.id)}>
                    <div className="flex items-start gap-3">
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                          {!n.read && <span className="w-1.5 h-1.5 bg-orange rounded-full shrink-0" />}
                        </div>
                        <p className="text-xs text-n-600 mt-1 leading-snug">{n.desc}</p>
                        <p className="text-[10px] uppercase tracking-wider text-n-400 mt-2">{n.time}</p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

export function Toast() {
  const toast = useStore((s) => s.toast)
  if (!toast) return null
  const colors = {
    success: 'bg-green-600',
    info: 'bg-ink-2',
    warning: 'bg-orange',
  }
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 ${colors[toast.type]} text-white px-5 py-3 rounded-sm shadow-2xl z-[200] text-sm font-medium animate-in slide-in-from-bottom-2`}>
      {toast.msg}
    </div>
  )
}
