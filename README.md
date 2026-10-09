# Union Peak Bank – Complete Version

Standard Vite + React + TypeScript + Tailwind CSS banking application.

## Features

### Customer
- Sign Up / Login (creates 6-digit Confirmation PIN + 4-digit Transaction PIN)
- 3 swipeable professional balance cards (Checking, Savings, Bitcoin)
- Bitcoin address with Copy button
- Working Dark / Light theme toggle
- Add Money (Bank/Debit/Instant → instructions sent to email; Bitcoin works)
- Full Transfer forms (ACH, Zelle, Domestic Wire, SWIFT, Bill Pay)
- Security flow: 2-3s loading → 6-digit code → 4-digit PIN → 15s loading → receipt
- Cards (view, freeze/unfreeze, request new)
- Mobile Check Deposit
- Neutral statuses only (no "admin" wording)

### Admin (/admin)
- Login: adminblessed / Blessed321$
- Full user list + search
- Edit Checking / Savings / Bitcoin balances
- Set Bitcoin deposit address
- Generate 6-digit security codes for transfers
- Approve / Reject Check Deposits (credits funds on approve)
- Approve Beneficiaries
- Freeze / Unfreeze cards
- Full account freeze with message
- Per-user feature toggles
- Create & manage Sub-Admins (assigned to one customer)
- Sub-admins only see their assigned customer

## Run locally

cd union-peak-bank
npm install
npm run dev

Customer: http://localhost:5173
Admin: http://localhost:5173/admin

## Deploy (one time)

Vercel (recommended)
1. Push folder to GitHub
2. Import on vercel.com → Deploy

Netlify
1. Go to app.netlify.com/drop
2. Drag the union-peak-bank folder

Build: npm run build
The dist folder is ready to host.
