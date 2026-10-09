# CDN Survey — Developer Wiki

Definitive internal reference for maintainers and onboarding developers.  
Everything below is derived from the current repository. Where behavior is surprising, it is documented as implemented—not as an ideal design.

**Persistence:** local files under `survey/data/` (no database).  
**Infra in repo:** `survey/install.sh`, root `update.sh`, `survey/cdnsurvey.service`.  
**Not in repo:** Docker, Compose, Terraform, GitHub Actions/CI, `.env` files, authentication.

---

## Start here

| Goal | Commands / URL |
|------|----------------|
| Run survey locally | `cd survey && npm install && npm run dev` → http://localhost:3000 |
| Run creator locally | `cd creator && npm install && npm run dev` → http://localhost:3000 |
| Production install | `cd survey && chmod +x install.sh && ./install.sh` → port **3050** |
| Update server clone | `./update.sh` then `cd survey && ./install.sh` |
| Admin | http://\<host\>:3050/admin (or :3000 in dev) |
| Public portal | http://\<host\>:3050/ |

**Smoke test**

1. Creator `/create` → download `{title}-cdn-survey.json`.
2. Survey `/admin` → Import (name must contain `cdn-survey`).
3. **Show** the survey → open `/` → take it → submit.
4. Confirm `survey/data/surveys.json` and `survey/data/{id}-results.csv` (column `Timestamp`).

---

## Table of contents

