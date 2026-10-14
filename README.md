# CDN Survey

Offline-first surveys for CDN field servers. Data lives on disk under `survey/data/` (no database). Two packages: a deployable runtime and a browser-only JSON creator.

**Full technical reference (canonical):** [docs/DEVELOPER_WIKI.md](./docs/DEVELOPER_WIKI.md)

## Packages

| Path | Role |
|------|------|
| [`survey/`](./survey/) | Portal, admin, taker, APIs — production port **3050** |
| [`creator/`](./creator/) | Builds `*-cdn-survey.json` for admin import |
| [`docs/DEVELOPER_WIKI.md`](./docs/DEVELOPER_WIKI.md) | Architecture, schemas, every API, flows, quirks, install/update |

## Quick start

```bash
# Local survey UI + APIs → http://localhost:3000
cd survey && npm install && npm run dev

# Local creator → http://localhost:3000 (use another port if needed)
cd creator && npm install && npm run dev
```

```bash
# CDN server (WorkingDirectory usually /home/pi/cdn-survey/survey)
cd survey && chmod +x install.sh && ./install.sh
# → http://<host>:3050   Admin: /admin  (no auth)
```

```bash
# Update server clone (discards local git changes)
./update.sh && cd survey && ./install.sh
```

| Context | Port |
|---------|------|
| Production survey | **3050** |
| Local `npm run dev` (either app) | **3000** |

## How the pieces fit

1. Build or edit a survey in **creator** (or admin create).
2. Import JSON on `/admin` (filename must contain `cdn-survey`).
3. Toggle **visible** so it appears on `/`.
4. Respondents submit → `data/{id}-results.csv` (includes `Timestamp`).

Infra in this repo: `survey/install.sh`, `update.sh`, `survey/cdnsurvey.service`. No Docker, Terraform, or CI configs.

## Admin capabilities

1. Create / edit / delete surveys  
2. Show or hide on the public portal (imports start hidden; creates often omit `visible`)  
3. View results; download CSV / ZIP  
4. Import / export `*-cdn-survey.json`  

See the wiki for edit/import quirks (new id on edit, ZIP path matching, no auth).

## Module tip

Copy [`survey/public/card.webp`](./survey/public/card.webp) into your modules location and register port `3050`.  
Suggested description: `CDN Survey - A simple survey form for offline use.`

## Deploy note

Needs writable `survey/data/`. Not suitable for Vercel or other read-only hosts.
