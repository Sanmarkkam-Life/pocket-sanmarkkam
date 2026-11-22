# Pocket Sanmarkkam: handover notes for Claude

Last updated: 2026-11-22. Start here in every session about the app. The agreed plan is `PLAN.md` (phases, decisions); this file says how the code works and the rules.

## What it is
- A free phone app (Next.js 14 PWA, installs to the home screen) with Vallalar's **published** books: Tamil, transliteration, English translation, commentary. Plus verse of the day, audio, resources and support links.
- **Phase 1 is built** (reader, search, bookmarks, offline, settings, links). From Phase 2, KarunAI in the app and chants (YouTube) are done (22 Nov); Book VI waits for approval. Phase 3 (app stores, languages) not started.
- Write "Vallalar (Ramalinga Adigal)". Never "Swamigal" in new text.
- Tone: as the org's voice: direct, warm, short. Donation asks are gentle, one place only (the Support tab and one footer line).

## Rules
1. **Only published books.** An approved Edition 1.0 or later, never a draft or Review Draft. The exporter refuses a book whose edition line is missing, below 1.0, or says Review Draft, or whose file name says DRAFT (unless `books.json` explains why in `allowDraftName`). When unsure, ask the `04 Publications` session; don't guess.
2. **Never edit anything in `..\04 Publications`.** The exporter only reads the finished Word files there.
3. **No new deploy target, website page or menu change without the user's OK.** (Pushing fixes to the live app is fine once the user has reviewed them.)
4. `node_modules`, `.next` and `.env.local` never go on Drive. The app runs from a local copy (below).
5. Book text in the app is exactly the book's text. Fix errors in the book (publications session), then re-export; never hand-edit `public/data`.
6. Unpublished translations and seekers' data never go to `/free`.

