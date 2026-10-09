# CDN Online Survey Creator

Browser-only Next.js app that builds survey JSON for import into the [survey runtime](../survey/). No API routes and no server-side storage.

**Canonical docs:** [../docs/DEVELOPER_WIKI.md](../docs/DEVELOPER_WIKI.md)

## Quick start

```bash
npm install
npm run dev
# http://localhost:3000
```

## Routes

| Path | Behavior |
|------|----------|
| `/` | Landing |
| `/create` | Build → download `{title}-cdn-survey.json` |
| `/edit` | Upload `*cdn-survey*.json` → edit → re-download |
| `/view` | Local preview (no persistence) |

## Export contract

```json
{
  "title": "...",
  "description": "...",
  "formFields": []
}
```

Admin import on the survey app requires `cdn-survey` in the filename. Imported surveys start with `visible: false`.

Creator UI field types: `text`, `textarea`, `radio`, `checkbox`, `date`, `number`, `file`, `email`. The survey runtime also supports `select` and `rating` (types are not shared as a package — drift is possible).
