# KCSW homepage

Static, responsive homepage for Kumbhalkar College of Social Work, Wardha. No build step. Plain HTML, CSS and a little JavaScript. Fonts and images are bundled, so nothing loads from third party servers.

Layouts: phone (from 320px), large phone (640px), tablet (900px, split layouts begin) and desktop (1100px, full navigation with dropdowns).

## Before you go live

1. `assets/js/config.js`: set the WhatsApp number, phone and email. Every WhatsApp button, Call button and footer link updates from this one file.
2. `index.html`: replace `https://YOUR-DOMAIN.example` (canonical, og:image and the JSON-LD block). Do the same in `robots.txt` and `sitemap.xml`.
3. Replace every bracketed placeholder with the real fact: dates, NIRF year, Ph.D. duration, last date to apply, FAQ answers, the Principal's approved excerpt, the privacy policy link. Search the files for `[`.
4. Point the `href="#"` links (PDFs, notices, social, story, Principal's message) to real files and pages.
5. Swap in higher resolution photos in `assets/img` (same file names). The supplied photos are small, so the hero photo is used only behind an overlay.

## Lead form

The form posts JSON to `/api/lead`, which is the Vercel function in `api/lead.js`.

* Without any setup, each lead is written to the Vercel function logs (Project, Logs), so nothing is lost.
* To send leads to a Google Sheet, Zapier, Make or Slack, add an environment variable `LEAD_WEBHOOK_URL` in Vercel (Settings, Environment Variables) and redeploy. For a Google Sheet, create an Apps Script web app that appends the JSON fields to a sheet and use its URL.
* On GitHub Pages there is no server, so set `leadEndpoint` in `config.js` to a form service URL (Formspree, Getform or similar).

If the request fails, the visitor sees an error and the WhatsApp button, and the form stays filled.

## Deploy

Vercel: import the GitHub repository, framework preset "Other", leave build command and output directory empty. Done.

GitHub Pages: Settings, Pages, deploy from the main branch root. The site uses relative paths, so it also works under a repository sub path.

## Local preview

    python3 -m http.server 8000

Then open http://localhost:8000. Opening index.html directly from disk also works, except that the font preload warns in the console.

## Notes

* Marathi: a language toggle swaps the main headings and the form to placeholder Marathi (see `assets/js/main.js`). Have a native speaker review it, and extend the dictionary for the rest of the page when ready.
* FAQ uses native details elements, so it works without JavaScript and the answers are in the page source.
* Analytics: add your tag to `index.html`. The form fires a `generate_lead` event when `gtag` is present.
