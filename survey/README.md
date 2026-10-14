# CDN Survey (runtime)

Deployable Next.js app for offline survey collection on CDN servers. UI: App Router. APIs: Pages Router. Data: filesystem under `data/`.

**Canonical docs:** [../docs/DEVELOPER_WIKI.md](../docs/DEVELOPER_WIKI.md)

## Quick start (local)

```bash
npm install
npm run dev
# http://localhost:3000
```

## Production install

```bash
chmod +x install.sh
./install.sh
# systemd → next start -p 3050
```

| Script | Purpose |
|--------|---------|
| `npm run dev` | Turbopack dev (**3000**) |
| `npm run build` | Production build |
| `npm run start` | Production server (**3050**) |
| `npm run lint` | Lint |

## What lives here

| Area | Location |
|------|----------|
| UI routes | `app/` |
| API contracts | `pages/api/` |
| Survey types | `types/survey.ts` |
| Runtime data | `data/` (gitignored contents) |
| Systemd unit | `cdnsurvey.service` |

Import filenames must contain `cdn-survey`. Results CSV includes `Timestamp` and locked header migration. Admin **edit** is POST (server assigns new `Date.now()` id) then DELETE old id — prior results CSV stays under the old id. See the wiki for full quirks.

Requires writable `data/`. Not for Vercel.
