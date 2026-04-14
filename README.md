# Voyari

**AI destekli kişiselleştirilmiş tatil planlayıcısı — gulet, road trip, karavan, cruise ve daha fazlası.**

Voyari, seyahat DNA'nızı anlayan ve uçtan uca lüks bir tatil dosyası üreten bir AI Travel Architect'tir. Ocianix tarafından geliştirilmiştir.

Live: <https://voyari.ocianix.com>

---

## Brand

**Ton:** lüks, sinematik, zarif. Türkçe UI — akıcı, güven veren, aşırı teknik olmayan dil. Dark + gold palette, Playfair Display başlıklar, DM Sans gövde.

## Stack

- **Framework:** Next.js 16 (App Router, React 19, Turbopack)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 + custom dark+gold luxury tokens
- **State:** Zustand (`persist` middleware)
- **AI:** Google Gemini (primary) + Anthropic Claude (fallback) via unified provider layer
- **Maps:** Leaflet + react-leaflet (dynamic, client-only)
- **Charts:** Recharts (client-only)
- **Animations:** Framer Motion
- **Export:** jsPDF + html2canvas (PDF, client-only), native Markdown
- **Runtime:** Edge (all `/api/*` routes)
- **Deploy:** Cloudflare Pages (`@cloudflare/next-on-pages`)

## Architecture

```
┌──────────┐    ┌──────┐    ┌────────────────────┐
│ Browser  │───▶│ /plan│───▶│ ElicitationEngine  │
└──────────┘    └──────┘    └─────────┬──────────┘
                                      │ TravelerProfile
                                      ▼
                          ┌───────────────────────┐
                          │ /api/research (stream)│
                          │  7 parallel agents    │
                          └───────────┬───────────┘
                                      │ AgentUpdate (NDJSON)
                                      ▼
                          ┌───────────────────────┐
                          │  ai/provider          │
                          │  ┌──────┐  ┌────────┐ │
                          │  │Gemini│─▶│ Claude │ │
                          │  └──────┘  └────────┘ │
                          └───────────┬───────────┘
                                      │ ResearchBundle
                                      ▼
                          ┌───────────────────────┐
                          │ /api/generate-plan    │
                          │  synth + repair + zod │
                          └───────────┬───────────┘
                                      │ TravelPlan
                                      ▼
                          ┌───────────────────────┐
                          │   /result/[id]        │
                          │ day-by-day, map,      │
                          │ budget, weather, PDF  │
                          └───────────────────────┘
```

### Provider fallback

```
generateObject(opts, schema)
      │
      ▼
  [ primary = Gemini ]
      │  call ─┬─▶ success ─▶ repair + zod ─▶ return
      │        │
      │        └─▶ timeout | http 4xx/5xx | empty | parse | validation
      │
      ▼ (AI_ENABLE_FALLBACK != "false")
  [ fallback = Claude Haiku 4.5 ]
      │  call ─┬─▶ success ─▶ repair + zod ─▶ return
      │        │
      │        └─▶ same error classes
      ▼
  throw "AI provider unavailable"  (kullanıcıya güvenli generic mesaj)
```

Her boundary'de `[voyari.ai] provider=… status=… durationMs=… reason=…` tek satır log'u düşer (Cloudflare Pages → Logs üzerinden izlenebilir).

## Env vars

| Key | Required | Default | Açıklama |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | ✅* | — | Google Gemini API anahtarı (primary sağlayıcı için) |
| `ANTHROPIC_API_KEY` | ✅* | — | Claude API anahtarı (fallback sağlayıcı için) |
| `AI_PROVIDER_PRIMARY` | — | `gemini` | `gemini` veya `anthropic` |
| `AI_ENABLE_FALLBACK` | — | `true` | `"false"` ise fallback devre dışı |
| `AI_TIMEOUT_MS` | — | `60000` | Provider başına timeout |
| `GEMINI_MODEL` | — | `gemini-1.5-flash` | Gemini model override |
| `ANTHROPIC_MODEL` | — | `claude-haiku-4-5-20251001` | Claude model override |
| `AI_MAX_CONCURRENCY` | — | `3` | Araştırma sırasında paralel AI isteği üst sınırı |
| `AI_MAX_RETRIES` | — | `3` | Provider başına retry (429/5xx/timeout/network), exp. backoff 1s → 2s → 4s |
| `NEXT_PUBLIC_SITE_URL` | — | `https://voyari.ocianix.com` | Sitemap/robots canonical base |

