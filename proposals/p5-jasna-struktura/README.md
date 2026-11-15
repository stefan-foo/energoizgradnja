# V5 · Jasna struktura

Revised review candidate, 2026-11-15. P4 remains available.

[Open the site](dist/index.html) · [Service example](dist/usluge/remont-transformatora/index.html) ·
[English](dist/en/index.html) · [Single-file offline preview](../../energoizgradnja-v5-preview.html)

## Design decisions

1. **Design 1: Clear hierarchy.** Times New Roman, original logo, restrained navy,
   neutral surfaces and a supplied transformer winding photograph. Plain service
   names and scope replace service numbers and decorative arrows. Navigation uses
   restrained background/color states, with visible keyboard focus and no underlines. The service dropdown retains a small chevron; mobile language
   flags and their labels are vertically centered.
2. **Design 2: Readable service pages.** Consistent introductions, a readable article
   column, section navigation and a route back to all services. Replacement capacities
   use a list so unspecified qualifications do not appear as empty table cells.
3. **Design 3: Consolidated contact.** One form on Contact, one inquiry button at the
   end of other pages, conventional Contact navigation, and direct telephone/email
   links. Removed hero inquiry buttons, service-heading inquiry buttons and the
   fixed mobile contact bar. No upfront preview disclaimer appears in the page copy.
4. **Design 4: Clear preparation state.** All nine source service groups remain.
   Four descriptions are marked “Opis u pripremi / Description in preparation” in
   the list and on their page. This describes the content, not service availability.
5. **Design 5: Original photographs and purposeful animation.** Selected stronger
   supplied winding and transport photographs. Original technical details remain
   unaltered; derivatives are resized and compressed through the existing pipeline.
   The replacement-supply illustration is shared by home and the service page.
   Animated current flow follows the selected supply, with pause/resume controls;
   reduced-motion preferences disable animation. Flag links identify the equivalent
   Serbian and English pages. Production routes remain `/` and `/en/`.

## Source fidelity

The supplied Word document was restored and verified against its recorded SHA-256.
Antiword's DocBook extraction preserves bold runs used to identify the service groups.
The local source evidence is in `sources/README.md` and `content.md` at the
website root. Original documents and audit material remain local and are excluded
from the deployment repository.

- **Content 1:** 2500 kVA at 35 kV remains distinct from other replacement ratings.
- **Content 2:** English inspection scope says “Substation building condition.”
- **Content 3:** Nine groups preserve source boundaries. Transformer and substation
  repair share one group; monitoring remains separate.
- **Content 4:** Substation construction, MV networks, protection and compensation
  retain the supplied brief scope and preparation state.
- **Content 5:** 24/365 availability remains specific to inspections/revisions.
  All eight testing procedures, nine instrument categories, replacement ratings,
  and monitoring/reporting details are retained.
- **Content 6:** Restored Word/XML evidence resolves the prior missing-source limitation.
- **Content 7:** Photograph captions make no invented client, diagnosis or outcome claims.
- **Content 8:** Testing now uses “Organizacija pregleda i dokumentacija” /
  “Inspection coordination and documentation”; no added work-plan deliverable.
- **Content 9:** Home restores “Moguće je koristiti…” for replacement substations.
- **Content 10:** Monitoring states temporary installation or permanent fitting directly,
  without the editorial “Prema potrebi / Depending on the requirement” qualification.
- **Content 11:** The questioned outage paragraph does occur in the source, including
  “licenci, BZR i ostale dokumentacije”. Serbian now reproduces that paragraph exactly.
- **Content 12:** Decorative arrows and dash punctuation have been removed from the
  generated customer copy. Original source documents remain unchanged.

Independent content, design and photograph reviews informed this revision. The final
rendered checks below were performed by the implementing agent.

## Reference websites

