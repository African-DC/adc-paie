import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

type Variant = 'danger' | 'warning' | 'info'

const STYLES: Record<Variant, { icon: string; iconBg: string; btn: string }> = {
  danger:  { icon: 'text-red-600',     iconBg: 'bg-red-100',         btn: 'bg-red-600 hover:bg-red-700' },
  warning: { icon: 'text-orange',      iconBg: 'bg-orange-tint',     btn: 'bg-orange hover:bg-orange-deep' },
  info:    { icon: 'text-ink',         iconBg: 'bg-n-100',           btn: 'bg-ink hover:bg-ink-2' },
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'warning',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string | React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: Variant
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onCancel, onConfirm])

  if (!open) return null
  const s = STYLES[variant]

  return (
    <div className="fixed inset-0 z-[120] bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-full ${s.iconBg} flex items-center justify-center shrink-0`}>
              <AlertTriangle className={`w-5 h-5 ${s.icon}`} />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg font-semibold tracking-tight">{title}</h3>
              <div className="mt-2 text-sm text-n-700 leading-relaxed">{message}</div>
            </div>
            <button onClick={onCancel} className="w-8 h-8 hover:bg-n-100 rounded-sm inline-flex items-center justify-center shrink-0" aria-label="Fermer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="px-6 py-4 bg-n-50 border-t border-n-200 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="px-4 h-10 text-sm border border-n-300 rounded-sm hover:bg-white transition-colors">{cancelLabel}</button>
          <button onClick={onConfirm} className={`px-4 h-10 text-sm font-semibold uppercase tracking-wider text-white rounded-sm transition-colors ${s.btn}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
