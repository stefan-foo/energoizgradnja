const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const sourceRoot = __dirname;
const root = path.join(sourceRoot, 'dist');
execFileSync(process.execPath, [path.join(sourceRoot, 'build.js')], { stdio: 'inherit' });

const files = fs.readdirSync(root, { recursive: true })
  .filter(file => /(^|[\\/])index\.html$/.test(file))
  .map(file => file.replaceAll('\\', '/'));
const assets = [];
const assetIds = new Map();
const pages = {};
const escapeAttribute = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

function embeddedAsset(filename) {
  const mobileFile = filename.replace(/-1600\.(jpg|svg|webp)$/, '-800.$1');
  if (!assetIds.has(mobileFile)) {
    const mime = { '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.vcf': 'text/vcard' }[path.extname(mobileFile)];
    if (!mime) throw new Error(`Unsupported preview asset: ${mobileFile}`);
    const bytes = fs.readFileSync(path.join(root, mobileFile));
    assetIds.set(mobileFile, assets.length);
    assets.push(`data:${mime};base64,${bytes.toString('base64')}`);
  }
  return `__PREVIEW_ASSET_${assetIds.get(mobileFile)}__`;
}

for (const file of files) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const base = new URL(file, 'https://preview.invalid/');
  let body = source.match(/<body\b[^>]*>([\s\S]*?)<\/body>/)[1];
  body = body.replace(/<img\b[^>]*>/g, tag => {
    const src = tag.match(/\bsrc="([^"]+)"/)[1];
    const filename = new URL(src, base).pathname.slice(1);
    return tag.replace(/\s+srcset="[^"]*"/g, '')
      .replace(/\s+sizes="[^"]*"/g, '')
      .replace(/\bsrc="[^"]+"/, `src="${embeddedAsset(filename)}"`);
  });
  body = body.replace(/<a\b[^>]*>/g, tag => {
    const href = tag.match(/\bhref="([^"]*)"/)?.[1];
    if (!href || href.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(href)) return tag;
    const url = new URL(href, base);
    const target = url.pathname.slice(1);
    if (target.endsWith('.vcf')) return tag.replace(href, embeddedAsset(target));
    if (!files.includes(target)) throw new Error(`Unknown preview link in ${file}: ${href}`);
    const state = new URLSearchParams({ page: target });
    if (url.hash) state.set('anchor', url.hash.slice(1));
    if (url.search) state.set('query', url.search.slice(1));
    return tag.replace(`href="${href}"`, `href="#${escapeAttribute(state.toString())}" data-preview-page="${escapeAttribute(target)}" data-preview-anchor="${escapeAttribute(url.hash.slice(1))}" data-preview-query="${escapeAttribute(url.search.slice(1))}"`);
  });
  pages[file] = {
    lang: source.match(/<html lang="([^"]+)"/)[1],
    title: source.match(/<title>([^<]+)<\/title>/)[1],
    body,
    className: source.match(/<body class="([^"]+)"/)[1],
  };
}

function startPreview() {
  const data = JSON.parse(document.getElementById('preview-data').textContent);
  const frame = document.getElementById('site-preview');

  function initializePage(query, anchor) {
    document.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link || event.defaultPrevented) return;
      if (link.hasAttribute('data-preview-page')) {
        event.preventDefault();
        window.parent.postMessage({
          type: 'energoizgradnja-preview-navigation',
          page: link.dataset.previewPage,
          anchor: link.dataset.previewAnchor,
          query: link.dataset.previewQuery,
        }, '*');
        return;
      }
      const href = link.getAttribute('href');
      if (href?.startsWith('#')) {
        event.preventDefault();
        window.location.hash = href;
        document.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView();
      }
    });

    const requestedService = new URLSearchParams(query).get('usluga');
    const service = document.querySelector('select[name="service"]');
    if (requestedService && [...service.options].some(option => option.value === requestedService)) {
      service.value = requestedService;
    }
    if (anchor) {
      window.location.hash = anchor;
      requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView());
    }
  }

  function renderPage() {
    const state = new URLSearchParams(window.location.hash.slice(1));
    const route = state.get('page') || 'index.html';
    const page = data.pages[route];
    if (!page) {
      frame.srcdoc = '<p>Stranica nije pronađena. Page not found.</p>';
      return;
    }
    document.title = page.title;
    document.documentElement.lang = page.lang;
    frame.title = page.title;
    const body = page.body.replace(/__PREVIEW_ASSET_(\d+)__/g, (token, id) => data.assets[id]);
    const initialization = `(${initializePage.toString()})(${JSON.stringify(state.get('query') || '')}, ${JSON.stringify(state.get('anchor') || '')});`;
    const scripts = data.script + '\n' + initialization;
    frame.srcdoc = `<!DOCTYPE html><html lang="${page.lang}"><head>
      <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="robots" content="noindex,nofollow"><title>${page.title}</title>
      <style>${data.css}</style></head><body class="${page.className}">${body}
      <script>${scripts.replace(/<\/script/gi, '<\\/script')}<` + '/script></body></html>';
  }

  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || event.data?.type !== 'energoizgradnja-preview-navigation') return;
    if (!Object.hasOwn(data.pages, event.data.page)) return;
    const state = new URLSearchParams({ page: event.data.page });
    if (event.data.anchor) state.set('anchor', event.data.anchor);
    if (event.data.query) state.set('query', event.data.query);
    const hash = '#' + state;
    if (window.location.hash === hash) renderPage();
    else window.location.hash = hash;
  });
  window.addEventListener('hashchange', renderPage);
  renderPage();
}

const data = JSON.stringify({
  pages,
  assets,
  css: fs.readFileSync(path.join(sourceRoot, 'style.css'), 'utf8'),
  script: fs.readFileSync(path.join(sourceRoot, 'site.js'), 'utf8'),
}).replaceAll('<', '\\u003c');
const runtime = `(${startPreview.toString()})();`.replace(/<\/script/gi, '<\\/script');
const output = path.resolve(sourceRoot, '../../energoizgradnja-v5-preview.html');
fs.writeFileSync(output, `<!DOCTYPE html>
<html lang="sr-Latn"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Energoizgradnja | v5 pregled sajta</title>
<style>html, body { margin: 0; height: 100%; background: #fcfcfa; } iframe { display: block; width: 100%; height: 100vh; height: 100dvh; border: 0; } noscript { display: block; padding: 24px; font: 20px/1.5 'Times New Roman', serif; }</style>
</head><body>
<noscript>Za pregled svih stranica otvorite ovaj HTML fajl u pregledaču sa uključenim JavaScriptom. Open this HTML file in a browser with JavaScript enabled to view all pages.</noscript>
<iframe id="site-preview" title="Energoizgradnja"></iframe>
<script id="preview-data" type="application/json">${data}</script>
<script>${runtime}</script>
</body></html>
`);
console.log(`Client preview: ${files.length} pages, ${assets.length} embedded assets, ${fs.statSync(output).size} bytes.`);