## Where things are
- `scripts/books.json`: the list of books in the app, their source `.docx`, website page, and the books left out on purpose (with the reason). **Add a book here when it is approved.**
- `scripts/export_books.py`: reads each book's Word file and writes `public/data/books/<id>.json` (intro, works, sections, passages, tables, glossary), `catalog.json`, `daily.json` (366 verse-of-the-day passages, balanced across books), `search.json` (translation + Tamil of every passage). Standard library only. Writes `scripts/export-report.md` (counts and anything odd).
- `lib/links.ts`: chants and songs (`chantSections`: YouTube recordings, user's decision 22 Nov 2026: no new voice recordings for mantras; Shravan Kalai gave permission for his mantra; sections Maha Mantra, Arutperunjothi Agaval, Songs of Grace, several versions each, more links to come from the user; `embed:false` when the uploader blocks embedding, then the app opens YouTube), every outside link (donate, join, volunteer, represent, resources, socials) and the audiobook MP3 addresses on sanmarkkamlife.org.
- `lib/prefs.tsx`: settings (text size, theme, Tamil/transliteration/commentary switches) and bookmarks, in `localStorage` only (`pocket_settings_v1`, `pocket_bookmarks_v1`).
- `public/sw.js`: hand-written service worker. Pages network-first (one cached copy per page, whatever the query, so `/read` covers every book), `/data` cache-first with background refresh, code and icons cache-first. Bump `VERSION` when it changes.
- Routes: `/` home, `/books`, `/book?b=`, `/read?b=&w=&s=#p-<id>`, `/intro?b=`, `/glossary?b=`, `/search?q=&in=`, `/bookmarks`, `/audio`, `/resources`, `/support`, `/settings`. Query-string routes on purpose: a few static pages serve every book, which keeps offline simple.
- Icons: `public/icons/*` made from `public/brand/sanmarkkam-life.png` (300 px source; a sharper master would help).

## How to run
```powershell
py scripts\export_books.py            # refresh book data (in the Drive folder)
.\scripts\run-local.ps1               # dev, http://localhost:3001
.\scripts\run-local.ps1 build         # production build (must pass with no warnings)
.\scripts\run-local.ps1 start         # build + production server (service worker on)
```
- Run folder: `%USERPROFILE%\Dev\pocket-sanmarkkam-run`. Port 3001, so TamiLearn (3000) can run at the same time.
- Preview configs are in `.claude\launch.json` of this folder. When a session starts in the parent folder, `preview_start` picks the parent's config (TamiLearn) instead: start the server with the script, then `preview_start` with the URL.
- **The built-in browser pane cannot register service workers** ("unknown error fetching the script"). Test offline in Chrome (Claude in Chrome): it works there (checked 2026-11-22: server stopped, an unopened Book III chapter still loaded).
- First install lesson (2026-11-22): an interrupted `npm install` left a broken SWC binary and missing files. Fix: delete `node_modules` in the run folder and run the script again.

## KarunAI and giving (22 Nov 2026)
- `/karunai` (`app/karunai/page.tsx`, `lib/karunai.ts`) posts the conversation to the website's KarunAI (`admin-ajax.php?action=karunai_chat`, WPCode snippet 4362) as text/plain. The snippet allows the app's origin through `allowed_http_origins` (line added 22 Nov with the user's OK; Drive copy `14 KarunAI\karunai-server-snippet.php` updated, old copy `.2026-11-22-before-app-cors.php.bak`). **Only https://pocket-sanmarkkam.vercel.app is allowed**: localhost cannot test KarunAI, and a new domain must be added to that filter.
- Limits: the server's 60/hour per visitor and 500/day for everyone (shared with the website), plus 10 questions a day per phone in the app (same as the website page). Cost as the website: about 1.5 to 2 US cents a question.
- KarunAI's own book collection still includes the Book V and VI drafts (managed in `14 KarunAI`), so answers can quote drafts.
- Giving: `components/DonatePanel.tsx` + `lib/giving.ts`, ported from TamiLearn: Donorbox campaign `sanmarkkam-en-monthly` inside the app, `utm_source=pocket-sanmarkkam`. No payment code in the app.

## Smaller features (22 Nov 2026)
- Continue reading: `lib/lastRead.ts` (`pocket_last_read_v1`), saved by the reader, shown on Home.
- The flame button on each passage opens `/karunai?about=…` with the question pre-filled; the reader still taps Send.
- Feedback: `FEEDBACK_URL` in `lib/links.ts` = the website's contact page for now; a dedicated Google Form (like TamiLearn's) could replace it.
- Chants offline: decided path is to ask Shravan Kalai for the original audio files and a written OK for app use, host them on the website like the audiobooks, then add "Save for offline". Do not rip audio from YouTube.

## Exporter notes (how the books are read)
- Heading 1 = a work (or an introduction if it ends in "INTRODUCTION" / is "A NOTE ON CONTEXT"); Heading 2 = a section; front matter (Disclaimer, About the Author, Contents) skipped; everything from "ABOUT SANMARKKAM LIFE" on skipped; GLOSSARY entries `term (தமிழ்): definition`.
- Inside a section: a bold number alone = verse number; Tamil paragraphs = Tamil lines; wholly italic after Tamil = transliteration; "TRANSLATION –" / "COMMENTARY –" start those layers and following plain paragraphs continue them; an italic paragraph before the Tamil = editor's note (kept with the next verse); tables kept as tables.
- Passages with Tamil only are metre headers (வேறு, கலிவெண்பா…): shown small and centred.
- Verse-of-the-day filter skips passages that lean on context ("But he…", dates, titles, a prose section's opening). It is automatic; a hand-picked list from the team would be better (`daily.json` has the same shape).

## State on 2026-11-22
- 16 books exported (6,342 passages): Agaval, Books I–V, Vinnappangal, Perupadesam, Upadesa Kurippugal, Jeeva Karunya Ozhukkam (1.3), Vyakhyanangal, Siru Vyakhyanangal, Thirumugangal, Azhaippugal, Maruthuva, Manu Murai Kanda Vasagam (user confirmed it approved on 2026-11-22; the book has translation only, no commentary).
- Left out: Book VI (not finished), the old Agaval and old Nithya Karma Vidhi files. **Personal Conduct and Daily Discipline is `pending`**: its Word file says Edition 1.0 but the publications notes only record 0.9. The publications session (2026-11-22) says exclude it for now; it asked the user. Remove `pending` only once the book is approved, then re-export. The session also confirmed the rest of the list, including Vinnappangal's -DRAFT-named file (the approved 1.0 text) and JKO 1.3.
- **Live since 2026-11-22 (user's OK):** https://pocket-sanmarkkam.vercel.app . GitHub `Sanmarkkam-Life/pocket-sanmarkkam` (PUBLIC: keep PLAN.md, REVIEW-CHECKLIST.md, `.claude/` and `website/` out, see `.gitignore`). Vercel team `sanmarkkam-life`, project `pocket-sanmarkkam`, deploys `main` automatically. The Vercel connector here has no team grant (403): use Chrome for Vercel settings. First import needed an emailed code (the user enters it).
- **Website:** page 3442 https://sanmarkkamlife.org/mobile-app/ (the old "Coming soon" Mobile App page) now holds the Pocket Sanmarkkam page, edited in place via `%USERPROFILE%\ClaudeSetup\wordpress\wp_api.py`. Source: `website\mobile-app-3442-pocket-sanmarkkam.html`. Backup of the old content: `%USERPROFILE%\ClaudeSetupackups\mobile-app-page-3442-before-pocket-sanmarkkam-2026-11-22.html` (it had a Sanmarkkam Journey sign-up form). Menu "2026 Menu EN" (205): item 3444 under 📲 Apps renamed "🪔 Pocket Sanmarkkam". After menu or page edits, the user purges the Aerowave cache in the hosting panel. Italian menu/page not done.
- **To deploy a change:** edit here, `.\scripts
un-local.ps1 build`, commit, `git push` (Vercel builds in about 1 minute). Re-export books first if they changed.
- Not done: community test with 5 people (PLAN step 5). Italian: wait until the English app is finished (user, 22 Nov); no Italian menu or page for now. Chanted Agaval versions: waiting for the user's links.
- Review checklist for the user: `REVIEW-CHECKLIST.md`.
