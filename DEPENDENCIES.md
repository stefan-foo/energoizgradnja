# Build and deployment provenance

Checked on 2026-11-15. The website itself uses Node built-ins and browser APIs;
there is no npm installation or application dependency lockfile. Local image export
uses the existing Pillow installation and is not run in CI.

## GitHub Actions

Publisher and upstream owner: GitHub's `actions` organization. The actions below
are the official repositories linked from GitHub's
[Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
Current release tags and full commit IDs were resolved through the official GitHub
REST API. Each resolved commit was reported as signature-verified by GitHub.

| Action | Release | Pinned commit | Release date | License |
| --- | --- | --- | --- | --- |
| [actions/checkout](https://github.com/actions/checkout) | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` | 2026-07-20 | MIT |
| [actions/configure-pages](https://github.com/actions/configure-pages) | v6.0.0 | `45bfe0192ca1faeb007ade9deae92b16b8254a0d` | 2026-03-25 | MIT |
| [actions/upload-pages-artifact](https://github.com/actions/upload-pages-artifact) | v5.0.0 | `fc324d3547104276b827a68afc52ff2a11cc49c9` | 2026-04-10 | MIT |
| [actions/deploy-pages](https://github.com/actions/deploy-pages) | v5.0.1 | `368f82528645a54fb793d4d04e342629a3f51346` | 2026-09-01 | MIT |

`upload-pages-artifact` is a composite action. At the pinned revision it uses
GitHub's [actions/upload-artifact](https://github.com/actions/upload-artifact)
v7.0.0 at `bbbca2ddaa5d8feaa63e36b76fdaad77386f024f`, also pinned by its upstream
manifest. GitHub reports that commit as signature-verified; its package license
is MIT. Its manifest and package dependencies were inspected alongside the four
direct actions.

## Scope of verification

- Official HTTPS repositories, release metadata, signed-commit status, `action.yml`,
  package manifests and license declarations were inspected. Recent 2026 releases
  establish ongoing maintenance, rather than relying on popularity counts.
- JavaScript actions execute their committed bundles using the runner's Node 24
  action runtime. No npm install/build lifecycle is run by this website workflow.
  Upstream build scripts use TypeScript/ncc; their development dependencies are not
  installed into this repository.
- Direct runtime package families include GitHub's Actions/Octokit libraries,
  parsing/error packages, artifact transport and glob matching. The Pages packaging
  composite invokes the system `tar` and its pinned official artifact action.
- The public repository-security-advisories endpoints returned zero published
  advisories for all five actions at review time. This is not a complete audit of
  every bundled npm dependency and is not a security guarantee.
- Full Git commit pins anchor the committed action bundles and upstream lockfiles.
  No separate upstream SHA-256 release checksums or independent build attestations
  were verified, and the compiled bundles were not independently reproduced.
- No third-party dependency was installed or executed locally for this setup.
  GitHub-hosted execution remains unverified until the workflow runs.

The workflow uses `ubuntu-24.04`. GitHub's
[runner inventory](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md)
for image `20261111.370.1` lists Node.js 22.23.4 and Python 3.12.3 as defaults.
These satisfy the source build and checker. The hosted image receives GitHub updates;
the workflow logs the actual versions used for each run. Local validation used
Node.js 24.14.1 and Python 3.14.0.

Build permissions are `contents: read` and `pages: read`; deployment receives only
`pages: write` and `id-token: write`. Checkout disables persisted Git credentials.
No personal access token or other repository secret is required by the workflow.
