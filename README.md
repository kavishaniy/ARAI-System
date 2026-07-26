# ARAI — Accessibility · Readability · Attention Index

ARAI is a full-stack web app that lets a user upload a UI design (image) or point it at a public Figma frame, and get back an automated **UX/UI critique**: an accessibility score, a readability score, an attention/visual-hierarchy score, a combined **ARAI score**, and three auto-generated "redesign" images (heatmap, issue overlay, enhanced version). Results are saved as history, can be grouped into projects, and projects/analyses can be shared inside teams.

This document explains the whole system end-to-end: architecture, every screen, every API call, and — most importantly — the **exact formulas** used to compute every score.

> This README also calls out places where the code doesn't do what it looks like it's supposed to do (dead config, unused libraries, features with a backend but no UI). Those are flagged with ⚠️ so you know which parts are real and which are scaffolding.

---

## 1. Tech stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python), running on Uvicorn |
| Database / Auth / Storage | Supabase (Postgres + Supabase Auth + Supabase Storage) |
| Image analysis | Pillow (PIL) + NumPy only — no ML model, no OpenCV usage in the actual analyzers, no LLM |
| Email | SendGrid (or SMTP fallback) for team/project invite emails |
| Frontend | React 18 (Create React App) + React Router v6 + axios |
| Frontend styling | Tailwind (installed, barely used) + hand-rolled inline `<style>` blocks per component |
| PDF export | `jspdf` + `html2canvas`, generated entirely client-side |

There is **no Redux/Context/React-Query** — all frontend state is local `useState`, and auth session is just three keys in `localStorage`.

---

## 2. High-level architecture

```
┌─────────────────────┐        HTTPS / JSON, Bearer JWT        ┌──────────────────────────┐
│   React SPA (CRA)   │ ─────────────────────────────────────▶ │   FastAPI (/api/v1/...)  │
│  localStorage:       │ ◀───────────────────────────────────── │                          │
│  access_token, user  │                                         │  auth / analysis /       │
└──────────┬───────────┘                                         │  projects / sharing /    │
           │                                                      │  figma routers           │
           │ (public Figma URL, no token needed)                  └────────┬─────────────────┘
           ▼                                                                │
   Figma oEmbed API (thumbnail image)                                       │
                                                                             ▼
                                                                  ┌──────────────────────┐
                                                                  │  Supabase             │
                                                                  │  - Postgres tables    │
                                                                  │  - Auth (users, JWT)  │
                                                                  │  - Storage (uploads)  │
                                                                  └──────────────────────┘
```

The backend does **not** run its own password hashing or JWT signing — **Supabase Auth issues and verifies every token**. The FastAPI app's own `SECRET_KEY`/`ALGORITHM` settings exist in config but are dead code. ⚠️

The "AI" in the analyzers is not a trained model or an LLM call — it's classical pixel statistics (means, variances, unique-color counts) computed with NumPy/Pillow. See §6 for the exact math.

---

## 3. Environment variables (backend/.env)

| Variable | Used for | Actually wired up? |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_KEY` | Supabase anon client (RLS-respecting reads) | ✅ |
| `SUPABASE_SERVICE_KEY` | Supabase admin client — bypasses RLS, used for almost every write and for verifying bearer tokens | ✅ |
| `SESSION_SECRET_KEY` | Starlette `SessionMiddleware` cookie signing | ✅ |
| `ALLOWED_ORIGINS` | extra comma-separated CORS origins | ✅ |
| `ENVIRONMENT` | `development`/`production` — affects cookie `https_only` and (in production) appends a CORS wildcard `"*"` | ✅ |
| `SENDGRID_API_KEY` / `SMTP_HOST,PORT,USERNAME,PASSWORD` | team & project invite emails | ✅ |
| `FROM_EMAIL`, `FRONTEND_URL` | invite email "from" address and CTA links | ✅ |
| `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` | declared for JWT signing | ⚠️ dead — Supabase handles auth entirely |
| `FIGMA_API_TOKEN`, `FIGMA_CLIENT_ID/SECRET`, `FIGMA_REDIRECT_URI` | declared Figma OAuth config | ⚠️ dead — the live Figma endpoints take a token per-request from the client, or use Figma's public oEmbed API (no token at all) |
| `SALIENCY_MODEL_PATH`, `SALICON_MODEL_PATH`, `RICO_MODEL_PATH` | declared ML model paths | ⚠️ dead — no model is ever loaded; leftover from a removed PyTorch-based analyzer (removed to fit Render's 512MB free-tier memory limit) |
| `LITE_MODE` | meant to skip PyTorch analysis | ⚠️ no-op now, since no analyzer imports torch anymore |

Frontend reads one env var: `REACT_APP_API_URL` (defaults to `http://localhost:8000/api/v1`).