- [Delta Star field service](https://www.deltastar.com/field-service/): direct service
  names, concise explanations and a deliberate contact endpoint.
- [Maddox repair](https://www.maddox.com/services/repair): topic navigation and equipment
  photography associated with the relevant service explanation.
- [Shermco services](https://shermco.com/services/): conventional Services/About/Contact
  hierarchy and clear telephone access.

Delta Star and Maddox were also inspected in the browser. No company claims, artwork,
customer identities or testimonials were copied.

SEO references: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
and [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions).

## Build ownership

- `build.js`: routes, shared layouts, contact form and metadata.
- `copy/services.json`: service catalog and preparation status.
- `copy/sr/` and `copy/en/`: detailed copy and the shared localized diagram fragments.
- `style.css` and `site.js`: responsive presentation, menus, validation and diagram controls.
- `prepare-assets.py`: responsive image export from supplied originals.
- `build-client-preview.js`: self-contained offline version.

Edit these sources, then regenerate. Do not edit generated pages directly.
No dependencies were added. Node uses built-in modules; photograph exports use the
already installed Pillow.

```powershell
node build-client-preview.js
python check.py
```

This builds 26 content pages plus a 404 document under `dist/` and the standalone
preview. The standalone preview needs JavaScript for navigation. Ordinary static
pages retain readable content and native navigation without JavaScript.

Source photographs: `1793837756519.jpg` (hero windings), `1793837755965.jpg`
(workshop), `1793836992772.jpg` (testing), `1793836622709.jpg` (transport).
WebP derivatives use 480/800/1600-pixel widths. The share image is JPEG.
Original logo and vCard are reused. Source documents are excluded from exports.

## Production export

[GitHub Pages setup](../../README.md) and the pinned workflow are now maintained
at the website repository root. The export supports an optional deployment prefix.

```powershell
node build.js --production --origin=https://YOUR-CONFIRMED-DOMAIN
python check.py production

# GitHub Pages project site
node build.js --production --origin=https://stefan-foo.github.io --base-path=/energoizgradnja
python check.py production --base-path=/energoizgradnja
```

Production exports go into `production/`. They contain directory URLs, self-canonicals,
reciprocal sr-Latn/en/x-default alternates, Organization/LocalBusiness, Service and
BreadcrumbList JSON-LD, content-hashed styles/scripts and 18 complete localized sitemap
entries. The eight preparation pages remain noindex and outside alternate clusters.
Preview exports are noindex and do not assume a production domain.

**Risk 1: Launch integration.** No real domain was assumed and nothing was deployed.
Hosting must supply real HTTP 404s, redirects, headers and caching. Live indexing,
Search Console and field performance require verification after launch.

**Risk 2: Form delivery.** This revision changes the presentation. No backend endpoint
has been configured. Client validation is functional; a submit does not send data or
claim success, and the entered values are preserved. The production endpoint, server
validation, privacy notice and delivery still require integration and testing. This
engineering note is kept here, outside the customer-facing design.

## Validation of this revision

- Node syntax checks, photo export and the offline/preview build passed.
- `check.py`: 27 HTML documents and 1,184 local references passed; includes heading,
  metadata, JSON-LD, fragment, language and export-boundary checks.
- Production export tested with reserved `https://example.test`: 18 sitemap URLs,
  reciprocal language alternates, directory URLs and eight pending exclusions passed.
  The temporary export was removed after verification.
- Exact outage paragraph verified against the extracted source. All replacement
  ratings retained. Generated text checked for decorative arrows, dash punctuation,
  service numbers and the removed preview notice.
- Browser checks: home, service index, repair, replacement and contact pages across
  320, 390, 768, 1100 and 1280-pixel viewport widths. Sampled pages had no horizontal
  overflow. No link underlines found on the mobile home page.
- Normal/repair diagram state, running flow, pause/resume, mobile menu Escape,
  equivalent-language navigation, service preselection, required-field validation,
  unsuccessful submission feedback and retained input verified.
- The offline preview passed Serbian/English switching and diagram state switching.
  Navigation also passed after the local server was stopped. It is approximately
  938 KB. Screenshots are under `review/`.
- The browser console recorded one MutationObserver error during iframe navigation.
  Neither the source scripts nor the standalone output use MutationObserver; its
  origin was not confirmed. The observed navigation and diagram checks passed.
- Live email delivery, deployment headers, screen-reader use, reduced-motion behavior
  in an emulated browser, and field Core Web Vitals were not tested. No ranking or
  Lighthouse score is claimed.

## GitHub Pages setup validation

- The local `origin` is `https://github.com/stefan-foo/energoizgradnja.git`.
- Both root and `/energoizgradnja` production builds passed `check.py`.
- A clean export of the staged repository passed the project-path build/check.
- The workflow YAML parses and its official action references use full commit pins.
- Five malformed base paths were rejected before export.
- Preview and standalone builds passed after restoring the services chevron.
- Browser verification confirmed centered mobile flags and all ten dropdown links.
- Administrator access was verified through the Git credential helper. Pages
  activation was rejected because the current plan does not support this private
  repository. Visibility, push and deployment await the owner’s choice.
