# Voyari

**AI destekli kişiselleştirilmiş tatil planlayıcısı — gulet, road trip, karavan, cruise ve daha fazlası.**

Voyari, seyahat DNA'nızı anlayan ve uçtan uca lüks bir tatil dosyası üreten bir AI Travel Architect'tir. Ocianix tarafından geliştirilmiştir.

---

## Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 + custom dark+gold luxury tokens
- **State:** Zustand (with `persist` middleware)
- **AI:** Anthropic SDK (Claude) — 7 paralel araştırma ajanı + sentez
- **Maps:** Leaflet + react-leaflet
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Export:** jsPDF + html2canvas (PDF), native markdown (MD)
- **Deployment Target:** Cloudflare Pages (`@cloudflare/next-on-pages`)

## Setup

```bash
# 1. Environment
cp .env.local.example .env.local   # ya da yeni dosya oluştur
# .env.local:
# ANTHROPIC_API_KEY=sk-ant-...

# 2. Install
pnpm install

# 3. Dev
pnpm dev
# http://localhost:3000

# 4. Production build
pnpm build
pnpm start
```

### Çevre değişkenleri

| Key | Açıklama |
| --- | --- |
| `ANTHROPIC_API_KEY` | Zorunlu. Claude API. `/api/research`, `/api/generate-plan`, `/api/weather` tarafından kullanılır. |

## Brand Guidelines

**Ton:** lüks, sinematik, zarif. Türkçe UI — akıcı, güven veren, aşırı teknik olmayan dil.

### Renk Paleti

| Token | Hex | Kullanım |
| --- | --- | --- |
| `bg-primary` | `#0A0E1A` | Sayfa arka planı — derin gece mavisi |
| `bg-secondary` | `#141B31` | Kart arka planı |
| `surface` | `#1A1F35` | Elevated yüzey |
| `gold-primary` | `#D4A853` | Ana vurgu (CTA, aksiyonlar) |
| `gold-light` | `#E8C97A` / `#F3D98B` | Parıltı, hover |
| `gold-dark` | `#B8862F` | Gradient taban |
| `amber` | `#F59E0B` | İkincil vurgu |
| `text-primary` | `#F5F5F5` | Ana metin |
| `text-secondary` | `#CBD5E1` | Alt metin |
| `text-muted` | `#9CA3AF` | İpucu metni |
| `success` | `#10B981` | Onay |
| `danger` | `#FB7185` | Hata |

### Tipografi

- **Display (başlıklar):** _Playfair Display_ — zarafet, editoryal hava
- **Sans (gövde):** _DM Sans_ — okunaklı, modern
- **Mono (etiket/kod):** _JetBrains Mono_ — tracking-[0.22em] uppercase küçük başlıklar için

### Logo

- `/public/logo.svg` & `/public/logo-mark.svg` — altın gradient pusula rozet + stilize **V**
- `/public/logo-wordmark.svg` — rozet + "Voyari" (Playfair Display)
- `/public/favicon.svg` — 16px'te netleşen basitleştirilmiş rozet
- `/public/og-image.svg` — 1200×630 paylaşım kartı

## Özellikler

1. **Adaptif Soru Motoru** — cevaplara göre dallanan, gereksiz soru sormayan akış
2. **AI Research Layer** — 7 uzman ajan (Rota, Hava, Konaklama, Restoran, Aktivite, Lojistik, Bütçe) paralel çalışır, canlı SSE stream
3. **Plan Sentezi** — Claude ile bütünleşik TravelPlan üretimi
4. **Sonuç Dosyası** — Gün gün program, harita, bütçe paneli, lojistik checklist, hava durumu
5. **Export** — PDF (A4 multi-page) + Markdown indir
6. **Persistence** — Planlar localStorage'da (`voyari:plans`) saklanır; refresh ile kaybolmaz

## Deployment (Cloudflare Pages)

```bash
# Build for Cloudflare
npx @cloudflare/next-on-pages@1

# Preview locally
npx wrangler pages dev .vercel/output/static --compatibility-flags=nodejs_compat

# Deploy
npx wrangler pages deploy .vercel/output/static --project-name=voyari
```

`wrangler.toml` repo kökünde stub olarak hazırdır:

```toml
name = "voyari"
compatibility_date = "2025-04-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"
```

### Notlar

- Tüm `/api/*` route'ları `export const runtime = "nodejs"` kullanır — Cloudflare Pages'te `nodejs_compat` flag'iyle çalışır.
- `jspdf` ve `html2canvas` yalnızca istemci tarafında dinamik olarak import edilir (`src/lib/utils/export-pdf.ts`) — edge runtime sorunu olmaz.
- `leaflet` ve `react-leaflet` `next/dynamic({ ssr: false })` ile yüklenir — SSR edge'de sorun çıkarmaz.
- Anthropic çağrıları uzun sürebilir; Cloudflare Pages Functions için stream'li yanıtlar `nodejs_compat` ile uyumludur.

---

© Ocianix — Voyari. Tüm hakları saklıdır.
