# Khata — Expense Ledger (MERN) — Sprint 1 baseline

Authorized local classroom use only. Use a dedicated disposable MongoDB database and synthetic data. Do not deploy this baseline publicly.

## Setup (Node.js 22 LTS)
1. In PowerShell: `cd backend`, `npm install`, `Copy-Item .env.example .env`.
2. Edit `backend/.env`. Atlas: use a dedicated lab database, a restricted DB user, and your current IP in Network Access. Local MongoDB: use `mongodb://127.0.0.1:27017/khata_lab`. Never commit the connection string.
3. Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and paste it into `JWT_SECRET`.
4. `npm run dev` in backend, then check http://localhost:5000/api/health.
5. Second terminal from project root: `cd frontend`, `npm install`, `npm run dev`. Open http://localhost:5173. Both servers bind to loopback; run ZAP on the same machine.
6. Register two test users with distinct emails. Log in, add, edit, list, delete, log out. The JWT is held in memory (refresh = logged out); tokens expire after 1 hour and are not revoked.

## Baseline security state
Implemented: bcrypt hashing, JWT verification, protected expense routes, restricted CORS, env configuration, .gitignore, ownership enforced on list/update/delete.
Intentional baseline gaps (for the Sprint 1 lifecycle):
- `routes/expenses.js`: `Expense.create(req.body)` (custom Semgrep rule target); PUT also passes `req.body` through. No explicit type validation or field allowlisting.
- `routes/expenses.js`: `GET /api/expenses/:id` has no ownership check (verify with two accounts).
- `server.js`: Helmet absent. Routes return `error.message` and `stack` on failures. Vite serves its own headers separately.
- No secrets are embedded. A clean TruffleHog scan is valid. Keep raw scan results private.
- Custom rule is in `semgrep-rules/`; reports and workflow are created during the procedure. Commit `package-lock.json` files for later `npm ci`.

## API
GET /api/health (public); POST /api/auth/register; POST /api/auth/login; GET /api/auth/me (Bearer); GET/POST /api/expenses; GET/PUT/DELETE /api/expenses/:id (Bearer).
Expense fields: title, amount, category, date, notes. The server sets createdBy.

## Preserve baseline
From root: `git init; git add .; git status` (verify no .env or raw reports staged), then
`git commit -m "Initial MERN application baseline"` and `git tag baseline-v1`.

## Version 2 (remediated)
See `docs/REMEDIATION_V2.md` for the full change log, re-scan commands and manual tests.
Backend needs `JWT_SECRET` (32+ characters). Frontend: `npm run serve` serves the production build on :5173.
