# Khata v2: remediation log and re-scan guide

Baseline = tag `baseline-v1` (untouched). This is v2 (branch `remediation-v2`, tag `remediated-v2`).
Use only on your own local instance with synthetic data.

## 1. What changed (finding -> fix -> how to verify)

| ID | Finding (source) | Fix in v2 | Verify |
|---|---|---|---|
| V01 | Missing security headers: CSP, anti-clickjacking, nosniff, X-Powered-By, CSP-no-fallback (ZAP, Semgrep `express-missing-helmet`) | `helmet()` with an API-specific CSP, `x-powered-by` disabled, JSON 404 handler, `Cache-Control: no-store` on `/api`; security headers on the Vite production build (`vite.config.js`) | `curl.exe -I` both servers; Semgrep 0; ZAP alerts gone |
| V02 | Insufficient input validation / mass assignment (Semgrep `direct-request-body-in-create`, lines 13 and 45) | `utils/validate.js` allowlist + type checks; `createdBy` only from the token; `runValidators` | Bad-data request returns 400; `createdBy` in body ignored |
| V03 | Hardcoded fallback secret (Semgrep `hardcoded-fallback-jwt-secret`) | No fallback; startup fails if `JWT_SECRET` missing or shorter than 32 chars; `.env` gitignored | Semgrep 0; TruffleHog git scan; `git check-ignore backend/.env` |
| V04 | Missing ownership checks on GET/PUT/DELETE by id (Semgrep x3, manual IDOR) | `findOne` / `findOneAndUpdate` / `findOneAndDelete` filtered by `createdBy`; ObjectId format check | User A gets 404 on User B's record (read, edit, delete) |
| V05 | Error disclosure, 7 stack-trace leaks (Semgrep) | `asyncHandler` + central `errorHandler`; generic 500; details only in server log | Force an error: response is `{"message":"Internal server error"}` |
| V06 | NoSQL operator injection risk (manual review) | Type checks on all inputs, `mongoose.set("sanitizeFilter", true)` | `{"email":{"$ne":null}}` login returns 400 |
| V07 | JWT and user stored in `localStorage` (ZAP) | Session kept in memory only (`frontend/src/api.js`) | ZAP localStorage alerts gone |
| V08 | Google Fonts: SRI missing, cross-domain, HSTS noise (ZAP) | Fonts self-hosted via `@fontsource`; no third-party requests | ZAP shows only localhost sites |
| H01 | Hardening: brute force, large bodies, weak passwords, JWT algorithm | `express-rate-limit` on register/login (default 20 per 15 min), `express.json({limit:"10kb"})`, password 8-72, `algorithms:["HS256"]`, bcrypt cost 12, CORS methods/headers listed | 429 after too many attempts; 413 on large body |

## 2. Run v2
```powershell
git checkout -b remediation-v2
# copy this zip's backend/, frontend/, semgrep-rules/, docs/ over your repo (keep your .env, .git, reports/, .github/)
cd backend; npm install          # .env needs JWT_SECRET of at least 32 chars
npm run dev                      # :5000
cd ..\frontend; npm install
npm run serve                    # builds, then serves the production build on :5173
```
Scan the `serve`/`preview` build, not `npm run dev` (the dev server needs inline scripts for hot reload).
Open DevTools -> Console and use the whole app once. There should be no "Content Security Policy" violation messages. If there are, send them to me.

## 3. Re-scan (same procedure as baseline, outputs to `reports/after/`)
```powershell
semgrep scan --config auto --exclude node_modules --exclude dist --exclude build --exclude reports --json --output reports/after/semgrep.json .
semgrep scan --config semgrep-rules/ --json --output reports/after/semgrep-custom.json backend/
semgrep scan --config semgrep-rules/ backend/ > reports/after/semgrep.txt
trufflehog git "file://$(pwd)" --no-verification --json > reports/after/trufflehog-git.json
```
ZAP: new session, same context (`localhost:5000` and `localhost:5173`), manual exploration with two synthetic users, then the authenticated active scan. Set `RATE_LIMIT_MAX=10000` in `backend/.env` while the active scan runs, then put it back. Save the report as `reports/after/zap-report.html` and redact tokens, emails and passwords.

## 4. Manual tests (User A logged in, User B's expense id known)
| Test | Expected in v2 |
|---|---|
| A reads / edits / deletes B's expense | 404 |
| `GET /api/expenses/abc` | 400 `Invalid expense id` |
| `POST /api/expenses` with `{"title":"","amount":"abc"}` | 400 |
| `PUT` with extra `"createdBy"` field | ignored, owner unchanged |
| Malformed JSON body | 400 `Invalid JSON body` |
| Login with `{"email":{"$ne":null},"password":"x"}` | 400 |
| No token on `/api/expenses` | 401 |
| Register, login, CRUD, logout in the UI | all work |

## 5. Expected header check
`curl.exe -I http://localhost:5000/api/health` should show: Content-Security-Policy (default-src 'none'...), X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy, Strict-Transport-Security, Cache-Control: no-store, and no X-Powered-By.
`curl.exe -I http://localhost:5173/` should show CSP, X-Frame-Options: DENY, nosniff, Permissions-Policy.

## 6. Residual risks to state in your report
- Tokens are not revoked server-side; they simply expire after 1 hour.
- No HTTPS in the lab, so HSTS has no effect locally.
- The rate limiter is in-memory and per process.
- Registration reveals whether an email exists (409).
- ZAP Informational items (for example "Modern Web Application") need no fix.
- Scanners cannot prove the absence of vulnerabilities: report "no findings from these tools", not "no vulnerabilities".
