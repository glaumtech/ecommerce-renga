# ecommerce-renga
# Ananda Storefront

Angular 19 e-commerce storefront for Pooja, Herbal, and Brass products. Connects to the TrueUp Lite Spring Boot backend.

## Development

```bash
# Frontend (port 4200)
npm install
npm start

# Backend (port 8081) — from trueup-lite-backend
mvn spring-boot:run
```

## Local end-to-end (H2 mock DB + Playwright)

1. In **trueup-lite-backend**, start the API with the `e2e` profile (in-memory H2 + seed data):

   ```bash
   SPRING_PROFILES_ACTIVE=e2e mvn spring-boot:run
   ```

   See `docs/E2E_LOCAL.md` in the backend repo for growing `mock-data.sql` from a MySQL backup.

2. In this project, install deps and run the storefront:

   ```bash
   npm install
   npm start
   ```

3. With the backend on **8081** and Angular on **4200**, run Playwright:

   ```bash
   npm run e2e
   ```

   Optional: `E2E_BASE_URL` (default `http://localhost:4200`), `E2E_API_URL` (default `http://localhost:8081`), `npm run e2e:ui` for the interactive runner.

## Architecture

- **Storefront footer — Scan to Connect**: QR image at `public/scan-to-connect-linktree.png` links to the Linktree bio via `SCAN_TO_CONNECT_LINKTREE_URL` in `src/app/core/constants/brand-links.constants.ts`.
- **Lazy-loaded routes**: Home, Shop, Cart, Checkout, Account
- **Signal-based services**: ProductService, CartService, OrderService, AuthService
- **Session auth**: `/reg/login` with `withCredentials` (cookie-based)
- **Store API**: `/api/store/products`, `/api/store/categories`, `/api/store/orders`

## Admin portal

Staff login at `/admin`. Fulfillment dashboard routes include orders, categories, video ads, Google reviews, and **Offers & Discounts** at `/admin/dashboard/offers`. The offers screen calls the TrueUp Lite backend **`/api/offers`** API (CRUD, search, toggle status, statistics) and catalog helpers (`/items/getAll`, `/categories`, `/brands`).

Storefront **checkout** evaluates configured offers via **`POST /api/offers/evaluate-checkout`** (optional `mobile` + cart lines), shows the best discount in the order summary, and sends optional **`offerId`** on **`POST /api/store/orders`**. The backend re-applies the offer server-side when persisting the order total.

Checkout **order summary** shows merchandise **subtotal before discount** (from `originalAmount` when offers apply), **shipping**, then when a discount applies (`discountAmount > 0`) **total before discount** (merchandise + shipping), a **discount** line, and **total** (`finalAmount` discounted merchandise + shipping). **Subtotal after discount** is not shown as its own summary row; `finalAmount` still backs discounted merchandise in the final total.

## Build

```bash
npm run build
```

Output: `dist/ananda-store`