\* En az biri zorunludur; `/api/health/ai` 503 döndürürse ikisi de yoktur.

## Local dev

```bash
# 1. Install
pnpm install

# 2. Environment
cat > .env.local <<EOF
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
AI_PROVIDER_PRIMARY=gemini
AI_ENABLE_FALLBACK=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF

# 3. Dev server
pnpm dev
# http://localhost:3000
```

## Deployment (Cloudflare Pages)

```bash
# 1. Build Next.js
pnpm build

# 2. Adapt for Cloudflare (Edge)
npx @cloudflare/next-on-pages@1

# 3. Preview locally (optional)
npx wrangler pages dev .vercel/output/static --compatibility-flags=nodejs_compat

# 4. Deploy
npx wrangler pages deploy .vercel/output/static --project-name=voyari

# 5. Verify
curl https://voyari.ocianix.com/api/health/ai
# → { "ok": true, "primary": "gemini", "fallback": true, ... }
```

`wrangler.toml` repo kökünde:

```toml
name = "voyari"
compatibility_date = "2025-04-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"
```

### Runtime notları

- Tüm `/api/*` route'ları `export const runtime = "edge"` — Cloudflare Pages Functions üzerinde çalışır.
- `leaflet` + `react-leaflet` `next/dynamic({ ssr: false })` ile yüklenir (`src/app/result/[id]/page.tsx`).
- `jspdf` + `html2canvas` yalnızca istemci tarafında, user aksiyonunda dinamik import edilir (`src/lib/utils/export-pdf.ts`).
- `recharts` sadece `"use client"` işaretli `BudgetDashboard.tsx` içinden kullanılır — server bundle'a düşmez.

## SEO

- `src/app/sitemap.ts` — `/` + `/plan`, base URL `NEXT_PUBLIC_SITE_URL` env'den okunur.
- `src/app/robots.ts` — allow all, disallow `/api/`, sitemap linklidir.
- `layout.tsx` → `metadataBase`, `alternates.canonical`, OG + Twitter tags.
- OG paylaşım görseli: `/public/og-image.svg` (1200×630). Bazı sosyal ağlar SVG'yi inconsistent render eder.

### OG PNG generation (opsiyonel)

SVG OG bazen Twitter/LinkedIn önizlemelerinde crop'lanabilir. PNG fallback üretmek için (deps eklemeden, dışarıda üretip commit'leyerek):

```bash
# Local'de bir kez:
npx --yes sharp-cli -i public/og-image.svg -o public/og-image.png resize 1200 630
# veya ImageMagick:
# magick -background none -density 96 public/og-image.svg -resize 1200x630 public/og-image.png

# Sonra layout.tsx içinde openGraph.images dizisine
# { url: "/og-image.png", width: 1200, height: 630, type: "image/png" } ekleyin.
```

## Health

- `GET /api/health/ai` → provider konfigürasyonu (boolean + model isimleri). Anahtar değer dönmez. Hiçbiri yoksa 503.

## Özellikler

1. **Adaptif Soru Motoru** — cevaplara göre dallanan, gereksiz soru sormayan akış
2. **AI Research Layer** — 7 uzman ajan (Rota, Hava, Konaklama, Restoran, Aktivite, Lojistik, Bütçe) paralel çalışır, canlı NDJSON stream
3. **Provider Fallback** — Gemini → Claude otomatik devralma, JSON repair + zod doğrulama
4. **Plan Sentezi** — unified TravelPlan üretimi, schema-validated
5. **Sonuç Dosyası** — Gün gün program, Leaflet harita, bütçe paneli, lojistik checklist, hava durumu
6. **Export** — PDF (A4 multi-page) + Markdown indir
7. **Persistence** — Planlar localStorage'da (`voyari:plans`) saklanır

## Appendix — Bundle snapshot

Next 16.2.3 (Turbopack) production build, `/api/health/ai` dahil:

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/generate-plan
├ ƒ /api/health/ai
├ ƒ /api/research
├ ƒ /api/weather
├ ○ /plan
├ ƒ /result/[id]
├ ○ /result/preview
├ ○ /robots.txt
└ ○ /sitemap.xml

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

Cloudflare adapter (`@cloudflare/next-on-pages@1`) çıktısı:

```
Edge Function Routes (5)
  ┌ /api/generate-plan
  ├ /api/health/ai
  ├ /api/research
  ├ /api/weather
  └ /result/[id]
```

---

© Ocianix — Voyari. Tüm hakları saklıdır.
