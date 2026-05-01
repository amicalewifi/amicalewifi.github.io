# Hosting & cache TTL

The site is currently published to **GitHub Pages**, which forces
`Cache-Control: max-age=600` on every asset and offers no override.
This is the sole reason Lighthouse's "Use efficient cache lifetimes"
audit will not pass on the current deployment.

To pass the audit, switch the deployment to a host that respects the
`/_headers` file already in this repo. Two zero-cost options:

## Option A — Cloudflare Pages (recommended)

1. Sign in to https://dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git.
2. Pick the `amicalewifi.github.io` GitHub repo.
3. Build settings:
   - Framework preset: **Hugo**
   - Build command: `hugo --gc --minify`
   - Build output: `public`
   - Environment variable: `HUGO_VERSION=0.124.1`
4. Deploy. You'll get a `*.pages.dev` URL.
5. In Pages → Custom domains, add `amicalewifi.ch`. Cloudflare will
   prompt you to add the apex to a Cloudflare-managed zone (free).
6. At your registrar, switch the nameservers for `amicalewifi.ch` to
   the two servers Cloudflare assigns. DNS propagation: minutes to
   24 h.
7. Once DNS is live, the existing `/static/_headers` takes effect,
   `Cache-Control` becomes `max-age=31536000, immutable` on hashed
   assets, and the Lighthouse audit passes.
8. (Optional) Disable the GitHub Actions deploy step or repoint the
   `gh-pages` branch — once Cloudflare serves the apex, Pages
   becomes the source of truth.

## Option B — Netlify

1. https://app.netlify.com → Add new site → Import from Git → pick the repo.
2. Build settings auto-fill from the `netlify.toml` in this repo.
3. Site → Domain management → Add `amicalewifi.ch`. Netlify gives
   you records to add at the registrar (or transfer DNS to
   Netlify's nameservers).
4. Wait for DNS to propagate. The `/_headers` file at the repo root
   is honored automatically.

## Why not just keep GH Pages?

GH Pages serves through Fastly with a fixed 10-minute TTL. There is
no plan or setting to change this. Putting Cloudflare in front of
the existing GH Pages origin is also possible, but it adds a hop
without giving you build flexibility — Cloudflare Pages is simpler.

## What stays the same

- The Hugo source remains in this repo.
- The GitHub Actions workflow stays — useful if you ever want to
  redeploy back to GH Pages.
- DNS-managed email (MX records) is independent of where the website
  is hosted; Cloudflare/Netlify will preserve your existing MX entries.
