# ADC Paie & RH

SaaS de gestion de paie conforme CNPS et DGI pour PME ivoiriennes.
Édité par [African Digit Consulting](https://africandigitconsulting.com).

## Stack (2026-05-23)

| Couche | Choix |
|---|---|
| Framework | **TanStack Start** v1.168 (SSR + server functions) |
| UI | React 19 + Tailwind v4 + Lucide |
| Backend | **Convex** v1.39 (DB realtime + storage + serverless) |
| Auth | **Better Auth** v1.6 + plugin organizations (multi-tenant) |
| Bundling | Vite 8 + pnpm workspace |
| Moteur paie | `@adc/payroll-engine` (workspace package, 76 tests Vitest) |

## Setup

```bash
pnpm install
npx convex dev --once  # provision Convex deployment (CONVEX_DEPLOYMENT auto)
npx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
npx convex env set SITE_URL "http://localhost:3000"
pnpm dev
```

L'app démarre sur http://localhost:3000.

## Architecture

### Single store Convex

Better Auth tourne sur Convex via `@convex-dev/better-auth` (component officiel) — pas de DB tierce, tout dans une seule base.

### Multi-tenant strict

Toutes les queries/mutations métier passent par le helper `withOrg(ctx, fn)` (`convex/lib/withOrg.ts`) qui :
1. Vérifie la session Better Auth
2. Extrait `activeOrganizationId` du JWT custom claim
3. Injecte `orgId` + `userId` + `userRole` dans le contexte

Anti-fuite cross-tenant : ne jamais utiliser `ctx.db.query()` direct sans `withOrg`.

### RBAC fine

5 rôles : `owner`, `admin`, `dro` (RH), `comptable`, `salarie`. Matrix de 30+ permissions dans `convex/lib/rbac.ts`. Helper `withOrgRoles(ctx, ['admin'], fn)` pour enforcer.

### Audit log hash-chained

Chaque mutation sensible écrit une entrée dans `auditLog` avec :
- `sequenceNumber` monotone par org
- `prevHash` SHA-256 de l'entrée précédente
- `entryHash` SHA-256 de cette entrée

Conformité ARTCI Loi 2013-450 + Code travail CI 5 ans rétention.

### Pattern data hybride (démo / live)

Toutes les routes UI suivent ce pattern :

```ts
const session = useSession()
const liveData = useQuery(api.X.list, session.data ? {} : 'skip')
const source = liveData?.length ? liveData.map(adapt) : MOCK_FALLBACK
```

→ Le mockup commercial reste intact pour les pitchs (mode démo), et tout devient live automatiquement après signup+onboarding.

### Mode démo via branche `demo`

Branche `demo` gelée (depuis HEAD master pré-migration TanStack Start) déployée par Vercel en preview URL stable. Mockup SPA pur, zéro Convex. À partager aux prospects en RDV.

## Structure

```
adc-paie/
├── packages/
│   └── payroll-engine/        # Pure module, 76 tests Vitest, barèmes CI 2026
├── convex/
│   ├── schema.ts              # 11 tables multi-tenant
│   ├── auth.ts                # Better Auth + organization plugin + JWT claims
│   ├── http.ts                # Mount /api/auth/*
│   ├── lib/
│   │   ├── withOrg.ts         # Helper scoping multi-tenant
│   │   ├── rbac.ts            # Permissions matrix
│   │   └── auditLog.ts        # Hash-chained SHA-256
│   ├── employees.ts           # CRUD + seedDemo
│   ├── payroll.ts             # generate/pay/validate (engine server-side)
│   ├── files.ts               # Storage bulletins PDF
│   ├── advances.ts, leaves.ts, attendance.ts, announcements.ts, reports.ts, notifications.ts
│   └── organizations.ts       # Settings + audit log queries
├── src/
│   ├── router.tsx             # getRouter (convention default-entry Start)
│   ├── routes/
│   │   ├── __root.tsx         # shellComponent HTML (pas de ConvexProvider ici)
│   │   ├── (marketing publics) /, /a-propos, /aide, /cgv, /confidentialite, /mentions-legales, /calculatrice
│   │   ├── login.tsx, signup.tsx, onboarding.tsx
│   │   ├── api/auth.$.ts      # Proxy vers Convex Site URL
│   │   └── app.*.tsx          # Shell + modules (ConvexProvider scoped here)
│   └── lib/
│       ├── auth-client.ts, auth-server.ts, convex-client.ts
│       ├── mock.ts            # Fallback mode démo
│       ├── store.ts           # UI state (modals, toasts)
│       └── downloads.ts       # Exports PDF/Excel/ZIP client-side
└── README.md
```

## Commandes utiles

| Commande | Effet |
|---|---|
| `pnpm dev` | Dev server (Vite + Convex sync) |
| `pnpm build` | Build production |
| `pnpm test` | Tests app (Vitest) |
| `pnpm -F @adc/payroll-engine test` | Tests engine paie (76 specs) |
| `npx convex dev --once` | Push schema/functions sans watch |
| `npx convex env set FOO bar` | Set Convex env var |
| `npx convex dashboard` | Ouvrir dashboard Convex web |

## Conformité légale CI

- **Code du travail Loi 2015-532** — bulletins art. 32.5 mentions obligatoires
- **Convention Collective Interprofessionnelle 1977** — prime ancienneté (Art. 31), heures supp (Art. 24), congés (Art. 25), gratification 13e mois (Art. 41)
- **Loi de Finances 2026** N°2025-987 du 19 décembre 2025 — barèmes ITS/IGR/CN
- **Ordonnance 2023-719** — ITS quotient familial
- **CNPS** — taux 6,3 % salarié + 7,7 % employeur + plafond 45×SMIG
- **CMU** — forfait 500+500 FCFA
- **ARTCI Loi 2013-450** — protection données personnelles (DPA AWS+Vercel signés, demande autorisation en cours)

## Roadmap restante (post-migration)

Voir [`MEMORY.md`](../.claude/projects/.../memory/MEMORY.md) (memory project) pour la liste détaillée :
- Audit comptable engine v1.0 (budget 150-300k FCFA prévu)
- Wave Business sandbox (Phase 6 skip)
- Wiring UI modules secondaires (backends Convex prêts, checklist par module)
- Notifications panel live + Settings team management
- MFA TOTP (Phase 8)
- E2E test cross-tenant Playwright
- Observability OpenTelemetry → Grafana Cloud

## License

Propriétaire — African Digit Consulting, 2026
