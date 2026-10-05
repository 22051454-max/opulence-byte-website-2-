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
| `/awt-final` | AWT Hospital HMS, the full app. Static files in `public/awt-final`; it runs entirely in the visitor's browser and keeps its data there |

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

## Updating AWT Hospital HMS (`/awt-final`)
`public/awt-final` is the standalone build of the AWT Hospital HMS project (React client plus the Express server code compiled for the browser, with SQLite in WebAssembly). To update it, run `npm run build:standalone` in that project's `client` folder and copy `client/dist-standalone/` over `public/awt-final/`.

## Adding a product
Add an entry to `products` in `lib/products.ts`. The store, product page, sitemap, footer and AI assistant pick it up automatically.
