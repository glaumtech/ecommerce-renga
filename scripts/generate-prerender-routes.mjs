import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const apiUrl = (process.env.STORE_API_URL || 'https://ghopon.com/trueup-lite-renga').replace(/\/+$/, '');
const outputPath = join(projectRoot, 'prerendered-routes.json');

const staticRoutes = ['/', '/shop', '/login', '/register', '/cart', '/about-us'];

async function fetchProductSlugs() {
  try {
    const response = await fetch(`${apiUrl}/api/store/products`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const products = await response.json();
    return products
      .map((product) => product.slug)
      .filter((slug) => typeof slug === 'string' && /^[a-z0-9_]+$/.test(slug))
      .map((slug) => `/${slug}`);
  } catch (error) {
    console.warn(`Could not fetch products from ${apiUrl}: ${error.message}`);
    console.warn('Prerendering static routes only. Re-run build after API is reachable for product pages.');
    return [];
  }
}

const productRoutes = await fetchProductSlugs();
const routes = [...new Set([...staticRoutes, ...productRoutes])];

writeFileSync(outputPath, `${routes.join('\n')}\n`);
console.log(`Wrote ${routes.length} prerender routes to ${outputPath}`);
