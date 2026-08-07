# Contributing to SmartRisk Website

This document describes the conventions used in this repository: branching, commit messages, and content workflow; so that contributions stay consistent over time.

## Branching

- **`main`** is the default branch and is always deployable.
- **Feature branches** (`feature/<short-name>`) are used for anything that changes templates, layouts, CSS architecture, or site configuration; i.e. changes that could break the build or affect multiple pages at once.
    - Example: `feature/services`, `feature/projects-sidebar`, `feature/logo-marquee`
    - Merge back into `main` once the feature is working and tested locally with `hugo server`.
- **Content additions** (new or edited `.md` files under `content/`) can be committed directly to `main`, since they're low-risk and isolated to a single page. Test locally before pushing.
- **Refactor branches** (`refactor/<short-name>`) are used for restructuring existing implementation without changing site behavior, e.g. reorganizing build steps, splitting config files.
    - Example: `refactor/i18n-page-split`
- **Chore branches** are usually committed directly to `main` since they're low-risk (dependency bumps, config tweaks). Use a branch only if the chore touches the build pipeline.

## Commit Message Format

Commits follow a `type(scope): description` format, from [Conventional Commits](https://www.conventionalcommits.org/), with a couple of custom types added for content work.

```
<type>(<scope>): <short description>
```

### Types

| Type      | Use for |
|-----------|---------|
| `content` | Adding a **new** page (e.g. a new service or project `.md` file) |
| `edit`    | Changing the **body or front matter of an existing page** |
| `fix`     | Correcting errors: typo, broken link, wrong data, broken markdown rendering, incorrect i18n key, etc. |
| `feat`    | New template, layout, or site capability (new page type, new component, new functionality) |
| `style`   | CSS/visual changes only, no content or logic change |
| `chore`   | Maintenance tasks: dependency updates, config tweaks |
| `docs`    | Changes to documentation files like this one or the README |
| `refactor`    | Restructuring existing implementation without changing behavior |
| `build`    | Changes to build scripts, CI/CD pipeline, or deploy configuration |

### Scope

The scope is the section or area affected, in parentheses:

```
content(services): Add operational risk assessment page
edit(projects): Revise PT Petrokimia Gresik description
fix(services): Correct link to technical valuation page
feat(projects): Add year-based sidebar navigation
style(services): Adjust card hover transition
```

Common scopes: `services`, `projects`, `portfolio`, `about`, `team`, `contact`, `nav`, `i18n`, `css`, `data`, `scripts`, `redirects`.

### Examples

```
content(services): Add operational risk assessment page
edit(services): Update asset valuation summary
fix(projects): Fix broken image path in MRT Jakarta case study
feat(services): Add sidebar category navigation
style(services): Add hover color transition to arrow icon
chore: Change Hugo version in wrangler.toml
```

For a batch of similar additions in one commit:

```
content(projects): Add 5 case studies for 2021–2023 projects
```

## Known Issues

A few issues that once cost debugging time, check before re-diagnosing from scratch:

- **Don't run vendored third-party JS through `resources.Minify`.** Hugo's built-in JS minifier corrupted `maplibre-gl.js`'s embedded web worker bundle, breaking the map with no build error; it just fails to load at runtime.
- **`overflow` on `<body>` other than `visible` may break `position: sticky` site-wide.** Setting `overflow-x: hidden` (or `auto`/`scroll`) directly on `<body>` may stop the browser's normal "overflow propagates to the viewport" behavior, so `<body>` becomes its own scroll container instead of the page; possibly breaking every `position: sticky` element on the site. If you need to clip horizontal overflow, put it on `<html>` instead.
- **Any ancestor with non-`visible` overflow breaks `position: sticky` for its descendants**, even `overflow: hidden` added as a safety-net rule. If a sticky element stops sticking after an unrelated CSS change, check every ancestor between it and the page root for a stray `overflow` value first.
- **`static/_redirects` only matches on request path, not hostname.** A rule like `https://smartrisk-pln.pages.dev/* https://smartrisk-pln.com/:splat 301` looks valid but is silently ignored. Cloudflare Pages has no way to match a full source URL with a domain in `_redirects`. Domain-level redirects (e.g. `pages.dev` &rarr; the custom domain) must be configured as a Cloudflare **Bulk Redirect** in the account dashboard (Delivery & performance &rarr; Bulk redirects), not in this repo.



## Adding a New Service or Project Page

1. Create the `.md` file (EN version) under `content/services/` or `content/projects/`, and the matching translation (ID version) under `content/id/services/` or `content/id/projects/`.
2. **The filename becomes the URL slug** — make sure it matches the `href` already linked to it in `layouts/services/list.html` or `layouts/projects/list.html`. A mismatch here causes a 404 page not found error.
3. Fill in the required front matter fields (see an existing page for the current field list; e.g. `title`, `summary`, `category`/`tag`, `image`).
4. Run `hugo server` locally and click through to the new page to confirm it renders before committing.
5. Commit with `content(services): Add <page name>` or `content(projects): Add <page name>`.


## Updating Portfolio Map Data

`data/projects.yaml` (used by the interactive portfolio map) is generated from `portfolio.csv`, don't hand-edit the YAML directly, it will be overwritten next time the script runs.

1. Update `portfolio.csv` with the new rows (`Year, Category, Name, Location, Province, Coordinates`).
2. Regenerate the YAML: `python scripts/csv_to_yaml.py`
3. Run `hugo server` and check the Portfolio page: confirm the entries appear in the timeline and panel, and pins land in the right province on the map.
4. Commit both the updated `portfolio.csv` and generated `data/projects.yaml` together.
5. Commit with `content(portfolio): Update portfolio.csv and regenerate projects.yaml`.


## Before Pushing

- Run `hugo server` and check the page renders with no errors:  
  **For Windows local development:**
    - Before running the dev server, merge i18n source files:
        ```powershell
        powershell -ExecutionPolicy Bypass -File scripts\merge-i18n.ps1
        ```
    - To detect your local IP address (for older versions of Windows without IPv6 support use the following line instead:
 `set ip_address_string="IP Address"`):
        ```powershell
        set ip_address_string="IPv4 Address"
        for /f "usebackq tokens=2 delims=:" %%a in (`ipconfig ^| findstr /r /c:%ip_address_string%`) do set IP=%%a
        set IP=%IP: =%
        ```
    - Then start the Hugo dev server:
        ```powershell
        hugo server --disableFastRender --bind 0.0.0.0 --baseURL http://%IP%:1313/smartrisk/
        ```
        > Tip: you can save these commands in a local `serve_auto.bat` to run them together.
    - Preview at `http://localhost:1313/smartrisk/`
- Check both language versions (`/en/...` and `/id/...` or your configured language paths) if you added translated content.
- Confirm any new images referenced in front matter actually exist under `static/assets/images/...`.