# Scan modes

Two modes, one engine: Playwright + `@axe-core/playwright` `AxeBuilder`. Default bar WCAG 2.2 A+AA: `withTags(['wcag2a','wcag2aa','wcag22aa'])`. Output is always JSON with `violations` + `incomplete` — full node objects (target/html/failureSummary), never bare counts.

## Prereqs (in the target repo, not this one)

```bash
npm i -D @playwright/test @axe-core/playwright
npx playwright install --with-deps chromium   # Linux (needs apt/sudo for --with-deps)
npx playwright install chromium               # Windows/macOS, or when --with-deps fails
```

Set `PLAYWRIGHT_BROWSERS_PATH` to reuse a shared browser cache across repos. If the target's own native deps break the install (node-gyp errors), retry the skill's packages with `--ignore-scripts`. Match the target's pinned Node (`.nvmrc`) before starting its dev server — native modules fail otherwise. Pin `@playwright/test` + `@axe-core/playwright` versions in the target and note the axe-core engine version in reports — rule behavior drifts between releases.

## Mode 1 — local components/routes

Serve the built app (the repo's own dev/serve script, or `npx -y http-server <dir> -p 3000` — first free port if 3000 is taken), point `APP_URL` at it, then scan the scoped surface (changed routes/components by default). Serve the dir containing the page **plus its built assets** (copy/mount `dist` next to fixtures if styles live elsewhere). If the dev server binds IPv6-only (`[::1]`), use `localhost:` URLs, not `127.0.0.1`.

```js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

test('scoped routes have no axe violations', async ({ page }) => {
  // APP_URL is effectively required — the default below 404s on static servers.
  await page.goto(process.env.APP_URL ?? 'http://localhost:3000/scoped-route');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  await writeFile(
    'axe-results.json',
    JSON.stringify({ violations: results.violations, incomplete: results.incomplete }, null, 2)
  );
  expect(results.violations).toEqual([]);
  // Report results.incomplete separately — manual review, never auto-closed.
});
```

## Mode 2 — live URL audit

One context per viewport (mobile pass uses `isMobile`/`hasTouch` for `target-size` realism). Let fonts/CDN settle before analyzing; if two identical loads give wildly different counts, run a third time and take the majority reading, reporting the variance.

```js
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const viewports = [
  { name: 'desktop', viewport: { width: 1280, height: 800 } },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];
for (const { name, viewport, ...flags } of viewports) {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport, ...flags })).newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();
  await writeFile(
    `axe-results-${name}-${Date.now()}.json`,
    JSON.stringify({ violations: results.violations, incomplete: results.incomplete }, null, 2)
  );
  await browser.close();
  // Record violations + incomplete per viewport.
}
```

Skip the static prefilter for Mode 2 — there is no local source to sweep.

## CI ratchet

Run the Mode 1 spec in CI, upload `axe-results.json` as an artifact, and fail only on *new* violation classes: check the result's rule-ID set against a checked-in `axe-baseline.json` (same shape) and fail when a rule ID appears that the baseline lacks. Fix the new class (triage.md loop), then update the baseline in the same change. Never loosen the baseline without the re-scan evidence.

```yaml
- run: npx playwright install --with-deps chromium
- run: npx playwright test a11y.spec.js
- uses: actions/upload-artifact@v4
  with: { name: axe-results, path: axe-results.json }
```

## Authenticated surfaces

Logged-out surfaces are the default scope. A scan of a sign-in wall is not evidence for the page behind it. For post-auth routes:

- Detect it: redirect to sign-in, a login form instead of content, or auth errors in the console.
- Ask the user for credentials. Use a test account, never a personal one. Read secrets from environment variables. Never write them into specs, logs, result JSON, or the report. Never commit them. Never invent credentials; if login is impossible, scan the gate and say so.
- If the account uses MFA/2FA with TOTP: ask the user for the TOTP secret (the seed, not a one-time code). Generate a fresh code from the secret at login time and submit it at once. Codes expire in 30 seconds. Never ask for, log, or reuse single codes across runs.
- Log in once per run. Save the session (`storageState`) and reuse it for all scans. Log in again only when the session expires.
- Keep secrets out of evidence: mask password fields, tokens, and personal data in persisted JSON (node `html` strings can contain them).

## Scope notes

- Changed routes/components by default. Full-site crawl is opt-in and reported as such.
- No servable HTML in the repo (CSS-only libs)? Fall back to Mode 2 against the project's live docs/site URL.
- Before trusting contrast/target-size verdicts, confirm stylesheets actually loaded (no 404 CSS) — unstyled dev pages give false verdicts.
- Color-contrast needs real-browser values — no jsdom verdicts.
- Standalone scripts: AxeBuilder only accepts pages from `browser.newContext()` — `browser.newPage()` throws. The Mode 1 snippet uses the Playwright-test `page` fixture (context-backed, safe).
- Narrowing re-runs: `withTags` and `withRules` cannot combine (throws) — keep `withTags` for the bar, use `.disableRules([...])` to focus a re-run.
- Report third-party/ad violations (ads, embeds) separately — outside author control, still disclosed. Carve out embed *content*, but still fix the embed *element* you control (`<iframe>` needs `title`).
- Opt-in second pass for best-practice suspects (`heading-order`, `page-has-heading-one`): extend tags with `'best-practice'`.
- `AxeBuilder` JSON is the only verdict; static suspects never override it.
