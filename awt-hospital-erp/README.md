# AWT Hospital ERP

Single-page hospital ERP made for AWT Hospital by Opulence Byte. Modules: Dashboard, Reception, OPD, IPD, Bed Mapping, Doctors, Pharmacy, Investigations, OT, Inventory, Assets, Billing & Payments, Corporate/TPA, Reports, Queries, Admin, Masters and Miscellaneous.

No framework and no build dependencies: plain HTML, CSS and JavaScript.

## Run it
Open `dist/index.html` in any modern browser. You don't need a server.

- It opens with a sample hospital, dated around the day you open it.
- Changes are saved in that browser's localStorage (key `awt-erp-local-v1`).
- To start over, clear site data or use **Admin → Reload sample data**.
- The only outside request is to Google Fonts (Figtree). Without it, the page falls back to system fonts.

## Two storage modes
`src/app.html` → `boot()` checks for a storage backend:

| Mode | When | Where data lives |
|---|---|---|
| Live | Running as a Claude artifact (`window.claude.use('db')` is available) | Shared document database, updated live for every viewer |
| Offline | Anywhere else (a local file, your own web host) | Browser localStorage, one copy per browser |

All reads and writes go through `save(col, obj)`, `remove(col, id)` and the `D` in-memory maps. To connect a real backend (Firebase, Supabase, a REST API), replace those two functions and the snapshot loader in `boot()`.

## Structure
```
src/app.html          UI shell, styles and all application logic
src/sample-data.js    awtGenerate(date): builds the sample hospital
build.py              inlines sample-data.js into app.html, writes dist/
dist/index.html       standalone page, opens directly in a browser
dist/artifact.html    the same page without the <html> wrapper, as published
seed-data/            sample dataset as JSON (dated 2026-09-23)
```
To rebuild after editing `src/`, run `python3 build.py`.

## Data model (one collection per register, one document per record)
`patients`, `visits` (OPD), `admissions` (IPD, with `payments[]` and `charges[]`), `beds` (only maintenance/blocked overrides; occupancy is worked out from admissions), `doctors`, `pharmacy`, `sales`, `labs`, `ot`, `inventory`, `assets`, `queries`, `receipts`, `masters` (departments, tests, wards, tpa, staff, notices).

Collections are not stored anywhere. The ledger adds up OPD fees, IPD payments, pharmacy sales, lab orders and other receipts.

## Not yet included
- Login and role-based permissions: every user has full access.
- Printable bills and discharge summaries.
- Integration with other hospital systems (HL7/FHIR).
