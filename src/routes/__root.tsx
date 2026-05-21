import { Outlet, createRootRoute, HeadContent } from '@tanstack/react-router'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'ADC Paie & RH · SaaS conforme CNPS et DGI pour PME ivoiriennes' },
      { name: 'description', content: 'Plateforme SaaS de gestion de paie conforme CNPS, DGI et Code du travail ivoirien. Édité par African Digit Consulting.' },
      { name: 'theme-color', content: '#f97316' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500;1,9..144,600&family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap' },
    ],
  }),
  component: () => <><HeadContent /><Outlet /></>,
})
