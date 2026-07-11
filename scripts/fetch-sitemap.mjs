import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const apiUrl = (process.env.STORE_API_URL || 'https://ghopon.com/trueup-lite-renga').replace(/\/+$/, '');
const outputPath = join(projectRoot, 'public', 'sitemap.xml');

const response = await fetch(`${apiUrl}/api/store/sitemap.xml`);
if (!response.ok) {
  throw new Error(`Failed to fetch sitemap from ${apiUrl}: HTTP ${response.status}`);
}

const xml = await response.text();
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, xml, 'utf8');
console.log(`Wrote sitemap to ${outputPath}`);