---

## 4. Authentication (Login / Signup / Logout / Profile / Delete)

All auth is delegated to **Supabase Auth**. The FastAPI backend is a thin proxy.

### Signup — `POST /api/v1/auth/signup`
1. Frontend: `/signup` page collects name, email, password, confirm-password. Only client-side check is `password === confirmPassword` (plus HTML5 `minLength=8`).
2. Calls `supabase.auth.sign_up({email, password, options: {data: {full_name}}})`.
3. Backend inserts a row into the `profiles` table (best-effort — failure is logged, not fatal, since a DB trigger may also create it).
4. Backend auto-accepts any pending **team invitations** sent to that email before they had an account (`accept_team_invitations_for_user`) — this is how "invite someone who hasn't signed up yet" resolves itself.
5. Response: `{access_token, token_type: "bearer", user}` — the `access_token` is the raw Supabase JWT. Frontend stores `access_token`, `user`, and `token_timestamp` (`Date.now()`) in `localStorage` and redirects to `/dashboard`.
6. If Supabase requires email confirmation, no session is returned and the user gets an error asking them to confirm their email and log in.

### Login — `POST /api/v1/auth/login`
1. `/login` page → `supabase.auth.sign_in_with_password(email, password)`.
2. Backend also fetches the `profiles` row to attach `full_name`/`avatar_url` (falls back to the email's local-part as a display name).
3. Same `Token` response shape; same localStorage writes.
4. If the axios interceptor or a manual expiry check had previously redirected the user here mid-task, `localStorage.redirect_after_login` holds the original path — login sends them back there instead of `/dashboard`.

### Session persistence
Purely `localStorage`-based: `access_token`, `user`, `token_timestamp`. No cookies, no refresh tokens. `authService.isTokenExpired()` assumes an hour-long Supabase JWT (checks elapsed time vs. 55 minutes) — this is only checked manually before a file upload, not enforced globally. Globally, the axios response interceptor watches for `401`s whose error detail mentions "expired"/"invalid"/"token" and force-redirects to `/login` (with a blocking `alert`).

### Logout — `POST /api/v1/auth/logout`
Best-effort call to `supabase.auth.sign_out()`; frontend clears all 3 localStorage keys in a `finally` block regardless of whether the API call succeeded.

### Profile — `GET` (from localStorage) / `PATCH /api/v1/auth/profile`
`/profile` only lets you edit **Full Name** (email is read-only). Saves via Supabase admin client, merges the response back into the cached `user` object.

### Delete account — `DELETE /api/v1/auth/delete-account`
From `/settings` → Danger Zone → inline "are you sure" confirmation. Backend: nulls out `projects.created_by` for that user (avoids FK errors), deletes their `analyses` and `projects` rows, then deletes the Supabase Auth user (cascades to `profiles`). Frontend hard-redirects (`window.location.href = '/'`) to fully reset app state.

---

## 5. Uploading & analyzing a design (image upload flow)

Entry points: Dashboard's **Upload & Analyze** tab, a Project's **Analyze Design** tab, or a Team's **Upload Analysis** tab — all three embed the same `UploadAnalysisMultiple` component, just with different `projectId`/`teamId` props.

1. User drags/drops or browses PNG/JPG/JPEG/WebP files (≤10MB each, multiple allowed). Each gets a local base64 preview via `FileReader`.
2. For each file, the frontend POSTs directly (its own axios call, bypassing the shared API client) to `POST /api/v1/analysis/upload` as multipart form data: `file`, `design_name`, and optionally `project_id` / `team_id`.
   - Has cold-start retry logic: up to 3 attempts with backoff for `ERR_NETWORK`/timeouts/502/503/504 (the hosting is free-tier and can "sleep").
3. **Backend pipeline** (`backend/app/api/analysis.py`):
   1. Validates extension (`.png/.jpg/.jpeg/.webp`) and size (≤10MB, hardcoded).
   2. Generates a UUID `analysis_id`, saves the file locally to `uploads/{analysis_id}/original{ext}`, and uploads it to the Supabase Storage bucket `design-uploads` (path `{user_id}/{timestamp}_{filename}`).
   3. Runs the three analyzers **sequentially** (not in parallel), each independently try/excepted with a `score: 50` fallback on error, calling `gc.collect()` between them to manage memory on a constrained host:
      - `SimplifiedWCAGAnalyzer` → accessibility score
      - `SimplifiedReadabilityAnalyzer` → readability score
      - `SimplifiedAttentionAnalyzer` → attention score
   4. Combines them into the **ARAI score** (see formula in §6.5).
   5. Generates 3 derived images via `ImageRedesigner` (heatmap / annotated / enhanced — see §7).
   6. Saves everything to the `analyses` table in Supabase (non-fatal if it fails — a `history_warning` is returned instead so the UI can flag it), plus a local JSON backup.
   7. If `project_id` was supplied, the frontend separately calls `POST /projects/{id}/analyses/{analysis_id}` per finished file to link it. If `team_id` was supplied, it's simply stored on the `analyses` row directly (no separate linking call needed).
4. Response includes all scores, the issue lists, and the three redesign images; the frontend renders it via `MultipleAnalysisResults` → `SimplifiedAnalysisResults`.

---

## 6. The scoring engine — exact formulas

**Important finding from reading the analyzer source directly**: all three analyzers are classical, deterministic image-statistics heuristics operating on whole-image or quadrant-level pixel aggregates (mean brightness, variance, unique-color counts, image dimensions). There is **no OCR, no text extraction, no trained saliency/attention model, no real WCAG contrast-ratio computation**, despite `pytesseract` and `textstat` being listed as dependencies (they are never imported — dead dependencies ⚠️). Every analyzer shares the same scoring skeleton:

```
score = 100
score -= 25 × (# critical issues)
score -= 15 × (# high issues)
score -=  8 × (# medium issues)
score -=  2 × (# info issues)
score = clamp(score, 0, 100)
```

All three also share a **blank-image guard**: if >90% of pixels are near-white (R,G,B all > 240) OR the grayscale variance is <100, the image is treated as blank and hard-scored `10 / grade F`.

### 6.1 Accessibility — `SimplifiedWCAGAnalyzer`
File: `backend/app/ai_modules/simplified_wcag_analyzer.py`

Declares real WCAG constants (`CONTRAST_AA_NORMAL=4.5`, `CONTRAST_AA_LARGE=3.0`, `MIN_TOUCH_TARGET=44px`, `MIN_FONT_SIZE=14px`) but only uses them as reference numbers in issue text — the checks themselves are proxies, not the literal WCAG relative-luminance formula:

| Check | What it actually measures | Triggers issue if… | Severity |
|---|---|---|---|
| Color Contrast | Splits image into 4 quadrants, computes luma `0.299R+0.587G+0.114B` per quadrant, then its std-dev | any quadrant's std-dev `< 30` (low local luminance variance ≈ "flat"/low-contrast area) | high (−15) |
| Text Size | `dark_pixels / total_pixels` where `dark = luma < 128` | text coverage `< 5%` (guess: text may be too small/light) | medium (−8) |
| Color Independence | unique-RGB-colors sampled every 10th pixel, `diversity = unique / sampled_total` | diversity `> 0.5` (lots of distinct colors → might rely on color alone) | medium (−8) |
| Touch Targets | raw image height/width | `height < 400px` or `width < 300px` | medium (−8) |

Output bands (distinct from the generic A–F grade used elsewhere):
- `wcag_level`: "AA" if score ≥80, "A" if score ≥70, else "Below A"
- `conformance`: "Compliant" ≥80, "Needs Improvement" ≥70, else "Non-Compliant"

### 6.2 Readability — `SimplifiedReadabilityAnalyzer`
File: `backend/app/ai_modules/simplified_readability_analyzer.py`

The code literally comments *"Without OCR, we can't extract text, so we provide recommendations."* No sentence-length, word-complexity, or passive-voice measurement ever runs on real text — `MAX_SENTENCE_LENGTH`, `COMPLEX_WORDS`, `PASSIVE_INDICATORS`, etc. are defined but never referenced.

- Computes `text_coverage = (# pixels with luma < 100) / total_pixels` as a crude "is there probably text here" proxy.
- If `text_coverage > 0.3` ("likely has text"): appends 4 static generic-advice issues (sentence length, simple words, text breaks, active voice) and hardcodes **score = 75**.
- Else ("minimal text"): appends one "success" issue and hardcodes **score = 90**.
- On any processing error: fallback **score = 50, grade C**.
- Grade bands: A ≥80, B ≥70, C ≥60, else D.

### 6.3 Attention — `SimplifiedAttentionAnalyzer`
File: `backend/app/ai_modules/simplified_attention_analyzer.py`

Four checks, each against real pixel math (no saliency model despite the name):

| Check | Formula | Triggers issue if… | Severity |
|---|---|---|---|
| Visual Hierarchy | `|mean_brightness(top quarter) − mean_brightness(bottom quarter)|` | `< 20` | high (−15) |
| Eye Flow Pattern | `pattern_score = |TL − TC| + |TC − BR|` (mean brightness of top-left, top-center, bottom-right regions) | `pattern_score < 30` | medium (−8) |
| Cognitive Load | `complexity = 0.4 × color_diversity% + 0.6 × (std_dev(all pixels)/2.55)` where `color_diversity% = unique_colors_sampled_every_5px / sample_count × 100` | `complexity > 50` | high (−15) |
| Hot Spots | luma split into a 3×3 grid, ranks the 3 highest-variance cells | always fires (informational only — lists e.g. "top-left, middle-center") | info (−2) |

Grade bands: A ≥80, B ≥70, C ≥60, else D. Conformance: "Excellent" ≥80, "Good" ≥70, else "Needs Work".

### 6.4 Where the score labels come from
There are **two different grading scales** in the app and it's easy to conflate them:
- Each individual analyzer has its own **A–D** (or wcag_level/conformance) bands, tuned to its own 100-point scale.
- The **combined ARAI result** additionally gets an overall **A–F** letter grade (A ≥90, B ≥80, C ≥70, D ≥60, else F) — a stricter scale applied only to the blended score.

### 6.5 ARAI composite score
Defined identically (and duplicated) in both `analysis.py` and `figma.py`:

```python
arai_score = (accessibility_score × 0.4) + (readability_score × 0.3) + (attention_score × 0.3)
```

**Weighting: Accessibility 40% · Readability 30% · Attention 30%.** Then mapped to the overall A–F grade from §6.4.

---

## 7. The "redesign" images (heatmap / annotated / enhanced)

File: `backend/app/ai_modules/image_redesigner.py`. **No generative AI/image model is involved** — these are deterministic PIL/NumPy post-processing outputs, driven by the three scores above, resized to max 900px and JPEG-encoded (quality 88).

1. **Heatmap** — splits the grayscale image into a 3×3 grid, scores each cell as `0.6 × variance + 0.4 × (mean absolute pixel-to-pixel difference × 100)`, normalizes across the 9 cells, and colors each with a jet-style colormap + a LOW/MED/HIGH label. ⚠️ This independently recomputes its own grid from scratch — it does **not** reuse the real `SimplifiedAttentionAnalyzer` output, so "heatmap" here is illustrative, not literally the attention analyzer's internal data.
2. **Annotated (issue overlay)** — draws translucent tinted regions keyed to the *actual* scores: red tint over the top 55% if accessibility <85, amber tint over the bottom 40% if readability <85, diagonal purple hatching everywhere if attention <75; plus a colored border (red/orange/green) based on the worst of the three scores, and a legend banner with `ACC/READ/ATTN` percentages.
3. **Enhanced** — applies real image corrections conditioned on the scores: contrast boost (up to ×1.7) if accessibility <80; brightness normalization if the image is too dark/light overall; sharpening if readability <75; a radial vignette (darkened corners, to draw the eye inward) if attention <75; plus a small constant saturation boost (×1.12) always. A legend banner lists which corrections were actually applied.

If image generation fails for any reason, it's caught and logged — the analysis still completes, just without these three images.

---

## 8. Figma analysis flow

There is **no Figma OAuth / personal-access-token flow in the frontend at all**. The user experience is: copy a **public** Figma frame's share link ("Copy link to selection") and paste it in.

1. `/figma-analysis` (or a Team's Figma Analysis tab) renders `FigmaProjectInput`: an instructional 4-step card, then a dynamic list of URL fields. Client-side validation only checks the string contains `figma.com` and either `/file/` or `/design/`.
2. Submitting calls `figmaService.analyzeFrames(frameUrls)` → `POST /api/v1/figma/analyze-frames` (5-minute client timeout, since Figma thumbnail generation can be slow).
3. **Backend** (`backend/app/api/figma.py`), per URL: calls Figma's **public, unauthenticated oEmbed API** (`https://www.figma.com/api/oembed?url=...`) to get a `thumbnail_url` — this only works for files that are publicly shared, which is why the frontend's error message for an empty result says "Check that the Figma file is public."
4. The thumbnail image is downloaded and run through **the exact same three analyzers** used for direct uploads (§6) — Figma frames are rasterized to an image and scored as an image; there is no structural analysis of the actual Figma layer tree, fonts, or color styles via the authenticated Figma REST API for this path.
5. Results come back in the same shape as an upload and render in `MultipleAnalysisResults` (a design-card gallery — one card per frame/URL) → `SimplifiedAnalysisResults` for the selected one.

Backend also exposes (not used by the current UI):
- `POST /figma/frames` and `POST /figma/analyze` — these *do* use the authenticated Figma REST API (`GET /v1/files/{file_id}`, `GET /v1/images/{file_id}`) with a client-supplied `figma_token`, walking the real node tree to find frames/components and exporting them as PNG at 2× scale before running them through the same 3 analyzers. This is a more "real" Figma integration path that exists server-side but isn't wired into any current frontend screen. ⚠️

---

## 9. History

There is no separate "history" table — **an analysis's row in the `analyses` table *is* its history entry.** "History" is just different filtered views of the same table:

| View | Route / endpoint | Scope |
|---|---|---|
| Personal history | `/history` → `GET /analysis/history` | all of the current user's analyses (client-side search by name/filename, up to 100 fetched) |
| Project history | `/projects` → select a project → `GET /projects/{id}` (embeds `analyses`) | analyses linked to that `project_id` |
| Team history | `/teams/:teamId` → History tab → `GET /teams/{id}/analysis-history` | analyses tagged with that `team_id`, server-paginated |
| Dashboard widget | `HistorySection` on `/dashboard` → `GET /analysis/history?limit=5` | last 5, compact list, links to `/history` |

Every "View Details" action re-fetches the full record via `GET /analysis/results/{id}` and renders it with the same `SimplifiedAnalysisResults` component used right after an analysis completes. "Delete" calls `DELETE /analysis/results/{id}`, which removes the DB row, the Supabase Storage file, and the local `uploads/{id}` folder.

A project can optionally be linked to exactly one team (inferred server-side from its shares); uploads tagged with that project automatically also get tagged with the inferred `team_id` so they surface in team history too.

---

## 10. Projects

`/projects` — a flat list (with `search=` querying the backend), "+ New Project" opens a modal (name 1–255 chars, description ≤1000 chars) → `POST /projects`. Clicking a project swaps in `ProjectDashboard` **in-place** (not a real route — a project view isn't bookmarkable/shareable via URL). `ProjectDashboard` has two tabs: **Analyze Design** (an embedded uploader tagging uploads with `project_id`) and **History** (all analyses linked to the project, same view/delete actions as anywhere else). Deleting a project cascades: the backend deletes every linked analysis row first, then the project.

---

## 11. Teams & sharing

`/teams` — create a team (name + description) → `POST /teams` (creator is automatically added as `team_members` role `owner`). Each team card can:
- Expand to show members with role badges.
- **Invite** by email → `POST /teams/{id}/invite?email=&role=member` (role is hardcoded to `member` from this UI control). If the email belongs to an existing user, they're added immediately and notified; if not, a pending `team_invitations` row is created and an email is sent inviting them to sign up — signing up later **auto-accepts** any pending invitations matching that email.
- Edit / delete (delete requires being the team's original creator, not just any "owner"-role member).

Opening a team (`/teams/:teamId`) gives a workspace with three tabs: **Upload Analysis**, **Figma Analysis**, and **History** — functionally identical to the personal Dashboard/Projects flows, just scoped to `team_id`.

### ⚠️ Known gap: project sharing is backend-only
The backend fully supports sharing a specific **project** with a team or an individual's email at `viewer`/`editor` access level (`POST /projects/{id}/share`, `GET /projects/{id}/shares`, `GET /projects/shared`), and the frontend even has a matching `sharingService` wrapper (`frontend/src/services/sharing.js`) — but **no component in the app calls it**. Today, the only way an analysis becomes associated with a team is by uploading/Figma-analyzing directly from inside that team's own workspace page. If you want a "share this project with Team X" button, the backend endpoint already exists; only the UI needs to be built.

---

## 12. Route map

### Frontend (React Router)
| Path | Page | Access |
|---|---|---|
| `/` | Landing (marketing) | public |
| `/login`, `/signup` | Auth forms | public (redirects to `/dashboard` if already logged in) |
| `/dashboard` | Upload / results / recent history | protected |
| `/figma-analysis` | Analyze public Figma frames | protected |
| `/analysis/:id` | Permalink view of one saved analysis | protected |
| `/projects` | Project list + embedded project dashboard | protected |
| `/history` | Full personal history | protected |
| `/teams`, `/teams/:teamId` | Team list / team workspace | protected |
| `/profile` | Edit display name | protected |
| `/settings` | Account info, static preferences, delete account | protected |

"Protected" = a route wrapper that checks `localStorage.access_token` exists, else redirects to `/login`.

### Backend (`/api/v1/...`)
| Area | Endpoints |
|---|---|
| Auth | `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `PATCH /auth/profile`, `DELETE /auth/delete-account` |
| Analysis | `POST /analysis/upload`, `GET /analysis/results/{id}`, `DELETE /analysis/results/{id}`, `GET /analysis/history`, `GET /analysis/status`, `POST /analysis/validate-url` |
| Figma | `POST /figma/analyze-frames` (used by frontend), `POST /figma/frames`, `POST /figma/analyze`, `POST /figma/analyze-url`, `GET /figma/test` (not wired to current UI) |
| Projects | `POST/GET /projects`, `GET/PUT/DELETE /projects/{id}`, `POST /projects/{id}/analyses/{analysis_id}` |
| Teams | `POST/GET /teams`, `GET/PUT/DELETE /teams/{id}`, `GET /teams/{id}/analysis-history`, `POST /teams/{id}/members`, `POST /teams/{id}/invite`, `PUT/DELETE /teams/{id}/members/{user_id}` |
| Sharing (project-level) | `POST /projects/{id}/share`, `GET /projects/{id}/shares`, `DELETE /projects/{id}/shares/{share_id}`, `GET /projects/shared` (backend-only, no UI yet) |

---

## 13. Running it locally

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in SUPABASE_URL / SUPABASE_KEY / SUPABASE_SERVICE_KEY / SESSION_SECRET_KEY
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:8000/api/v1" > .env
npm start
```

The frontend expects the backend at `http://localhost:8000/api/v1` by default. Supabase must have the `profiles`, `analyses`, `projects`, `teams`, `team_members`, `team_invitations`, and `project_shares` tables set up, plus a Storage bucket named `design-uploads`.

---

## 14. Notable rough edges (worth knowing before you demo or extend this)

- The three analyzers are **image-statistics heuristics, not ML** — there's no saliency model, no OCR, no real WCAG contrast-ratio math, even though the UI/marketing copy (and some declared-but-unused settings/dependencies) suggest otherwise. Good to know if a supervisor/examiner asks "what AI model is this using."
- `pytesseract`, `textstat`, and OpenCV are installed but unused — likely leftovers from an earlier, more sophisticated version of the analyzers.
- `FIGMA_API_TOKEN` and friends in `.env` are unused; the live "paste a Figma link" flow needs the file to be **public** and uses Figma's oEmbed API, not the authenticated REST API (that path exists in `figma.py` but has no frontend entry point).
- Project→team sharing has a complete backend contract but no frontend button yet.
- `/how-it-works`, linked from the Landing page, isn't a real route.
- History deep-links from the Dashboard widget (`/history?view={id}`) aren't actually read by `HistoryPage` — clicking them just opens the generic history list.
