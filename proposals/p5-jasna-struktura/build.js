const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

// Preview and production exports are isolated from the source documents.
const root = __dirname;
const stylesheetVersion = createHash('sha256').update(fs.readFileSync(path.join(root, 'style.css'))).digest('hex').slice(0, 12);
const production = process.argv.includes('--production');
const originArgument = process.argv.find(argument => argument.startsWith('--origin='))?.slice(9);
const basePathArgument = process.argv.find(argument => argument.startsWith('--base-path='))?.slice(12) ?? '';
if (production && !originArgument) throw new Error('Production export requires --origin=https://your-confirmed-domain');
if (!production && originArgument) throw new Error('--origin is only used with --production. Preview does not assume a production domain.');
if (!production && basePathArgument) throw new Error('--base-path is only used with --production.');
const publicUrl = originArgument ? new URL(originArgument) : null;
const origin = publicUrl ? publicUrl.origin : '';
if (publicUrl && (publicUrl.protocol !== 'https:' || publicUrl.pathname !== '/' || publicUrl.search || publicUrl.hash || publicUrl.username || publicUrl.password)) {
  throw new Error('The origin must be an HTTPS origin without a path, credentials, query or fragment.');
}
const basePath = basePathArgument.replace(/\/$/, '');
if (!/^(?:\/[a-zA-Z0-9_-]+)*$/.test(basePath)) {
  throw new Error('The base path must be empty or a slash-separated ASCII path, for example /energoizgradnja.');
}
const siteUrl = origin + basePath;
const output = path.join(root, production ? 'production' : 'dist');
const scriptVersion = createHash('sha256').update(fs.readFileSync(path.join(root, 'site.js'))).digest('hex').slice(0, 12);
const email = 'energoizgradnja@gmail.com';
const telephone = '+381638277827';
const phoneLabel = '+381 63 827 7827';
const tr = (lang, sr, en) => lang === 'sr' ? sr : en;
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const services = JSON.parse(fs.readFileSync(path.join(root, 'copy/services.json'), 'utf8'));
const gallerySections = JSON.parse(fs.readFileSync(path.join(root, 'copy/gallery.json'), 'utf8'));
const localized = (lang, values) => values[lang === 'sr' ? 0 : 1];
const pagePath = (id, lang) => {
  const prefix = lang === 'sr' ? '' : 'en/';
  if (id === 'home') return prefix;
  if (id === 'services') return prefix + tr(lang, 'usluge/', 'services/');
  if (id === 'about') return prefix + tr(lang, 'o-nama/', 'about/');
  if (id === 'gallery') return prefix + tr(lang, 'galerija/', 'gallery/');
  if (id === 'contact') return prefix + tr(lang, 'kontakt/', 'contact/');
  const service = services.find(item => item.id === id);
  if (!service) throw new Error(`Unknown page: ${id}`);
  return prefix + tr(lang, 'usluge/', 'services/') + service[lang] + '/';
};
const relative = (from, to) => path.posix.relative(from || '.', to) || '.';
const href = (from, id, lang) => production ? basePath + '/' + pagePath(id, lang) : relative(from, pagePath(id, lang) + 'index.html');
const asset = (from, name) => relative(from, 'assets/' + name);
const contactHref = (from, lang, service) => href(from, 'contact', lang) + (service ? '?usluga=' + service.formValue : '') + '#kontakt';

function emailLink(lang) {
  const hint = tr(lang, 'Otvara mejl aplikaciju', 'Opens your email app');
  return `<a href="mailto:${email}" aria-label="${email}: ${hint}" title="${hint}">${email}</a>`;
}

function contactCard(lang, from) {
  return `<aside class="title-block" aria-label="${tr(lang, 'Podaci o firmi', 'Company details')}">
    <div class="card-heading"><span>Energoizgradnja d.o.o.</span><span>Niš, ${tr(lang, 'Srbija', 'Serbia')}</span></div>
    <dl>
      <div><dt>${tr(lang, 'Telefon', 'Telephone')}</dt><dd class="card-phone"><a href="tel:${telephone}">${phoneLabel}</a></dd></div>
      <div><dt>${tr(lang, 'E-pošta', 'Email')}</dt><dd>${emailLink(lang)}</dd></div>
      <div><dt>${tr(lang, 'Adresa', 'Address')}</dt><dd><address>Paraćinska 14<br>18106 Niš, Palilula</address></dd></div>
      <div><dt>PIB / ${tr(lang, 'Matični broj', 'Registration no.')}</dt><dd>110744409 / 21381802</dd></div>
    </dl>
    <a class="save-contact" href="${asset(from, 'energoizgradnja.vcf')}" download="energoizgradnja.vcf">${tr(lang, 'Sačuvajte kontakt', 'Save contact')}</a>
  </aside>`;
}

