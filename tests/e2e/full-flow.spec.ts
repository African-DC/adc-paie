/**
 * E2E ADC Paie — Tests via API directe + smoke routes.
 *
 * Mode démo `/app/*` est sur la branche `demo` (mockup gelé). Sur master,
 * `/app/*` redirige vers `/login` si pas de session (route guards Phase 2).
 * Voir memory branche-demo-gelee.md.
 *
 * Le test full UI flow signup→onboard→seed→payroll est marqué .skip en
 * headless (gotcha hydration React/SSR documenté memory
 * dev-browser-headless-limits.md). À activer en browser réel par Marcel.
 */
import { test, expect } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

test.describe('ADC Paie — Smoke E2E', () => {
  test('Routes publiques répondent 200', async ({ request }) => {
    const routes = [
      '/', '/a-propos', '/aide', '/cgv', '/confidentialite',
      '/mentions-legales', '/calculatrice', '/login', '/signup',
    ]
    for (const route of routes) {
      const res = await request.get(`${BASE_URL}${route}`)
      expect(res.status(), `${route} should be 200`).toBe(200)
    }
  })

  test('Routes /app/* renvoient 200 en SSR (route guards client-side)', async ({ request }) => {
    // SSR renvoie le HTML, le guard useEffect côté client fera le redirect /login
    const routes = [
      '/app', '/app/employees', '/app/payroll', '/app/settings',
    ]
    for (const route of routes) {
      const res = await request.get(`${BASE_URL}${route}`)
      expect(res.status(), `${route} should be 200`).toBe(200)
    }
  })

  test('404 sur route inexistante', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/route-inexistante-xyz`)
    expect(res.status()).toBe(404)
  })

  test('Proxy /api/auth/* fonctionne', async ({ request }) => {
    const res = await request.get(`${BASE_URL}/api/auth/get-session`)
    expect(res.status()).toBeLessThan(500)
  })

  test('Landing contient les CTAs critiques', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)
    await expect(page).toHaveTitle(/ADC Paie/)
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.locator('a[href="/app"]').first()).toBeVisible()
    await expect(page.locator('a[href="/calculatrice"]').first()).toBeVisible()
  })

  test('Login page rend le formulaire', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('Signup page rend le formulaire', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`)
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
  })

  test('Calculatrice page rend (mode démo, pas d\'auth)', async ({ page }) => {
    await page.goto(`${BASE_URL}/calculatrice`)
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => null)
    await expect(page.locator('text=/Calculatrice|brut|net|FCFA/i').first()).toBeVisible({ timeout: 10_000 })
  })

  test('Aide & barèmes rend les tranches CI 2026', async ({ page }) => {
    await page.goto(`${BASE_URL}/aide`)
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => null)
    await expect(page.locator('text=/CNPS|ITS|barème/i').first()).toBeVisible({ timeout: 10_000 })
  })

  test('Confidentialité mentionne Convex AWS + ARTCI', async ({ page }) => {
    await page.goto(`${BASE_URL}/confidentialite`)
    await expect(page.locator('text=/Convex/i').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('text=/ARTCI/i').first()).toBeVisible({ timeout: 10_000 })
  })

  test('/app/* sans session → redirect /login côté client', async ({ page }) => {
    await page.goto(`${BASE_URL}/app`)
    // Le useEffect guard fait window.location ou navigate vers /login
    await page.waitForURL(/login/, { timeout: 15_000 }).catch(() => null)
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10_000 })
  })
})

// Test signup API direct : possible mais nécessite trustedOrigins configuré pour le port test.
// Voir TODO Phase 8 : ajouter localhost:* à trustedOrigins ou forcer test sur port 3000.
test.skip('Signup API Better Auth (skip — trustedOrigins à configurer)', async ({ request }) => {
  const ts = Date.now()
  const email = `e2e-api-${ts}@adc-paie.ci`
  const res = await request.post(`${BASE_URL}/api/auth/sign-up/email`, {
    data: { email, password: 'TestPaie2026!', name: 'E2E API' },
    headers: { 'Content-Type': 'application/json', Origin: BASE_URL },
  })
  expect(res.status()).toBeLessThan(400)
})

// Test full UI flow signup → onboard → seed → payroll (skip headless)
// Voir memory dev-browser-headless-limits.md
test.skip('Full UI flow (skip headless — exécuter en browser réel)', async () => {})
