# Opulence Byte website

Company site and SaaS store for Opulence Byte Private Limited. Next.js 16 (App Router), React 19, Tailwind 4, deployed on Vercel.

## Pages
| Route | What it is |
|---|---|
| `/` | Home: services, featured products, approach, Byte Catcher game, contact form |
| `/products` | Store with search and category filters for all SaaS products (`lib/products.ts`) |
| `/products/[slug]` | Product details and the $5 quote checkout (sign-in required) |
| `/signin` | Google and GitHub OAuth sign-in |
| `/play` | Byte Catcher game, full size |
| `/donate` | Razorpay donations (INR) |
| `/awt-hospital-demo`, `/awt-workflow`, `/awt-ppt` | AWT Hospital ERP demo, workflow and deck |
| `/awt-final` | SM Imperial Hospital ERP, a role-based hospital ERP built in `app/awt-final`. It runs entirely in the visitor's browser and keeps its data in localStorage |

The Byte chat assistant on every page calls Claude through `/api/chat`.

## Run locally
```bash
pnpm install
cp .env.example .env.local   # fill in what you need
pnpm dev
```
Every integration is optional: without keys, sign-in buttons show as unavailable, checkout explains payments aren't set up, the chat answers from built-in product data, and leads are logged to the server console.

## Environment variables
See `.env.example`. On Vercel add them under Project → Settings → Environment Variables, then redeploy.

- **OAuth redirect URIs**: `https://<domain>/api/auth/callback/google` and `https://<domain>/api/auth/callback/github`.
- **Razorpay**: the $5 quote is charged in USD, which requires International Payments on the Razorpay account.

## SM Imperial Hospital ERP (`/awt-final`)
The ERP lives in `app/awt-final/erp`. `core/` holds types, master data, RBAC and the storage layer; `services/` holds one module per domain service (patients, OPD, emergency, IPD, OT, nursing, diagnostics, pharmacy, billing and TPA, security, identity), each owning its own localStorage collections and talking to others over an in-process event bus; `ui/` and `modules/` hold the screens. Swap the `StorageAdapter` in `core/store.ts` for an HTTP client to move data to a real backend. Demo logins are listed on the login screen (password `sm@123`); Admin → System can reset the demo data.

## Adding a product
Add an entry to `products` in `lib/products.ts`. The store, product page, sitemap, footer and AI assistant pick it up automatically.