function responsiveImage(from, name, width, height, alt, sizes, eager = false) {
  return `<img src="${asset(from, name + '-800.webp')}" srcset="${asset(from, name + '-480.webp')} 480w, ${asset(from, name + '-800.webp')} 800w, ${asset(from, name + '-1600.webp')} 1600w" sizes="${sizes}" width="${width}" height="${height}" alt="${escape(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function photo(lang, from, name, width, height, alt, caption, classes = '', eager = false) {
  const image = responsiveImage(from, name, width, height, alt, classes.includes('wide') ? '(max-width: 800px) 100vw, 1360px' : '(max-width: 800px) 100vw, 600px', eager);
  return `<figure class="photograph ${classes}">${classes.includes('hero-photo') ? `<div class="photo-frame">${image}</div>` : image}<figcaption>${caption}</figcaption></figure>`;
}

function serviceList(lang, from, detailed = false) {
  const heading = detailed ? 'h2' : 'h3';
  return `<ul class="service-list${detailed ? ' detailed' : ''}">${services.map(item => `<li><a href="${href(from, item.id, lang)}"><div class="service-title"><${heading}>${localized(lang, item.name)}</${heading}>${item.pending ? `<span class="preparation-label">${tr(lang, 'Opis u pripremi', 'Description in preparation')}</span>` : ''}</div><div class="service-summary"><p>${localized(lang, item.copy)}</p>${detailed && item.highlights ? `<p class="service-highlights">${localized(lang, item.highlights)}</p>` : ''}</div></a></li>`).join('\n')}</ul>`;
}

function quoteForm(lang, serviceName) {
  const field = (name, sr, en, type = 'text', autocomplete = '', required = false) => `<div class="field"><label for="q-${name}">${tr(lang, sr, en)}${required ? ' *' : ''}</label><input id="q-${name}" name="${name}" type="${type}"${autocomplete ? ` autocomplete="${autocomplete}"` : ''}${required ? ' required' : ''}></div>`;
  const options = services.map(service => `<option value="${service.formValue}"${localized(lang, service.name) === serviceName ? ' selected' : ''}>${localized(lang, service.name)}</option>`).join('');
  return `<form class="quote" data-quote>
    <p class="form-note">${tr(lang, '* Obavezna polja', '* Required fields')}</p>
    <div class="form-summary" data-summary role="alert" tabindex="-1" hidden><p>${tr(lang, 'Proverite označena polja:', 'Check the marked fields:')}</p><ul></ul></div>
    <div class="form-row">${field('name', 'Ime', 'Name', 'text', 'name', true)}${field('company', 'Firma', 'Company', 'text', 'organization')}</div>
    <div class="form-row">${field('email', 'E-pošta', 'Email', 'email', 'email', true)}${field('phone', 'Telefon', 'Phone', 'tel', 'tel')}</div>
    <div class="field"><label for="q-service">${tr(lang, 'Usluga', 'Service')} *</label><select id="q-service" name="service" required><option value=""${serviceName ? '' : ' selected'} disabled>${tr(lang, 'Izaberite uslugu', 'Choose a service')}</option>${options}<option value="drugo">${tr(lang, 'Drugo / nisam siguran', 'Other / not sure')}</option></select></div>
    <div class="field"><label for="q-message">${tr(lang, 'Poruka', 'Message')}</label><textarea id="q-message" name="message" rows="5"></textarea></div>
    <div class="form-actions"><button class="button" type="submit" data-send-inquiry disabled>${tr(lang, 'Pošaljite upit', 'Send inquiry')}</button></div>
    <p class="form-status" id="inquiry-unavailable" role="status" hidden>${tr(lang, 'Upit nije poslat. Pozovite nas ili pišite na našu e-adresu.', 'Your inquiry has not been sent. Please call us or write to our email address.')}</p>
    <noscript><p class="mail-hint">${tr(lang, 'Za slanje upita kliknite na našu mejl adresu u kontakt podacima.', 'To send an inquiry, click our email address in the contact details.')}</p></noscript>
  </form>`;
}

function contactSection(lang, from) {
  return `<section class="contact-section" id="kontakt" aria-labelledby="contact-heading"><div class="wrap contact-grid">${quoteForm(lang)}${contactCard(lang, from)}</div></section>`;
}

function contactBand(lang, from, service) {
  return `<section class="contact-band" id="kontakt"><div class="wrap"><div><h2>${tr(lang, 'Kontakt', 'Contact')}</h2><p>${tr(lang, 'Pozovite nas ili pošaljite upit za potrebnu uslugu.', 'Call us or send an inquiry about the service you need.')}</p></div><div class="actions"><a class="button" href="${contactHref(from, lang, service)}">${tr(lang, 'Pošaljite upit', 'Send inquiry')}</a><a class="text-link" href="tel:${telephone}">${phoneLabel}</a></div></div></section>`;
}

function replacementDiagram(lang) {
  return fs.readFileSync(path.join(root, 'copy', lang, 'replacement-diagram.html'), 'utf8');
}

function home(lang, from) {
  return `<section class="hero" aria-labelledby="hero-heading"><div class="wrap hero-grid"><div class="hero-copy">
    <p class="eyebrow">Energoizgradnja d.o.o.</p>
    <h1 id="hero-heading">${tr(lang, 'Remont, ispitivanje i održavanje transformatora.', 'Transformer repair, testing and maintenance.')}</h1>
    <p class="hero-lead">${tr(lang, 'Remont energetskih i specijalnih transformatora do 35 kV. Zamenski transformatori i stanice uz sopstvenu logistiku i vozila.', 'Repair of power and special-purpose transformers up to 35 kV. Replacement transformers and substations with our own logistics and vehicles.')}</p>
    <div class="actions"><a class="button" href="#usluge">${tr(lang, 'Pogledajte usluge', 'Explore services')}</a></div>
  </div>${photo(lang, from, 'namotaji-transformatora', 1600, 1200, tr(lang, 'Tri namotaja aktivnog dela transformatora u radionici.', 'Three winding assemblies of a transformer active part in the workshop.'), tr(lang, 'Aktivni deo transformatora u radionici.', 'Transformer active part in the workshop.'), 'hero-photo', true)}</div></section>
  <section class="section home-services" id="usluge"><div class="wrap"><header class="section-heading"><h2>${tr(lang, 'Naše usluge', 'Our services')}</h2></header>${serviceList(lang, from)}</div></section>
  <section class="replacement-feature"><div class="wrap"><div><p class="eyebrow">${tr(lang, 'Tokom remonta', 'During repair')}</p><h2>${tr(lang, 'Vaš transformator u radionici.<br>Zamenski na vašoj lokaciji.', 'Your transformer in the workshop.<br>A replacement at your site.')}</h2><p>${tr(lang, 'Prilikom preuzimanja vašeg transformatora dovozimo zamenski i privremeno ga postavljamo.', 'When collecting your transformer, we deliver and temporarily install a replacement.')}</p><p>${tr(lang, 'Moguće je koristiti i zamenske kompletne transformatorske stanice koje povezujemo na vaše napajanje i potrošače.', 'You can also use complete replacement substations, which we connect to your supply and loads.')}</p><a class="text-link" href="${href(from, 'replacement', lang)}">${tr(lang, 'Zamenski transformatori i logistika', 'Replacement transformers and logistics')}</a></div>${replacementDiagram(lang)}</div></section>
  ${workExamples(lang, from)}
  ${contactBand(lang, from)}`;
}

function workExamples(lang, from) {
  const examples = [
    { id: 'repair', image: 'aktivni-deo-transformatora', caption: ['Aktivni deo transformatora', 'Transformer active part'], alt: ['Aktivni deo transformatora sa vidljivim namotajima u radionici.', 'Transformer active part with visible windings in the workshop.'], link: ['Remont transformatora', 'Transformer repair'] },
    { id: 'testing', image: 'terensko-ispitivanje', caption: ['Merni uređaj i ispitni kablovi', 'Measuring equipment and test leads'], alt: ['Merni uređaj i priključeni ispitni kablovi.', 'Measuring instrument and connected test leads.'], link: ['Merenja i ispitivanja', 'Measurements and testing'] },
    { id: 'replacement', image: 'dostava-zamenskog-transformatora', caption: ['Transformator na platformi kamiona', 'Transformer on a truck platform'], alt: ['Kamion Energoizgradnje sa transformatorom na platformi.', 'Energoizgradnja truck carrying a transformer.'], link: ['Zamenski transformatori i logistika', 'Replacement transformers and logistics'] },
  ];
  return `<section class="section examples-section" aria-labelledby="examples-heading"><div class="wrap"><header class="section-heading"><div><p class="eyebrow">${tr(lang, 'Radionica i teren', 'Workshop and field')}</p><h2 id="examples-heading">${tr(lang, 'Radionica, ispitivanje i transport.', 'Workshop, testing and transport.')}</h2></div><a class="text-link" href="${href(from, 'gallery', lang)}">${tr(lang, 'Pogledajte galeriju', 'View gallery')}</a></header><div class="work-examples">${examples.map(example => `<article>${photo(lang, from, example.image, 1600, 1200, localized(lang, example.alt), localized(lang, example.caption))}<a class="text-link" href="${href(from, example.id, lang)}">${localized(lang, example.link)}</a></article>`).join('')}</div></div></section>`;
}

function gallery(lang, from) {
  const label = tr(lang, 'Galerija', 'Gallery');
  const sections = gallerySections.map(section => `<section class="gallery-section" id="${section.id}" aria-labelledby="${section.id}-heading"><header class="section-heading"><div><h2 id="${section.id}-heading">${localized(lang, section.title)}</h2><p>${localized(lang, section.intro)}</p></div></header><div class="gallery-grid gallery-${section.id}">${section.items.map(item => {
    const caption = localized(lang, item.caption);
    const sizes = section.id === 'radionica' ? '(max-width: 700px) 100vw, (max-width: 1440px) 50vw, 664px' : '(max-width: 700px) 100vw, (max-width: 950px) 50vw, 440px';
    return `<figure class="photograph"><a class="gallery-open" href="${asset(from, item.asset + '-1600.webp')}" data-gallery-image aria-label="${tr(lang, 'Uvećaj fotografiju', 'Enlarge photo')}: ${escape(caption)}">${responsiveImage(from, item.asset, item.width, item.height, localized(lang, item.alt), sizes)}<span class="gallery-enlarge" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6M10 7v6"/></svg></span></a><figcaption>${escape(caption)}</figcaption></figure>`;
  }).join('')}</div></section>`).join('');
  return `${breadcrumbs(lang, from, 'gallery', label)}<section class="page-heading wrap"><h1>${tr(lang, 'Transformatori, radionica i teren.', 'Transformers, workshop and field.')}</h1><p class="lead">${tr(lang, 'Fotografije iz naše radionice i sa terena, sa detaljima opreme i natpisnim pločicama.', 'Photographs from our workshop and the field, including equipment details and nameplates.')}</p><nav class="gallery-jumps" aria-label="${tr(lang, 'Delovi galerije', 'Gallery sections')}">${gallerySections.map(section => `<a href="#${section.id}">${localized(lang, section.title)}</a>`).join('')}</nav></section><div class="wrap gallery-sections">${sections}</div>
  <dialog class="gallery-viewer" data-gallery-dialog aria-labelledby="gallery-caption"><form method="dialog"><button class="gallery-zoom" type="button" data-gallery-zoom aria-pressed="false">${tr(lang, 'Uvećaj', 'Zoom in')}</button><button class="gallery-close" autofocus>${tr(lang, 'Zatvori', 'Close')} <span aria-hidden="true">×</span></button></form><figure><div class="gallery-stage" data-gallery-stage tabindex="0" role="region" aria-label="${tr(lang, 'Fotografija', 'Photograph')}"></div><figcaption id="gallery-caption"></figcaption></figure><nav class="gallery-controls" aria-label="${tr(lang, 'Pregled fotografija', 'Photo navigation')}"><button type="button" data-gallery-previous>${tr(lang, 'Prethodna', 'Previous')}</button><span data-gallery-count role="status"></span><button type="button" data-gallery-next>${tr(lang, 'Sledeća', 'Next')}</button></nav></dialog>${contactBand(lang, from)}`;
}

function breadcrumbs(lang, from, id, label) {
  return `<nav class="breadcrumbs wrap" aria-label="${tr(lang, 'Putanja', 'Breadcrumb')}"><ol><li><a href="${href(from, 'home', lang)}">${tr(lang, 'Početna', 'Home')}</a></li>${services.some(item => item.id === id) ? `<li><a href="${href(from, 'services', lang)}">${tr(lang, 'Usluge', 'Services')}</a></li>` : ''}<li aria-current="page">${label}</li></ol></nav>`;
}

function servicePage(service, lang, from) {
  const name = localized(lang, service.name);
  let content = `${breadcrumbs(lang, from, service.id, name)}<section class="page-heading wrap"><h1>${localized(lang, service.heading)}</h1><p class="lead">${localized(lang, service.copy)}</p></section>`;
  const sections = [];
  const body = fs.readFileSync(path.join(root, 'copy', lang, service.id + '.html'), 'utf8').replace('{{replacement-diagram}}', () => replacementDiagram(lang)).replace(/<h2>([\s\S]*?)<\/h2>/g, (heading, title) => {
    const anchor = 'service-section-' + (sections.length + 1);
    sections.push({ anchor, title: title.replace(/<br\s*\/?\s*>/g, ' ').replace(/<[^>]+>/g, '') });
    return `<h2 id="${anchor}">${title}</h2>`;
  });
  const sidebar = sections.length > 1 ? `<aside class="service-sidebar"><nav class="service-contents" aria-label="${tr(lang, 'Na ovoj stranici', 'On this page')}"><p>${tr(lang, 'Na ovoj stranici', 'On this page')}</p><ol>${sections.map(section => `<li><a href="#${section.anchor}">${section.title}</a></li>`).join('')}</ol></nav></aside>` : '';
  content += `<div class="wrap service-layout${sidebar ? '' : ' single-section-layout'}${service.pending ? ' pending-layout' : ''}">${sidebar}<article class="service-body" aria-label="${name}">${body}</article></div>`;
  content += contactBand(lang, from, service);
  return content;
}

function about(lang, from) {
  const overview = fs.readFileSync(path.join(root, 'copy', lang, 'about.html'), 'utf8');
  const clients = fs.readFileSync(path.join(root, 'copy', lang, 'about-clients.html'), 'utf8');
  return `${breadcrumbs(lang, from, 'about', tr(lang, 'O nama', 'About us'))}
  <section class="page-heading wrap"><p class="eyebrow">${tr(lang, 'O nama', 'About us')}</p><h1>Energoizgradnja d.o.o. Niš</h1></section>
  <div class="section compact-top">
    <div class="wrap about-intro">
      <div>${overview}</div>
      ${photo(lang, from, 'dostava-zamenskog-transformatora', 1600, 1200, tr(lang, 'Kamion Energoizgradnje sa transformatorom na platformi.', 'Energoizgradnja truck carrying a transformer.'), tr(lang, 'Transport transformatora sopstvenim vozilima.', 'Transformer transport with our own vehicles.'), '', true)}
    </div>
    <section class="wrap about-clients" aria-labelledby="about-clients-heading">${clients}</section>
  </div>
  ${contactBand(lang, from)}`;
}

function languageFlag(lang) {
  return lang === 'sr'
    ? '<svg viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height="2" fill="#fff"/><rect width="3" height=".67" fill="#c6363c"/><rect y=".67" width="3" height=".67" fill="#0c4076"/></svg>'
    : '<svg viewBox="0 0 60 30" aria-hidden="true"><rect width="60" height="30" fill="#012169"/><path d="M0 0l60 30M60 0L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30M60 0L0 30" stroke="#c8102e" stroke-width="2"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#c8102e" stroke-width="6"/></svg>';
}

function header(id, lang, from) {
  const other = lang === 'sr' ? 'en' : 'sr';
  const navLink = (target, label) => `<a href="${href(from, target, lang)}"${id === target ? ' aria-current="page"' : ''}>${label}</a>`;
  const serviceLinks = navLink('services', tr(lang, 'Sve usluge', 'All services')) + services.map(service => navLink(service.id, localized(lang, service.name))).join('\n');
  const serviceMenu = `<details class="services-menu${id === 'services' || services.some(service => service.id === id) ? ' current-section' : ''}"><summary>${tr(lang, 'Usluge', 'Services')}<span class="disclosure-mark" aria-hidden="true"></span></summary><div class="services-dropdown">${serviceLinks}</div></details>`;
  const navLinks = serviceMenu + navLink('gallery', tr(lang, 'Galerija', 'Gallery')) + navLink('about', tr(lang, 'O nama', 'About')) + navLink('contact', tr(lang, 'Kontakt', 'Contact'));
  return `<a class="skip" href="#main">${tr(lang, 'Preskoči na sadržaj', 'Skip to content')}</a>
    <header class="site-header"><div class="wrap header-bar">
      <a class="brand" href="${href(from, 'home', lang)}" aria-label="${tr(lang, 'Energoizgradnja: početna', 'Energoizgradnja: home')}"><img src="${asset(from, 'logo-original.png')}" width="276" height="80" alt="Energoizgradnja"></a>
      <nav class="main-nav" aria-label="${tr(lang, 'Glavna navigacija', 'Main navigation')}">${navLinks}</nav>
      <div class="header-end"><a class="header-phone" href="tel:${telephone}">${phoneLabel}</a><a class="language" href="${href(from, id, other)}" hreflang="${other === 'sr' ? 'sr-Latn' : 'en'}" lang="${other === 'sr' ? 'sr-Latn' : 'en'}">${languageFlag(other)} ${other === 'sr' ? 'Srpski' : 'English'}</a></div>
      <details class="mobile-menu"><summary aria-label="${tr(lang, 'Meni', 'Menu')}"><svg class="menu-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><g class="menu-icon-bars"><path d="M3 6h18M3 12h18M3 18h18"/></g><path class="menu-icon-close" d="M5 5l14 14M19 5L5 19"/></svg></summary>
        <nav aria-label="${tr(lang, 'Mobilna navigacija', 'Mobile navigation')}">${navLinks}<a href="tel:${telephone}">${phoneLabel}</a><a href="${href(from, id, other)}" hreflang="${other === 'sr' ? 'sr-Latn' : 'en'}" lang="${other === 'sr' ? 'sr-Latn' : 'en'}">${languageFlag(other)} ${other === 'sr' ? 'Srpski' : 'English'}</a></nav>
      </details>
    </div></header>`;
}

function footer(lang, from, id) {
  const other = lang === 'sr' ? 'en' : 'sr';
  return `<footer class="footer"><div class="wrap">
      <div class="footer-grid">
        <div><p class="footer-name">Energoizgradnja d.o.o. Niš</p><p>${tr(lang, 'Transformatori i transformatorske stanice.', 'Transformers and transformer substations.')}</p><address>Paraćinska 14<br>18106 Niš, Palilula, ${tr(lang, 'Srbija', 'Serbia')}</address></div>
        <div><h2>${tr(lang, 'Kontakt', 'Contact')}</h2><a class="footer-phone" href="tel:${telephone}">${phoneLabel}</a>${emailLink(lang)}<a href="${asset(from, 'energoizgradnja.vcf')}" download="energoizgradnja.vcf">${tr(lang, 'Sačuvajte kontakt', 'Save contact')}</a></div>
        <nav aria-label="${tr(lang, 'Navigacija u podnožju', 'Footer navigation')}"><h2>${tr(lang, 'Istražite', 'Explore')}</h2><a href="${href(from, 'services', lang)}">${tr(lang, 'Sve usluge', 'All services')}</a><a href="${href(from, 'gallery', lang)}">${tr(lang, 'Galerija', 'Gallery')}</a><a href="${href(from, 'about', lang)}">${tr(lang, 'O nama', 'About us')}</a><a href="${href(from, 'contact', lang)}">${tr(lang, 'Kontakt', 'Contact')}</a></nav>
      </div>
      <div class="footer-bottom"><span>${tr(lang, 'PIB', 'Tax ID')}: 110744409 · ${tr(lang, 'MB', 'Registration no.')}: 21381802</span><a href="${href(from, id, other)}" lang="${other === 'sr' ? 'sr-Latn' : 'en'}" hreflang="${other === 'sr' ? 'sr-Latn' : 'en'}">${languageFlag(other)} ${other === 'sr' ? 'Srpski' : 'English'}</a></div>
    </div></footer>`;
}

function metadata(id, lang) {
  const service = services.find(item => item.id === id);
  if (service) return { title: localized(lang, service.title), description: localized(lang, service.copy), name: localized(lang, service.name), pending: Boolean(service.pending) };
  const data = {
    home: [
      ['Remont i ispitivanje transformatora | Energoizgradnja Niš', 'Transformer repair and testing | Energoizgradnja, Niš'],
      ['Remont transformatora do 35 kV, ispitivanje i preventivno održavanje. Zamenski transformatori i stanice uz sopstvenu logistiku. Niš.', 'Transformer repair up to 35 kV, testing and preventive maintenance. Replacement transformers and substations with our own logistics. Niš, Serbia.'],
      ['Početna', 'Home'],
    ],
    services: [
      ['Usluge za transformatore | Energoizgradnja Niš', 'Transformer services | Energoizgradnja, Niš'],
      ['Zamenski transformatori i stanice, ispitivanje, remont, izgradnja stanica, delovi, praćenje rada, zaštita, kompenzacija reaktivne energije i SN mreže.', 'Replacement transformers and substations, testing, repair, substation construction, parts, monitoring, protection, reactive power compensation and MV networks.'],
      ['Usluge', 'Services'],
    ],
    gallery: [
      ['Galerija transformatora i radionice | Energoizgradnja Niš', 'Transformer and workshop gallery | Energoizgradnja, Niš'],
      ['Fotografije transformatora, namotaja, natpisnih pločica, merne opreme i transporta iz galerije Energoizgradnje iz Niša.', 'Photographs of transformers, windings, equipment nameplates, testing instruments and transport from Energoizgradnja in Niš.'],
      ['Galerija', 'Gallery'],
    ],
    about: [
      ['O nama | Energoizgradnja d.o.o. Niš', 'About us | Energoizgradnja d.o.o., Niš'],
      ['Energoizgradnja d.o.o. iz Niša: transformatori i transformatorske stanice, sopstvena logistika i vozila. Paraćinska 14, Niš.', 'Energoizgradnja d.o.o., Niš: transformers and substations, with our own logistics and vehicles. Paraćinska 14, Niš, Serbia.'],
      ['O nama', 'About us'],
    ],
    contact: [
      ['Kontakt i ponuda | Energoizgradnja Niš', 'Contact and quotes | Energoizgradnja, Niš'],
      ['Pozovite +381 63 827 7827 ili pišite na energoizgradnja@gmail.com. Paraćinska 14, Niš.', 'Call +381 63 827 7827 or email energoizgradnja@gmail.com. Paraćinska 14, Niš, Serbia.'],
      ['Kontakt', 'Contact'],
    ],
  }[id];
  return { title: localized(lang, data[0]), description: localized(lang, data[1]), name: localized(lang, data[2]), pending: false };
}

function structuredData(id, lang, meta) {
  const url = siteUrl + '/' + pagePath(id, lang);
  const company = {
    '@type': ['Organization', 'LocalBusiness'], '@id': siteUrl + '/#org',
    name: 'Energoizgradnja d.o.o.', legalName: 'Energoizgradnja d.o.o. Niš',
    url: siteUrl + '/', email, telephone, taxID: '110744409',
    image: siteUrl + '/assets/share.jpg',
    logo: siteUrl + '/assets/logo-original.png',
    identifier: { '@type': 'PropertyValue', propertyID: 'MB', value: '21381802' },
    address: { '@type': 'PostalAddress', streetAddress: 'Paraćinska 14', postalCode: '18106', addressLocality: 'Niš', addressRegion: 'Palilula', addressCountry: 'RS' },
  };
  if (!siteUrl) {
    const { '@id': identity, url: companyUrl, image, logo, ...previewCompany } = company;
    return JSON.stringify({ '@context': 'https://schema.org', ...previewCompany });
  }
  const pageTypes = { contact: 'ContactPage', about: 'AboutPage', gallery: 'ImageGallery' };
  const graph = [company, { '@type': pageTypes[id] || 'WebPage', '@id': url + '#page', url, name: meta.name, description: meta.description, inLanguage: lang === 'sr' ? 'sr-Latn' : 'en', about: { '@id': company['@id'] } }];
  if (services.some(item => item.id === id) && !meta.pending) graph.push({ '@type': 'Service', '@id': url + '#service', url, name: meta.name, description: meta.description, provider: { '@id': company['@id'] } });
  if (id !== 'home') {
    const items = [{ '@type': 'ListItem', position: 1, name: tr(lang, 'Početna', 'Home'), item: siteUrl + '/' + pagePath('home', lang) }];
    if (services.some(item => item.id === id)) items.push({ '@type': 'ListItem', position: 2, name: tr(lang, 'Usluge', 'Services'), item: siteUrl + '/' + pagePath('services', lang) });
    items.push({ '@type': 'ListItem', position: items.length + 1, name: meta.name, item: url });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: items });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c');
}

function render(id, lang) {
  const from = pagePath(id, lang);
  const meta = metadata(id, lang);
  const url = siteUrl + '/' + from;
  let content;
  if (id === 'home') content = home(lang, from);
  else if (id === 'about') content = about(lang, from);
  else if (id === 'gallery') content = gallery(lang, from);
  else if (id === 'services') content = `${breadcrumbs(lang, from, id, meta.name)}<section class="page-heading wrap"><p class="eyebrow">${meta.name}</p><h1>${tr(lang, 'Usluge za transformatore i transformatorske stanice.', 'Transformer and substation services.')}</h1><p class="lead">${tr(lang, 'Pregled usluga, tehničkog obuhvata i opreme.', 'Explore our services, technical scope and equipment.')}</p></section><section class="section compact-top home-services"><div class="wrap">${serviceList(lang, from, true)}</div></section>${contactBand(lang, from)}`;
  else if (id === 'contact') content = `${breadcrumbs(lang, from, id, meta.name)}<section class="page-heading contact-page-heading wrap"><h1 id="contact-heading">${tr(lang, 'Kontakt', 'Contact')}</h1></section>${contactSection(lang, from)}`;
  else content = servicePage(services.find(item => item.id === id), lang, from);
  if (production) content = content.replace(/href="([^"#]*index\.html(?:[?#][^"]*)?)"/g, (match, target) => {
    const resolved = new URL(target, siteUrl + '/' + from);
    return `href="${resolved.pathname.replace(/index\.html$/, '')}${resolved.search}${resolved.hash}"`;
  });
  const alternates = !siteUrl || meta.pending ? '' : [['sr-Latn', 'sr'], ['en', 'en'], ['x-default', 'en']].map(([locale, language]) => `<link rel="alternate" hreflang="${locale}" href="${siteUrl}/${pagePath(id, language)}">`).join('\n');
  return `<!DOCTYPE html>
<html lang="${lang === 'sr' ? 'sr-Latn' : 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(meta.title)}</title>
<meta name="description" content="${escape(meta.description)}">
<meta name="robots" content="${production && !meta.pending ? 'index,follow,max-image-preview:large' : 'noindex,follow'}">
${siteUrl ? `<link rel="canonical" href="${url}">` : ''}
${alternates}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Energoizgradnja d.o.o.">
<meta property="og:title" content="${escape(meta.title)}">
<meta property="og:description" content="${escape(meta.description)}">
${siteUrl ? `<meta property="og:url" content="${url}">` : ''}
<meta property="og:locale" content="${lang === 'sr' ? 'sr_RS' : 'en_GB'}">
<meta property="og:locale:alternate" content="${lang === 'sr' ? 'en_GB' : 'sr_RS'}">
${siteUrl ? `<meta property="og:image" content="${siteUrl}/assets/share.jpg">` : ''}
<meta property="og:image:width" content="1600">
<meta property="og:image:height" content="1200">
<meta property="og:image:alt" content="${tr(lang, 'Aktivni deo transformatora u radionici.', 'Transformer active part in the workshop.')}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="${asset(from, 'favicon.svg')}">
<link rel="stylesheet" href="${asset(from, 'style.' + stylesheetVersion + '.css')}">
<script src="${asset(from, 'site.' + scriptVersion + '.js')}" defer></script>
<script type="application/ld+json">${structuredData(id, lang, meta)}</script>
</head>
<body class="page-${id}">
${header(id, lang, from)}
<main id="main">${content}</main>
${footer(lang, from, id)}
</body>
</html>
`;
}

const ids = ['home', 'services', ...services.map(item => item.id), 'gallery', 'about', 'contact'];
fs.mkdirSync(path.join(output, 'assets'), { recursive: true });
for (const filename of fs.readdirSync(path.join(output, 'assets'))) {
  if (/^(style|site)\.[a-f0-9]{12}\.(css|js)$/.test(filename) && filename !== `style.${stylesheetVersion}.css` && filename !== `site.${scriptVersion}.js`) {
    fs.unlinkSync(path.join(output, 'assets', filename));
  }
}
fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
fs.copyFileSync(path.join(root, 'style.css'), path.join(output, 'assets', `style.${stylesheetVersion}.css`));
fs.copyFileSync(path.join(root, 'site.js'), path.join(output, 'assets', `site.${scriptVersion}.js`));
for (const lang of ['sr', 'en']) {
  for (const id of ids) {
    const filename = path.join(output, pagePath(id, lang), 'index.html');
    fs.mkdirSync(path.dirname(filename), { recursive: true });
    fs.writeFileSync(filename, render(id, lang));
  }
}
const indexed = ids.filter(id => !services.find(item => item.id === id)?.pending);
const sitemap = indexed.flatMap(id => ['sr', 'en'].map(lang => `<url><loc>${siteUrl}/${pagePath(id, lang)}</loc>${[['sr-Latn', 'sr'], ['en', 'en'], ['x-default', 'en']].map(([locale, language]) => `<xhtml:link rel="alternate" hreflang="${locale}" href="${siteUrl}/${pagePath(id, language)}"/>`).join('')}</url>`));
fs.writeFileSync(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${production ? sitemap.join('\n') : ''}\n</urlset>\n`);
fs.writeFileSync(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\n${production ? 'Sitemap: ' + siteUrl + '/sitemap.xml\n' : '# Preview: all HTML pages carry noindex.\n'}`);
fs.writeFileSync(path.join(output, '404.html'), `<!DOCTYPE html><html lang="sr-Latn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,follow"><title>Stranica nije pronađena | Energoizgradnja</title></head><body style="font:20px/1.6 'Times New Roman',serif;max-width:50rem;margin:10vh auto;padding:24px"><h1>Stranica nije pronađena</h1><p lang="en">Page not found.</p><p><a href="${basePath}/">Početna</a> · <a href="${basePath}/en/" lang="en">Home in English</a></p></body></html>`);
console.log(`Built ${ids.length * 2} pages (${production ? 'production; incomplete services remain noindex' : 'preview; all pages noindex'}).`);
