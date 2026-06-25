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

## Architecture

- **Lazy-loaded routes**: Home, Shop, Cart, Checkout, Account
- **Signal-based services**: ProductService, CartService, OrderService, AuthService
- **Session auth**: `/reg/login` with `withCredentials` (cookie-based)
- **Store API**: `/api/store/products`, `/api/store/categories`, `/api/store/orders`

## Build

```bash
npm run build
```

Output: `dist/ananda-store`
