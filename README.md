# Energoizgradnja website

Bilingual static company website. The maintained implementation is
[`proposals/p5-jasna-struktura`](proposals/p5-jasna-struktura/README.md).

Remote: <https://github.com/stefan-foo/energoizgradnja>.

## Build locally

The site build has no npm dependencies. Use Node.js 22 or later and Python 3.12
or later for validation. Optimized photographs, the original logo and the vCard
are tracked, so a fresh checkout can build without the original Word files or
photograph collection.

```sh
cd proposals/p5-jasna-struktura
node build-client-preview.js
python check.py
```

This writes static preview pages to `dist/` and a self-contained
`energoizgradnja-v5-preview.html` at the repository root. Preview pages are noindex.
Edit source files rather than generated pages.

`prepare-assets.py` is an optional authoring tool for the local workspace. It
requires the original JPEG files at the repository root and the existing Pillow
installation. CI uses the checked-in optimized assets and does not run this tool.

## GitHub Pages

The [Pages workflow](.github/workflows/pages.yml) builds and checks the site, then
deploys only the generated `production/` directory. It runs on pushes to `main`
or a manual workflow dispatch. It uses GitHub's official actions pinned to exact
commits; see [dependency provenance](DEPENDENCIES.md).

The workflow reads the real origin and base path from GitHub Pages configuration.
The expected default address for this repository is
`https://stefan-foo.github.io/energoizgradnja/`. A custom domain configured later in
Pages will be picked up on the next workflow run. No custom domain is assumed.

To reproduce the project-site build locally:

```sh
cd proposals/p5-jasna-struktura
node build.js --production --origin=https://stefan-foo.github.io --base-path=/energoizgradnja
python check.py production --base-path=/energoizgradnja
```

For a domain-root deployment, omit `--base-path`. The prefix is applied consistently
to navigation, canonical URLs, language alternates, JSON-LD, sitemap and 404 links.
The complete pages are indexable; unfinished service descriptions remain noindex.

### Repository setup

1. Authenticate GitHub CLI with the account that owns this repository:
   `gh auth login -h github.com`.
2. Inspect the remote default branch, existing content and current Pages settings.
   Preserve any existing history; do not force-push or change repository visibility.
3. Enable **Settings → Pages → Build and deployment → Source: GitHub Actions**.
   For a repository without Pages, the equivalent API request is:

   ```sh
   gh api --method POST repos/stefan-foo/energoizgradnja/pages -f build_type=workflow
   ```

4. Push the reviewed source/workflow to `main` when authorized, then follow the
   workflow to completion and verify the returned site URL, language navigation,
   assets, sitemap and actual HTTP 404 behavior.

If this is a private repository, Pages availability depends on the account plan.
Do not make the repository public automatically. See
[GitHub Pages availability](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Current setup status

As of 2026-11-15: the local repository and `origin` are configured, and both root
and project-path builds pass local checks. The remote is empty and private, and
administrator access was verified using the existing Git credential helper.

GitHub rejected Pages activation with HTTP 422: “Your current plan does not support
GitHub Pages for this repository.” To use GitHub Pages, the owner must choose either
a public repository or a plan that supports Pages for private repositories. The
repository visibility has not been changed. No push or deployment has been performed.

Validation also passed from a clean export of the staged Git files, proving that
the deployable site does not depend on ignored documents, photographs or old
proposals. The workflow YAML parses, all action references use full commit pins,
and the staged source passes Git whitespace checks.

The contact form retains its current client validation but has no delivery endpoint.
GitHub Pages hosts static content; mail delivery needs a separately configured
endpoint. Do not present deployment success as verification of form delivery.

## Repository scope

Git tracks v5 source, optimized public assets and deployment configuration. Original
documents, full-resolution photograph collections, review screenshots, older proposals
and generated previews remain local and are excluded by `.gitignore`.
