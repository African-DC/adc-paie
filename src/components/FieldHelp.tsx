import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { HelpCircle, X, BookOpen, MapPin, FileText, Lightbulb, Scale, Copy, Check } from 'lucide-react'
import type { FieldHelpContent } from '../lib/onboarding-help'

type Props = {
  label: string
  content: FieldHelpContent
  fieldId?: string
}

type Placement = {
  vertical: 'below' | 'above'
  horizontal: 'left' | 'right'
}

const POPOVER_WIDTH = 384
const POPOVER_MAX_HEIGHT_VH = 0.6
const TRIGGER_OFFSET = 28

export function FieldHelp({ label, content, fieldId }: Props) {
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState<Placement>({ vertical: 'below', horizontal: 'left' })
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const vh = window.innerHeight
    const vw = window.innerWidth
    const popoverMaxH = vh * POPOVER_MAX_HEIGHT_VH

    const spaceBelow = vh - rect.bottom
    const spaceAbove = rect.top
    const vertical: Placement['vertical'] =
      spaceBelow < popoverMaxH && spaceAbove > spaceBelow ? 'above' : 'below'

    const spaceRight = vw - rect.left
    const horizontal: Placement['horizontal'] = spaceRight < POPOVER_WIDTH ? 'right' : 'left'

    setPlacement({ vertical, horizontal })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!fieldId || typeof document === 'undefined') return
    const input = document.getElementById(fieldId)
    if (!input) return
    const onShortcut = (e: KeyboardEvent) => {
      if ((e.key === '?' || (e.key === '/' && e.shiftKey)) && document.activeElement === input) {
        e.preventDefault()
        setOpen(true)
      }
    }
    input.addEventListener('keydown', onShortcut)
    return () => input.removeEventListener('keydown', onShortcut)
  }, [fieldId])

  const copyExample = async () => {
    if (!content.example) return
    try {
      await navigator.clipboard.writeText(content.example)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard refusé, ignorer */
    }
  }

  const verticalClass = placement.vertical === 'below' ? 'top-6' : 'bottom-6'
  const horizontalClass = placement.horizontal === 'left' ? 'left-0' : 'right-0'

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Aide sur ${label}`}
        aria-expanded={open}
        className="ml-1.5 text-n-400 hover:text-orange transition-colors inline-flex items-center"
      >
        <HelpCircle className="w-3.5 h-3.5" strokeWidth={2} />
      </button>

      {open && (
        <div
          className={`absolute ${verticalClass} ${horizontalClass} z-50 w-80 sm:w-96 bg-white border border-n-200 rounded-sm shadow-xl`}
        >
          <div className="flex items-start justify-between px-4 pt-3 pb-2 border-b border-n-100 bg-n-50">
            <p className="text-[10px] uppercase tracking-[0.22em] text-orange font-semibold">{label}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer l'aide"
              className="text-n-400 hover:text-ink transition-colors -mt-0.5 -mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-4 py-3 space-y-3 max-h-[60vh] overflow-y-auto">
            <Section icon={<BookOpen className="w-3.5 h-3.5" />} title="C'est quoi">
              <p className="text-[12.5px] leading-relaxed text-n-800">{content.what}</p>
            </Section>

            <Section icon={<MapPin className="w-3.5 h-3.5" />} title="Où le trouver">
              <ul className="text-[12.5px] leading-relaxed text-n-800 space-y-1">
                {content.where.map((w, i) => (
                  <li key={i} className="flex items-baseline gap-1.5">
                    <span className="text-orange shrink-0">•</span>
                    <span>
                      {w.text}
                      {w.url && (
                        <>
                          {' '}
                          <a
                            href={w.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-orange underline hover:text-orange-deep break-all"
                          >
                            {w.url.replace(/^https?:\/\//, '')}
                          </a>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>

            {(content.format || content.example) && (
              <Section icon={<FileText className="w-3.5 h-3.5" />} title="Format attendu">
                {content.format && (
                  <p className="text-[12.5px] leading-relaxed text-n-800">{content.format}</p>
                )}
                {content.example && (
                  <div className="mt-1.5 flex items-center gap-2 text-[12px] text-n-600">
                    <span>Exemple :</span>
                    <button
                      type="button"
                      onClick={copyExample}
                      aria-label={`Copier l'exemple ${content.example}`}
                      className="font-mono text-ink bg-n-100 hover:bg-n-200 px-1.5 py-0.5 rounded-sm inline-flex items-center gap-1.5 transition-colors"
                    >
                      {content.example}
                      {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-n-500" />}
                    </button>
                  </div>
                )}
              </Section>
            )}

            <Section icon={<Lightbulb className="w-3.5 h-3.5" />} title="Conseil">
              <p className="text-[12.5px] leading-relaxed text-n-800">{content.tip}</p>
            </Section>

            {content.legalRef && (
              <Section icon={<Scale className="w-3.5 h-3.5" />} title="Référence légale">
                <p className="text-[11.5px] leading-relaxed text-n-600 italic">{content.legalRef}</p>
              </Section>
            )}

            {fieldId && (
              <div className="pt-2 mt-2 border-t border-n-100">
                <p className="text-[10.5px] text-n-500 leading-relaxed">
                  Astuce clavier : focus sur le champ puis touche <kbd className="font-mono bg-n-100 border border-n-200 px-1 rounded text-[10px]">?</kbd> pour rouvrir cette aide.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1 text-orange">
        {icon}
        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold">{title}</p>
      </div>
      {children}
    </div>
  )
}
