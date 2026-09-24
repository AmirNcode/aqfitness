// Runs axe-core against the built site served by `npm run preview`.
// Usage: npm run build && npm run preview, then BASE_URL=http://localhost:4322 npm run a11y
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const base = process.env.BASE_URL ?? 'http://localhost:4322';
const pages = ['/', '/teams/', '/coaching/', '/results/', '/about/', '/book/', '/contact/', '/free-guide/', '/blog/', '/blog/what-are-macros-and-the-importance-of-calories/'];

const browser = await chromium.launch();
let failures = 0;
for (const width of [1440, 390]) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  for (const path of pages) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    for (const v of serious) {
      failures++;
      console.log(`[${width}] ${path} ${v.impact} ${v.id}: ${v.help}`);
      for (const n of v.nodes.slice(0, 3)) console.log(`    ${n.target.join(' ')}  ${n.failureSummary?.split('\n')[1] ?? ''}`);
    }
  }
  await context.close();
}
await browser.close();
console.log(failures ? `${failures} serious/critical accessibility issues` : 'no serious or critical accessibility issues');
process.exit(failures ? 1 : 0);
