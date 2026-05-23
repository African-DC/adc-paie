import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  ssr: {
    // Better Auth + Convex doivent être bundled en SSR (module resolution).
    noExternal: ['@convex-dev/better-auth', '@convex-dev/react-query', 'convex'],
    // jspdf, jszip, xlsx, file-saver = libs browser-only utilisées par downloads.ts
    // dans des handlers onClick (jamais exécutés en SSR). Marquer external pour
    // éviter le bundling SSR. À durcir Phase 2+ avec lazy dynamic imports.
    external: ['jspdf', 'jspdf-autotable', 'jszip', 'xlsx', 'file-saver'],
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      tsr: { autoCodeSplitting: true },
      target: 'vercel',
    }),
    viteReact(),
  ],
})

export default config