1. [What this system is](#1-what-this-system-is)
2. [Repository map](#2-repository-map)
3. [Runtime architecture (survey)](#3-runtime-architecture-survey)
4. [UI routes & user flows](#4-ui-routes--user-flows)
5. [Data storage & schemas](#5-data-storage--schemas)
6. [API contracts](#6-api-contracts)
7. [Client ↔ API usage map](#7-client--api-usage-map)
8. [UI component map](#8-ui-component-map)
9. [Creator app](#9-creator-app)
10. [Infrastructure](#10-infrastructure)
11. [Local development](#11-local-development)
12. [Production operations](#12-production-operations)
13. [Known pitfalls & quirks](#13-known-pitfalls--quirks)
14. [Onboarding checklist](#14-onboarding-checklist)
15. [Appendix](#15-appendix)

---

## 1. What this system is

CDN Survey is an **offline-first** survey stack for CDN field servers.

| Package | Audience | Persistence | Default port |
|---------|----------|-------------|--------------|
| **`survey/`** | CDN servers (respondents + operators) | Files under `survey/data/` | **3050** prod · **3000** `next dev` |
| **`creator/`** | Anyone with a browser | None (download JSON only) | **3000** |

```
creator (/create|/edit)
    → download *-cdn-survey.json
    → survey /admin Import
    → toggle visible
    → respondents: / → /survey/[id]
    → answers: data/{id}-results.csv (+ JSON snapshot + uploads)
```

There is **no login**. `/admin` is reachable by anyone who can reach the host/port.

---

## 2. Repository map

```
cdn-survey-1/
├── README.md
├── update.sh                      # git fetch + hard reset to origin/main
├── docs/
│   ├── README.md                  # pointer
│   └── DEVELOPER_WIKI.md          # this file
├── survey/                        # deployed Next.js runtime
│   ├── app/                       # App Router UI
│   ├── pages/api/                 # Pages Router APIs
│   ├── components/ui/             # Taker UI kit
│   ├── hooks/useSurveyState.ts
│   ├── lib/data.ts                # surveys.json helpers (partially used)
│   ├── types/survey.ts            # canonical runtime types
│   ├── data/                      # runtime storage (contents gitignored)
│   ├── public/                    # static assets (e.g. card.webp)
│   ├── install.sh
│   ├── cdnsurvey.service
│   └── package.json
└── creator/                       # online JSON builder
    ├── app/                       # /, /create, /edit, /view
    ├── components/                # older form widgets for /view
    ├── types/survey.ts            # subset of survey types
    └── package.json
```

---

## 3. Runtime architecture (survey)

| Layer | Implementation |
|-------|----------------|
| Framework | Next.js `^15.5.15`, React `^19` |
| UI routing | **App Router** — `survey/app/**` |
| HTTP APIs | **Pages Router** — `survey/pages/api/**` |
| Styling | Tailwind 3 + CSS variables (`globals.css`) |
| Fonts | Local woff2 via `next/font/local`: Inter-Bold (`--font-heading`), Arimo-Regular (`--font-body`) in `app/layout.tsx` |
| Storage | Filesystem; `process.cwd()` must be `survey/` when APIs run |
| Process (prod) | systemd → `npm run start` → `next start -p 3050` |

### Metadata

From `app/layout.tsx`: title `CDN Survey Application`; description `A mobile-first field data collection survey tool.`

### Notable dependencies (why they exist)

| Package | Used for |
|---------|----------|
| `formidable` | Multipart parse on `/api/upload` and `/api/surveys/[id]/results` |
| `csv-writer` / `csv-parser` | Write/read results CSV |
| `uuid` | Collision-safe per-submission JSON filenames |
| `jszip` + `file-saver` | Admin “Save Results (.zip)” in the browser |
| `react-icons` | Admin / portal / taker icons |
| `multer` / `busboy` / `express` | Present in `package.json`; used by legacy `/api/server`, not by current App Router UI |

### `lib/data.ts` vs inline `fs`

| Helper | Used by |
|--------|---------|
| `getSurveyById(id: number)` | `POST` results handler — title for JSON filename only |
| `readSurveys` / `writeSurveys` / `updateSurvey` / `deleteSurveyById` / `addSurvey` | Defined; **current route handlers mostly read/write `surveys.json` inline** instead |

`getSurveyById` uses strict `===` with a **number**. String ids (if any) will not match; title falls back to `"survey"`.

---

## 4. UI routes & user flows

### Route table

| Path | File | Role |
|------|------|------|
| `/` | `app/page.tsx` | Public portal — lists surveys where `survey.visible` is truthy |
| `/survey/[id]` | `app/survey/[id]/page.tsx` | Stepped taker → review → submit |
| `/admin` | `app/admin/page.tsx` | Dashboard: search, CRUD links, import/export, visibility, delete |
| `/admin/create` | `app/admin/create/page.tsx` | Create survey → `POST /api/surveys` |
| `/admin/edit/[id]` | `app/admin/edit/[id]/page.tsx` | Edit → `POST` new + `DELETE` old (see quirks) |
| `/admin/results/[id]` | `app/admin/results/[id]/page.tsx` | Table from CSV + ZIP download |

### Public portal

1. `GET /api/surveys`.
2. Client filter: `surveys.filter((s) => s.visible)`.
3. Navigate to `/survey/[id]`.

### Admin create

- Fields offered in UI: `text`, `textarea`, `radio`, `checkbox`, `date`, `number`, `file`, `email` (**not** `select` / `rating`).
- POST body: `{ title, description, formFields }` — **does not set `visible`** (typically falsy until Show).
- Server assigns `id: Date.now()`.

### Admin edit (important)

```
1. GET /api/surveys/[id]
2. On save: POST /api/surveys with body { ...survey, id: "survey_" + Date.now() }
3. DELETE /api/surveys/[oldId]
```

`POST /api/surveys` **always overwrites** `id` with `Date.now()` (number). The client’s `survey_*` string id is **discarded**.  
Effect: survey gets a **new numeric id**; old `{oldId}-results.csv` is **orphaned** (not migrated).

### Admin import / export

| Action | Rules |
|--------|-------|
| Import | File must be `.json` pick; **filename must include** substring `cdn-survey`. Sets `visible: false`. Same title → confirm overwrite → `PUT /api/surveys/{existingId}` with imported body (often **no `id` in body**). New title → `POST /api/surveys`. |
| Export | `GET /api/surveys/[id]` → download `{title}-cdn-survey.json` (pretty-printed full survey object, including `id` / `visible`). |
| Search | Client filter on title + description (case-insensitive). |
| Delete | Confirm → `DELETE /api/surveys/[id]` — **does not** delete CSV/JSON/uploads. |

### Taker flow (`/survey/[id]`)

1. Load survey: `GET /api/surveys/[id]`.
2. `useSurveyState` drives steps; `currentStep === formFields.length` is the **review** step.
3. Connectivity: `GET /api/server-ping` immediately and every **5000 ms**, `Cache-Control: no-cache`. Failure or non-OK → `isOffline = true` → `NetworkStatusBanner`; submit/upload blocked while offline.
4. Validation on Next (per step):
   - Required: empty string / null / undefined / empty array → `"This question is required."`
   - Email: `/\S+@\S+\.\S+/` → `"Please enter a valid email address."`
5. Auto-advance: **radio** and **rating** call `nextStep` after **500 ms**.
6. File fields: `POST /api/upload` with field name `file`; response stored as `{ name, url }` in local state.
7. Submit builds `FormData`:
   - Arrays (checkbox) → `join(", ")`
   - File → `responseValue.url` (e.g. `/data/uploads/...`)
   - Else → `String(value || "")`
8. `POST /api/surveys/[id]/results` → on OK show `SurveyCompletionScreen`.

Default rating max in UI: `currentField.maxRating || 10`.

---

## 5. Data storage & schemas

All paths relative to `survey/` when the process runs (`WorkingDirectory` / `cwd`).

### Directory layout

| Path | Role |
|------|------|
| `data/surveys.json` | JSON **array** of surveys |
| `data/{id}-results.csv` | Aggregated responses for that survey id |
| `data/{id}-results.csv.lock` | Exclusive lock during CSV write |
| `data/{sanitized-title}-{iso-uuid}.json` | Per-submission snapshot |
| `data/uploads/` | Uploaded files |
| `data/.gitignore` | Ignore all contents except itself |

### Survey document

Canonical TypeScript: `survey/types/survey.ts`.

| Field | Type in practice | Notes |
|-------|------------------|-------|
| `id` | `number` (typical) | Assigned by `POST /api/surveys` as `Date.now()`. Types allow loose usage; API `[id]` routes compare with `String(survey.id)`. |
| `title` | `string` | Export name; sanitized for result JSON filenames |
| `description` | `string` | Shown on portal cards / taker |
| `visible` | any / boolean-like | Portal uses truthy check; import forces `false`; create often omits it |
| `formFields` | `SurveyField[]` | Order = taker step order |

#### Field types

| `type` | Extra | In admin/creator create UI? | In taker UI? |
|--------|-------|----------------------------|--------------|
| `text` | — | Yes | Yes (`InputText`) |
| `textarea` | — | Yes | Yes |
| `radio` | `options: string[]` | Yes | Yes (auto-advance) |
| `checkbox` | `options: string[]` | Yes | Yes |
| `date` | — | Yes | Yes (`InputText type=date`) |
| `number` | — | Yes | Yes |
| `file` | — | Yes | Yes (`InputFile` + `/api/upload`) |
| `email` | — | Yes | Yes + email regex |
| `select` | `options: string[]` | **No** | Yes (`InputSelect`) |
| `rating` | `maxRating?: number` | **No** | Yes (`RatingScale`, default max 10) |

Shared on every field: `question: string`, optional `required?: boolean`.  
`question` text is the FormData key and CSV column header.

#### Example stored survey

```json
{
  "id": 1716720000000,
  "title": "Community Feedback",
  "description": "Optional description.",
  "visible": true,
  "formFields": [
    { "type": "text", "question": "Your name", "required": true },
    {
      "type": "radio",
      "question": "Satisfaction",
      "options": ["Low", "Medium", "High"],
      "required": true
    }
  ]
}
```

#### Creator export (pre-import)

```json
{
  "title": "Community Feedback",
  "description": "Optional description.",
  "formFields": []
}
```

Filename: `{title || "survey"}-cdn-survey.json`.

### Results CSV

| Aspect | Spec |
|--------|------|
| Path | `data/{id}-results.csv` (`id` from URL, string as in the request) |
| Columns | Keys from submission object = question texts + **`Timestamp`** |
| Timestamp | `new Date().toISOString().substring(0, 16)` → `YYYY-MM-DDTHH:mm` |
| Checkbox cells | Client joins with `", "` before POST |
| File cells (taker path) | Usually `/data/uploads/{originalFilename}` from upload API |
| File cells (if multipart files on results POST) | `data/uploads/{basename}` (no leading slash) |

#### Per-submission JSON

- Title sanitized: lowercase, non-alphanumeric → `-`, trim edges; fallback `survey`.
- Filename: `{sanitized}-{ISO-with-[:.]-replaced}-{uuid}.json`
- Body: same map as the CSV row (includes `Timestamp`)
- Title lookup: `getSurveyById(parseInt(id, 10))` — if id is not a plain integer matching a survey, title becomes `"survey"`

#### CSV migration & locking

See [Appendix A](#a-csv-write--lock-algorithm). Summary: exclusive `.lock` file; rewrite entire CSV when new columns appear or header lacks `Timestamp`; otherwise append.

---

## 6. API contracts

Base (production): `http://<host>:3050`  
Source: `survey/pages/api/`.

Unless noted, JSON request/response. Multipart routes disable the Next body parser.

### `GET /api/surveys`

| | |
|--|--|
| **File** | `surveys/index.ts` |
| **Behavior** | Ensure `surveys.json` exists (init `[]`); parse; sort `b.id - a.id` (newest-first for numeric ids); return array |
| **200** | `Survey[]` |
| **500** | `{ "error": "Failed to process survey data" }` |
| **405** | Non GET/POST |

### `POST /api/surveys`

| | |
|--|--|
| **Body** | Any survey-like JSON (`title`, `description`, `formFields`, optional others) |
| **Server** | `const newSurvey = { ...req.body, id: Date.now() }` — **always** replaces `id` |
| **201** | Created survey object |
| **500** | `{ "error": "Failed to process survey data" }` |

### `GET /api/surveys/[id]`

| | |
|--|--|
| **Match** | `String(survey.id) === id` |
| **200** | Survey object |
| **404** | `{ "error": "Survey not found" }` |
| **400** | `{ "error": "Invalid survey ID" }` if `id` query not a string |

### `PUT /api/surveys/[id]`

| | |
|--|--|
| **Body** | **Replaces** the array entry entirely with `req.body` (not a merge) |
| **200** | `{ "message": "Survey updated successfully" }` |
| **404** | `{ "error": "Survey not found" }` |

### `DELETE /api/surveys/[id]`

| | |
|--|--|
| **200** | `{ "message": "Survey deleted successfully" }` |
| **Side effects** | Only removes entry from `surveys.json` |

Allowed methods on `[id].ts`: `GET`, `PUT`, `DELETE`.

### `PUT /api/surveys/[id]/toggle-visibility`

| | |
|--|--|
| **Body** | `{ "visible": boolean }` |
| **Match** | `s.id === Number(id)` — **numeric coercion**; string ids may not match |
| **200** | `{ "message": "Visibility updated successfully" }` |
| **404** | `{ "error": "Survey not found" }` |
| **500** | `{ "error": "Failed to update visibility" }` |

### `POST /api/surveys/[id]/results`

| | |
|--|--|
| **Config** | `bodyParser: false`; formidable → `data/uploads`, `keepExtensions: true` |
| **Body** | `multipart/form-data`; text fields + optional file parts |
| **Processing** | First value of array fields; file parts → `data/uploads/{basename}`; inject `Timestamp`; write JSON snapshot; locked CSV append/rewrite |
| **201** | `{ "message": "Results saved successfully" }` |
| **400** | Invalid id |
| **500** | `{ "error": "An unexpected error occurred" }` |

### `GET /api/surveys/[id]/results`

| | |
|--|--|
| **200** | `any[]` rows via `csv-parser` |
| **404** | `{ "error": "Results not found" }` |

Note: the **admin results page does not call this**; it uses `results-csv` and parses in the browser.

### `GET /api/surveys/[id]/results-csv`

| | |
|--|--|
| **200** | Raw CSV text (`res.send`) |
| **404** | `{ "error": "Results not found" }` |
| **400** | Invalid id |
| **500** | `{ "error": "Failed to read the CSV file" }` |

### `POST /api/upload`

| | |
|--|--|
| **Config** | `bodyParser: false` |
| **Body** | Multipart; expects single file field named **`file`** (rejects if missing or array) |
| **Storage** | Renames temp file to `data/uploads/{originalFilename}` |
| **200** | `{ "url": "/data/uploads/{originalFilename}" }` |
| **400** | `{ "error": "No file uploaded" }` |
| **405** | `{ "message": "Method not allowed" }` |
| **500** | `{ "error": "File upload error" }` or `{ "error": "Failed to save file" }` |

### `GET /api/surveys/files/[filename]`

| | |
|--|--|
| **File** | `data/uploads/{filename}` |
| **200** | Binary; `Content-Type: application/octet-stream`; `Content-Disposition: attachment; filename="..."` |
| **404** | `{ "error": "File not found" }` |
| **400** | Invalid filename |
| **500** | `{ "error": "Failed to retrieve file" }` |

### `GET /api/server-ping`

| | |
|--|--|
| **200** | `{ "status": "ok" }` |
| **Methods** | No method check — any method returns 200 |

### Legacy (do not use for new work)

| Path | Notes |
|------|-------|
| `/api/server` | Older monolithic CRUD + multer uploads to `public/uploads/`; not used by current App Router pages |
| `PUT /api/surveys/[id]/edit` | Same replace semantics as `PUT /api/surveys/[id]`; no current UI callers |

---

## 7. Client ↔ API usage map

| UI action | Endpoint(s) |
|-----------|-------------|
| Portal list | `GET /api/surveys` |
| Admin list / search | `GET /api/surveys` (filter client-side) |
| Create | `POST /api/surveys` |
| Load for edit / export / results title | `GET /api/surveys/[id]` |
| Edit save | `POST /api/surveys` then `DELETE /api/surveys/[oldId]` |
| Import new title | `POST /api/surveys` |
| Import overwrite | `PUT /api/surveys/[existingId]` |
| Delete | `DELETE /api/surveys/[id]` |
| Show / hide | `PUT /api/surveys/[id]/toggle-visibility` |
| Taker load | `GET /api/surveys/[id]` |
| File answer | `POST /api/upload` |
| Submit answers | `POST /api/surveys/[id]/results` |
| Offline detection | `GET /api/server-ping` |
| Results table | `GET /api/surveys/[id]/results-csv` (+ client CSV parse) |
| Results ZIP | `GET .../results-csv` + `GET /api/surveys/files/[filename]` for cells starting with `data/uploads/` |

### Admin ZIP packaging (exact behavior)

1. Sanitize title → kebab-case; fallback `survey`.
2. Timestamp for filename: now `YYYY-MM-DDTHH-mm`, **or** first row’s `Timestamp` (trimmed to 16 chars, `:`/`.` → `-`) if present.
3. Base name: `{sanitizedTitle}-{timestamp}`.
4. ZIP contains `{base}.csv` plus, for each cell value that **`startsWith("data/uploads/")`**, file at `data/uploads/{fileName}` inside the zip (fetched via `/api/surveys/files/...`).
5. Download via `file-saver` as `{base}.zip`.

**Implication:** taker submissions that store `/data/uploads/...` (leading slash from `/api/upload`) **do not** match `startsWith("data/uploads/")`, so those uploads are **not** added to the ZIP unless paths were stored without the leading slash.

---

## 8. UI component map

Under `survey/components/ui/`:

| Component | Role |
|-----------|------|
| `SurveyShell` | Layout, title, progress, prev/next chrome |
| `ProgressIndicator` | Step progress |
| `QuestionCard` | Single-question wrapper |
| `NetworkStatusBanner` | Offline banner from `isOffline` |
| `LoadingState` | Loading placeholder |
| `ReviewScreen` | Final review; submit / edit step; respects offline + submitting |
| `SurveyCompletionScreen` | Post-submit; return home |
| `ValidationMessage` | Inline field error |
| `InputText` | text / email / number / date |
| `InputTextarea` | Long text |
| `InputRadioGroup` | Single choice |
| `InputCheckboxGroup` | Multi choice |
| `InputSelect` | Select (runtime-only field type) |
| `InputFile` | File picker |
| `RatingScale` | 1…maxRating buttons; labels “Not Likely” / “Very Likely” |

State machine: `hooks/useSurveyState.ts`.

---

## 9. Creator app

Package name: `cdn-online-create-survey`. Next `15.0.7`, React 19 RC. **No `pages/api`.**

| Route | Behavior |
|-------|----------|
| `/` | Landing: navigate to create / edit / view |
| `/create` | Build fields → download `{title}-cdn-survey.json` → redirect `/` after 1s |
| `/edit` | Upload JSON (name must include `cdn-survey`) → edit → download updated JSON → redirect `/` |
| `/view` | Upload JSON → fill form → “submit” **only validates** and shows success message — **nothing is persisted or uploaded** |

### Creator field types (create/edit UI)

Same eight as admin create: `text`, `textarea`, `radio`, `checkbox`, `date`, `number`, `file`, `email`.

Types file `creator/types/survey.ts` has **no** `select` / `rating` unions (unlike `survey/types/survey.ts`).

### Parity table

| Concern | Creator | Survey runtime |
|---------|---------|----------------|
| Persist surveys | No | `surveys.json` |
| `select` / `rating` | Not in UI/types | In types + taker |
| Import name rule | `cdn-survey` in filename | Same on admin import |
| Auth | N/A | None on `/admin` either |

---

## 10. Infrastructure

### Inventory

| Artifact | Path | Purpose |
|----------|------|---------|
| Install | `survey/install.sh` | deps, build, systemd install/enable |
| Update | `update.sh` | `git fetch --all` + `git reset --hard origin/main` |
| Unit | `survey/cdnsurvey.service` | Production long-running process |

### `install.sh` (run from `survey/`)

1. `apt-get install` `figlet` and `toilet` (banner only).
2. `npm install`
3. `npm run build`
4. `cp cdnsurvey.service /etc/systemd/system/`
5. `systemctl daemon-reload`
6. `systemctl start` + `restart` + `enable` `cdnsurvey.service`

### `cdnsurvey.service`

```ini
[Unit]
Description=CDN Survey, a simple way to take surveys offline.
After=syslog.target network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/pi/cdn-survey/survey
Environment=NODE_ENV=production
ExecStart=npm run start
Restart=always

[Install]
WantedBy=multi-user.target
```

| Setting | Meaning |
|---------|---------|
| `WorkingDirectory` | Must equal the real `survey/` path or APIs write to the wrong place / fail |
| `ExecStart` | `npm run start` → `next start -p 3050` |
| Env | Only `NODE_ENV=production` |

### `update.sh`

```bash
git fetch --all
git reset --hard origin/main
```

Discards local commits/changes on that clone. Always re-run `survey/install.sh` afterward.

### npm scripts

**Survey**

| Script | Command |
|--------|---------|
| `dev` | `next dev --turbopack` |
| `build` | `next build` |
| `start` | `next start -p 3050` |
| `lint` | `next lint` |

**Creator:** `dev` / `build` / `start` / `lint` (start uses default Next port **3000**).

---

## 11. Local development

**Prerequisites:** Node compatible with Next 15, npm, Git.

```bash
cd survey
npm install
npm run dev
# http://localhost:3000
```

```bash
cd creator
npm install
npm run dev
# http://localhost:3000 — override port if survey already bound
```

APIs create `survey/data/` and `data/uploads/` as needed when first used.

Cannot deploy survey to Vercel: needs writable disk.

---

## 12. Production operations

### First install

```bash
git clone <repo-url> /home/pi/cdn-survey
cd /home/pi/cdn-survey/survey
chmod +x install.sh
./install.sh
```

If the clone is not under `/home/pi/cdn-survey/survey`, edit `WorkingDirectory` in the unit before install (or edit the installed unit + `daemon-reload`).

### Verify

```bash
sudo systemctl status cdnsurvey.service
curl -s http://localhost:3050/api/server-ping
# {"status":"ok"}
```

| URL | Audience |
|-----|----------|
| `http://<host>:3050/` | Respondents |
| `http://<host>:3050/admin` | Operators (unauthenticated) |

### Update

```bash
cd /home/pi/cdn-survey
chmod +x update.sh && ./update.sh
cd survey && ./install.sh
sudo systemctl status cdnsurvey.service
```

### Logs

```bash
sudo journalctl -u cdnsurvey.service -f
```

### CDN module tip

Copy `survey/public/card.webp` into the modules location; register port **3050**.  
Suggested description: `CDN Survey - A simple survey form for offline use.`

---

## 13. Known pitfalls & quirks

| Issue | Detail |
|-------|--------|
| **No auth** | Anyone who can reach the host can use `/admin`. |
| **Edit orphans results** | Edit = new `Date.now()` id + delete old definition; `{oldId}-results.csv` remains but is disconnected from the new survey. |
| **Import overwrite drops `id`** | PUT body is imported JSON (often without `id`); entry is fully replaced. |
| **Create omits `visible`** | New surveys usually stay off the portal until Show. |
| **Toggle uses `Number(id)`** | Unlike `[id].ts` string compare; inconsistent matching. |
| **ZIP vs upload URLs** | ZIP packs only values starting with `data/uploads/`; taker stores `/data/uploads/...` from `/api/upload`. |
| **WorkingDirectory** | Wrong path → empty/wrong `data/` or service failure. |
| **`update.sh`** | Hard reset; local server edits are lost. |
| **Type drift** | `select`/`rating` in survey types/taker only; creator/admin create UIs omit them. |
| **Delete is soft for files** | Survey row removed; CSV/JSON/uploads kept on disk. |
| **Sort** | `b.id - a.id` assumes numeric ids; non-numeric ids sort poorly. |
| **Duplicate titles** | Allowed on create; import overwrite keys off title only. |

---

## 14. Onboarding checklist

- [ ] Run `survey` and `creator` with `npm install` + `npm run dev`
- [ ] Create JSON in creator; import on `/admin`; Show; submit one response
- [ ] Inspect `data/surveys.json` and `data/{id}-results.csv` (`Timestamp` present)
- [ ] Read `survey/pages/api/surveys/**` and `survey/types/survey.ts`
- [ ] Read `hooks/useSurveyState.ts` and `app/survey/[id]/page.tsx`
- [ ] Know install is `survey/install.sh`, prod port **3050**
- [ ] Know edit = POST+DELETE (new id), import overwrite = PUT, no auth
- [ ] Skim [Known pitfalls](#13-known-pitfalls--quirks)

If this wiki disagrees with code, trust the code under `survey/pages/api/` and `survey/app/`, then update this file.

---

## 15. Appendix

### A. CSV write & lock algorithm

Implemented in `survey/pages/api/surveys/[id]/results.ts`.

1. **Acquire lock** on `{csvPath}.lock` with `fs.openSync(path, 'wx')`.
   - On `EEXIST`: if lock mtime older than **5000 ms**, unlink and retry; else sleep **50 ms**.
   - Up to **100** retries; then throw (API returns 500).
2. If CSV exists:
   - Parse header with quoted-CSV-aware regex.
   - For each key in the new submission, if missing from headers → add and set `shouldRewrite`.
   - If first line does not include substring `Timestamp` → `shouldRewrite`.
   - If rewriting → `readResultsFile` via `csv-parser` into `existingRecords`.
3. If CSV does not exist → headers = `Object.keys(processedFields)`.
4. `createObjectCsvWriter` with `append: fileExists && !shouldRewrite`.
5. If rewrite → `writeRecords([...existingRecords, processedFields])` once.  
   Else → `writeRecords([processedFields])`.
6. **`finally`:** `releaseLock` (unlink; ignore `ENOENT`).

### B. Field rendering matrix (taker)

| `type` | Component | Special behavior |
|--------|-----------|------------------|
| `radio` | `InputRadioGroup` | Auto-next after 500 ms |
| `checkbox` | `InputCheckboxGroup` | Array → joined on submit |
| `select` | `InputSelect` | — |
| `rating` | `RatingScale` | Auto-next; default max 10 |
| `textarea` | `InputTextarea` | — |
| `text` / `email` / `number` / `date` | `InputText` | Email validated in hook |
| `file` | `InputFile` | Upload via `/api/upload` first |

### C. Related package READMEs

- [Root README](../README.md) — short entry point  
- [survey/README.md](../survey/README.md)  
- [creator/README.md](../creator/README.md)  
