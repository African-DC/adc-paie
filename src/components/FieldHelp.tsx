import { useEffect, useRef, useState } from 'react'
import { HelpCircle, X, BookOpen, MapPin, FileText, Lightbulb, Scale } from 'lucide-react'
import type { FieldHelpContent } from '../lib/onboarding-help'

type Props = {
  label: string
  content: FieldHelpContent
}

export function FieldHelp({ label, content }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Aide sur ${label}`}
        aria-expanded={open}
        className="ml-1.5 text-n-400 hover:text-orange transition-colors inline-flex items-center"
      >
        <HelpCircle className="w-3.5 h-3.5" strokeWidth={2} />
      </button>

      {open && (
        <div className="absolute left-0 top-6 z-50 w-80 sm:w-96 bg-white border border-n-200 rounded-sm shadow-xl">
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
                  <p className="mt-1.5 text-[12px] text-n-600">
                    Exemple : <span className="font-mono text-ink bg-n-100 px-1.5 py-0.5 rounded-sm">{content.example}</span>
                  </p>
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
