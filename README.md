# Selk — Code Backup

Backup of the three Selk code bases that run on the production VPS.

```
IV/
├── selk-iv/     Original static HTML/CSS/JS frontend (legacy)
├── selk-api/    Express REST API + PostgreSQL (legacy)
└── selk-next/   Next.js 15 full-stack app (current production)
```

- **selk-next** is what currently serves https://selk.om.
- **selk-iv** and **selk-api** are kept for reference while the migration settles.

Secrets (`.env`, `.env.local`) are excluded from this backup — copy them from the VPS directly when restoring.
