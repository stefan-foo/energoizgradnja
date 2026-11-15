"""Check the generated site's public navigation and indexing contracts."""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree


class Page(HTMLParser):
    def __init__(self, filename):
        super().__init__(convert_charrefs=True)
        self.filename = filename
        self.ids = []
        self.links = []
        self.images = []
        self.metadata = {}
        self.alternates = {}
        self.canonical = None
        self.title = ""
        self.h1 = 0
        self.lang = None
        self.schemas = []
        self.in_title = False
        self.in_schema = False
        self.schema_text = ""
        self.feed(filename.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "html":
            self.lang = attrs.get("lang")
        if tag == "h1":
            self.h1 += 1
        if tag == "title":
            self.in_title = True
        if tag == "meta":
            self.metadata[attrs.get("name", attrs.get("property"))] = attrs.get("content")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs["href"]
        if tag == "link" and attrs.get("rel") == "alternate":
            self.alternates[attrs["hreflang"]] = attrs["href"]
        if tag in ("a", "img", "script", "link"):
            ref = attrs.get("href", attrs.get("src"))
            if ref:
                self.links.append(ref)
        if tag == "img":
            self.images.append(attrs)
            self.links.extend(part.strip().split()[0] for part in attrs.get("srcset", "").split(",") if part.strip())
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.in_schema = True
            self.schema_text = ""

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        if self.in_schema:
            self.schema_text += data

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "script" and self.in_schema:
            self.schemas.append(json.loads(self.schema_text))
            self.in_schema = False


root = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("output", nargs="?", default="dist")
parser.add_argument("--base-path", default="", help="Expected deployment prefix, e.g. /energoizgradnja")
args = parser.parse_args()
base_path = args.base_path.rstrip("/")
output = (root / args.output).resolve()
production = output.name == "production"
pages = {filename.resolve(): Page(filename) for filename in output.rglob("*.html")}
assert len(pages) == 27, f"Expected 26 content pages plus 404, got {len(pages)}"
titles = set()
descriptions = set()
links_checked = 0
indexable = set()
pending_count = 0
services = json.loads((root / "copy/services.json").read_text(encoding="utf-8"))
pending_slugs = {service[lang] for service in services if service.get("pending") for lang in ("sr", "en")}

for filename, page in pages.items():
    label = str(filename.relative_to(output))
    assert page.h1 == 1, f"{label}: expected one H1"
    assert len(page.ids) == len(set(page.ids)), f"{label}: duplicate IDs"
    assert page.lang in ("sr-Latn", "en"), f"{label}: language missing"
    assert page.title and page.title not in titles, f"{label}: missing/duplicate title"
    titles.add(page.title)
    if filename.name == "404.html":
        assert "noindex" in page.metadata["robots"]
        assert page.links == [base_path + "/", base_path + "/en/"], "404 links must stay within the deployed site"
        continue
    description = page.metadata.get("description")
    assert description and description not in descriptions, f"{label}: missing/duplicate description"
    descriptions.add(description)
    assert page.schemas, f"{label}: missing structured data"
    pending = filename.parent.name in pending_slugs
    pending_count += int(pending)
    expected_indexed = production and not pending
    assert ("noindex" not in page.metadata["robots"]) == expected_indexed, f"{label}: incorrect indexing"
    if production:
        assert page.canonical and page.canonical.startswith("https://") and page.canonical.endswith("/"), f"{label}: canonical"
        expected_path = base_path + "/" + filename.relative_to(output).as_posix().removesuffix("index.html")
        assert urlsplit(page.canonical).path == expected_path, f"{label}: canonical deployment prefix"
        site_url = pages[output / "index.html"].canonical
        for schema in page.schemas:
            for node in schema.get("@graph", []):
                for field in ("@id", "url", "image", "logo"):
                    if field in node:
                        assert node[field].startswith(site_url), f"{label}: schema URL outside deployment: {node[field]}"
                for item in node.get("itemListElement", []):
                    assert item["item"].startswith(site_url), f"{label}: breadcrumb outside deployment"
        if pending:
            assert not page.alternates, f"{label}: pending page in alternate cluster"
            assert not any(node.get("@type") == "Service" for schema in page.schemas for node in schema.get("@graph", [])), f"{label}: pending Service schema"
        else:
            assert set(page.alternates) == {"sr-Latn", "en", "x-default"}, f"{label}: alternates missing"
            assert page.alternates[page.lang] == page.canonical, f"{label}: self alternate missing"
            indexable.add(page.canonical)
    else:
        assert not page.canonical and not page.alternates, f"{label}: preview should not assume a production domain"
    for image in page.images:
        assert image.get("alt"), f"{label}: missing image alt"
        assert int(image["width"]) > 0 and int(image["height"]) > 0, f"{label}: image dimensions"
        assert not image["src"].endswith(".svg"), f"{label}: SVG photo wrapper"
    for link in page.links:
        target = urlsplit(link)
        if target.scheme or target.netloc:
            continue
        url_path = unquote(target.path)
        if url_path.startswith("/") and base_path:
            assert url_path.startswith(base_path + "/"), f"{label}: link outside deployment: {link}"
            url_path = url_path[len(base_path):]
        resolved = (output / url_path.lstrip("/")) if url_path.startswith("/") else (filename.parent / url_path)
        if not url_path:
            resolved = filename
        elif resolved.is_dir():
            resolved = resolved / "index.html"
        resolved = resolved.resolve()
        assert resolved.is_relative_to(output), f"{label}: link escapes export: {link}"
        assert resolved.is_file(), f"{label}: missing link/asset: {link}"
        if target.fragment and resolved in pages:
            assert unquote(target.fragment) in pages[resolved].ids, f"{label}: missing anchor: {link}"
        if production and resolved.suffix == ".html":
            assert "index.html" not in url_path, f"{label}: production index.html URL"
        links_checked += 1

assert pending_count == 8, f"Expected 8 localized pending pages, got {pending_count}"
sitemap = ElementTree.parse(output / "sitemap.xml")
locations = {node.text for node in sitemap.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc")}
assert locations == indexable, "Sitemap and indexable pages disagree"
if production:
    assert len(locations) == 18, "Production must list 18 complete pages"
    by_canonical = {page.canonical: page for page in pages.values() if page.canonical}
    for page in by_canonical.values():
        for target in page.alternates.values():
            assert target in by_canonical, f"Unknown alternate {target}"
            assert page.canonical in by_canonical[target].alternates.values(), "Nonreciprocal alternate"
assert not list(output.rglob("*.doc")) and not list(output.rglob("*.py")), "Source files leaked into export"
print(f"PASS: {len(pages)} HTML documents, {links_checked} local references, 8 pending pages, {len(locations)} sitemap URLs; headings, metadata, language pairs, structured JSON and asset boundaries.")
