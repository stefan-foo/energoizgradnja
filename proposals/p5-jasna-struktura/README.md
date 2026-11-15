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
   column and section navigation. Breadcrumbs and the main menu link back to all services. Replacement capacities
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
   unaltered; derivatives are resized and compressed through the existing pipeline. The hero uses mild CSS brightness and contrast adjustment, with its original perspective preserved.
   The replacement-supply illustration is shared by home and the service page.
   A brief current-flow animation follows the selected supply and stops on its own;
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
- [Maddox](https://www.maddox.com/): transformer-focused homepage imagery and direct product navigation. Its [repair page](https://www.maddox.com/services/repair) associates equipment photographs with the relevant service explanation.
- [Shermco services](https://shermco.com/services/): conventional Services/About/Contact
  hierarchy and clear telephone access.

Delta Star and Maddox were also inspected in the browser. No company claims, artwork,
customer identities or testimonials were copied.

SEO references: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
and [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions).

## Build ownership

- `build.js`: routes, shared layouts, contact form and metadata.
- `copy/services.json`: service catalog and preparation status.
- `copy/gallery.json`: selected original photographs, captions, alt text and gallery sections.
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

This builds 28 content pages plus a 404 document under `dist/` and the standalone
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
BreadcrumbList JSON-LD, content-hashed styles/scripts and 20 complete localized sitemap
entries. The eight preparation pages remain noindex and outside alternate clusters.
Preview exports are noindex and do not assume a production domain.

**Risk 1: Hosting verification.** GitHub Pages is configured through the repository
workflow. No custom company domain is assumed. Live indexing, Search Console and
field performance require verification after launch.

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
- The owner approved public visibility, push and deployment. The repository is
  public and Pages is enabled with GitHub Actions. Workflow runs record deployment
  status and the published commit.

## Current local revision, 2026-11-15

- **Design 6: Simpler navigation.** Mobile uses an icon with an accessible menu
  name. Current, hover and pressed backgrounds span the menu width. The open
  menu prevents the underlying page from scrolling. Mobile service rows also
  reach the viewport edges. Repeated all-services links were removed from the
  homepage section, About prose and service sidebar; navigation and breadcrumbs remain.
- **Design 7: More usable width.** The desktop wrapper grows to 1360 px. Service
  articles use the space beside a 235 px contents column with a fixed 64 px gap.
  Short service descriptions do not reserve an empty sidebar. The original hero
  photo aligns with the headline and receives a mild CSS tonal adjustment.
  Generated photo edits were rejected after review and are not used in the site.
- **Design 8: Concise forms.** Name, email and service are required. Optional fields
  use plain labels; explanatory paragraphs and duplicate optional-field markers
  were removed. Validation errors and unsuccessful-send feedback remain explicit.
- **Design 9: Diagram and favicon.** The diagram identifies the client's transformer
  at the Niš workshop during repair and the replacement supplying the client's
  plant. The circular mark is clipped from the supplied logo in a self-contained
  SVG favicon, also embedded in the offline preview.
- **Content 13:** The About paragraph now retains the source's modal wording for
  complete replacement substations. Reviewed Serbian and English service copy
  against the supplied document. No service scope or capacity was added.

### Cookie and privacy review

- **Privacy 1: No consent banner indicated for this implementation.** Source
  inspection found no cookie, localStorage, sessionStorage, IndexedDB, analytics,
  fingerprinting, remote-font or tracking code. Assets are served by the site.
  Read-only live HTTP checks of Serbian home, English home, Contact and their
  seven unique resource URLs returned no Set-Cookie headers and no third-party
  resource URLs. This is a scoped inspection of the current version, not a
  guarantee about future integrations or every possible hosting response.
  No cookie banner or cookie preference storage was introduced.
- **Privacy 2: A privacy notice is separate from consent.**
  [GitHub Pages documents visitor IP logging for security](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection).
  A short footer-linked privacy notice should describe hosting and email enquiry
  processing. Before writing it as company policy, confirm actual retention
  periods or criteria, recipients, processing grounds and any international
  transfers. Add the eventual form provider when delivery is connected.
  The present form only validates in the browser and does not transmit entries.
- **Privacy 3: Legal references.** Article 160 of the
  [Serbian Electronic Communications Act](https://www.rem.rs/uploads/files/Zakoni/Zakon%20o%20elektronskim%20komunikacijama%2035-2023.pdf)
  addresses informed consent for terminal storage/access and the communication
  and explicitly requested service exceptions. Article 23 of the
  [Serbian Personal Data Protection Act](https://www.parlament.gov.rs/upload/archive/files/lat/pdf/zakoni/2018/2959-18-lat.pdf)
  covers information when collecting personal data. The
  [EU business guidance](https://europa.eu/youreurope/business/growing/digitalising/online-privacy/index_en.htm)
  likewise distinguishes cookies requiring consent from necessary ones. These
  support the scoped recommendation; no complete legal compliance certification
  is claimed. Reassess if analytics, embedded maps/video, CAPTCHA or a form
  delivery service is added.

### Current validation

- Preview and GitHub Pages project-path builds pass: 27 HTML documents, 1162
  local references, 8 pending pages and 18 production sitemap URLs.
- The checker verifies that only name, email and service are required on both
  localized contact pages. Browser checks reject a whitespace-only name and
  show localized required-field summaries. A valid local submission retains
  entries and reports that the inquiry has not been sent.
- No em/en dashes, removed CTA phrases or optional-name labels occur in generated
  pages. Source documents remain unchanged.
- Responsive checks include 1440 px desktop articles and hero alignment, and
  320/390 px mobile menus, service rows and diagram labels, plus the 768 px offline layout. No horizontal
  overflow was observed in those checks.
- Offline Serbian/English switching, diagram switching and service preselection pass.
  The circular favicon renders without the wordmark. The previously documented
  MutationObserver console error recurred during iframe navigation; the site
  source contains no MutationObserver usage and its origin remains unconfirmed.
- Changes remain local and unpushed. Form delivery and final company privacy
  policy remain launch work; no external delivery test was performed.

## Gallery and contact refinement, 2026-11-15

- **Design 10: Visible hero framing.** The original photograph now sits in a clipped
  frame with 12% magnification, a 3.5% left shift, a 1% upward shift and a 1.1-degree
  counterclockwise rotation. This recenters the winding assembly and levels its
  lower support without generating new equipment details or changing perspective.
  The same framing is included in the standalone preview.
- **Design 11: Dedicated gallery.** `/galerija/` and `/en/gallery/` contain 12 supplied
  photographs: four workshop views, five equipment nameplates, and three testing or
  transport views. Main navigation, footer and the homepage provide access. Section
  links, responsive images and a native dialog support browsing; the viewer offers
  previous/next, arrow keys, Escape, focus return and a scrollable full-size zoom.
  Plain image links remain available without JavaScript. The standalone preview
  embeds the larger images so the plates can be inspected offline.
- **Design 12: Form first.** The inquiry form precedes company details in document
  order, sits on the left on desktop, and appears above them on mobile. The Serbian
  name label is now `Ime *`; name, email and service remain required. No new form
  explanation, external embed or delivery service was introduced.
- **Content 14: Photographic evidence.** Captions describe visible parts, instruments,
  vehicles and plate markings. Manufacturer names identify the photographed plates;
  they do not establish partnerships or clients. The plate without a clearly
  identifiable manufacturer was removed at the owner's request. No photograph is
  presented as a verified before/after pair, completed repair or customer case study.
  `copy/gallery.json` records each original filename and its public derivative.
- **Content 15: Corrected winding caption.** The horizontal winding photograph is
  labeled "Namotaj sa izolacijom / Winding with insulation". Its caption, alt text
  and derivative filenames no longer claim that it rests on a workbench.

### Reference review

- [Comel repair references](https://comel.rs/reference-remont-transformatora/):
  equipment photographs accompanied by equipment identity and a short scope of work.
- [OCU Braidwood case study](https://www.ocugroup.com/case-studies/braidwood-primary-substation):
  project facts, challenge, solution and result are presented as distinct sections.
- [Moran transformer refurbishment](https://www.moran.de/en/siemens/):
  a project overview and a gallery showing individual work stages.
- [Moran contact](https://www.moran.de/en/kontakt/), inspected in the browser:
  form first, company information second. This ordering informs the revised contact
  layout while retaining Energoizgradnja's existing fields and visual identity.

The supplied material supports a factual photo gallery. Named case studies with job
dates, faults, repair scope and results would require matching records from the company.
Competitor copy, photographs, customer names and numerical claims were not reused.

### Validation

- Preview and GitHub Pages project-path production builds pass: 29 HTML documents,
  1,452 local references, 8 preparation pages and 20 production sitemap URLs.
  Node syntax checks and Git whitespace checks pass. No dependency was added.
- All 12 gallery image dimensions match the exported files. Both languages contain
  the same image set; the removed plate and `Ime i prezime` label are absent.
- Browser checks at 320, 390, 768, 1100 and 1440 px cover the gallery layout,
  mobile contact order, desktop form layout, hero framing and navigation. No
  horizontal page overflow was observed in the sampled layouts.
- Enlarged images, zoom, previous/next boundaries, keyboard navigation, Escape and
  returning focus to the originating photo were verified. Serbian whitespace-only
  name validation passed; a valid local English inquiry reports that it was not
  sent and retains the entered values.
- The standalone preview is approximately 6.9 MB because it includes the larger
  gallery images. Serbian/English navigation, embedded 1600 px images and zoom pass.
  Gallery navigation and image enlargement also passed after the preview server stopped.
  The previously recorded MutationObserver console error recurred during iframe
  navigation. No site source uses MutationObserver; its origin remains unconfirmed.
- Screenshots are saved locally under `review/`. No push or deployment was performed.
  Screen-reader testing and actual form delivery remain unverified.
