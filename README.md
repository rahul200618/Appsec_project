# Khata — Expense Ledger (MERN, Cybersecurity Sprint 1)

Individual MERN project used to demonstrate the DevSecOps lifecycle:
baseline -> Semgrep / ZAP / TruffleHog -> risk assessment -> remediation -> retest -> GitHub Actions -> report.

## Run locally
```bash
# backend
cd backend && cp .env.example .env   # fill MONGO_URI and JWT_SECRET (never commit .env)
npm install && npm run dev            # http://localhost:5000

# frontend (second terminal)
cd frontend && npm install && npm run dev   # http://localhost:5173
```

Use synthetic data only. Test only your own local instance.
