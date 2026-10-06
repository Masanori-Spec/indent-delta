# IndentDelta

A small, in-browser EditorConfig exception-edit workbench. Import a declared configuration hierarchy and a finite path list, replace one config, inspect before/after resolved properties, and check explicit expectations before downloading a review pack.

No repository discovery, file writes, autosave, account, external fonts, analytics, or data uploads. Source text remains in memory. Serve the built static files over HTTP(S); no service worker or durable offline installation is implied.

## Try the example

1. The initial example appends `[*.txt] indent_size = 3` after a `[CMakeLists.txt]` exception.
2. Both `/demo/CMakeLists.txt` and `/demo/sub/CMakeLists.txt` unexpectedly become 3. Two “stay” assertions fail.
3. Choose **Keep exception last**. Only `docs/prose.txt` changes to 3; both CMakeLists files remain 2, `main.c` stays 2, and the nested `vendor` root stays 8.
4. Edit the text, run the review, and download the four-file ZIP. Local inspection is required before applying a replacement elsewhere.

The corrected example changes the earlier `*.txt` section to 3 and leaves the exception after it. It does not propose a new precedence algorithm.

## Import contract

`fixtures/demo.json` is the complete editable input example:

- `configs`: objects with an absolute virtual POSIX `path` ending in `/.editorconfig` and exact `content` text
- `paths`: finite absolute virtual file paths to review
- `absent`: exact ancestor `/.editorconfig` paths that the user has checked do not exist
- `target`: one imported config to replace
- `assertions`: `{path, property, expect, value?}`, where `expect` is `stay`, `change`, or `value`

Every traversed ancestor must be present or explicitly absent until `root = true` or the virtual filesystem root. Missing ancestry blocks a complete result, including when a replacement removes a root boundary. An absent entry is a user declaration, not a filesystem check.

`unset` is retained as a directive and is distinct from absent (`∅`). `tab_width` and `indent_size` derivations are shown. Passing checks means only those assertions passed on the imported scope, not that all changes are intended.

## Downloads

The uncompressed ZIP contains:

- `replacement.editorconfig`: the exact reviewed replacement text
- `original.editorconfig`: the untouched imported target text
- `path-manifest.json`: original hierarchy, finite paths, absent declarations, and assertions
- `review-report.json`: property matrix, matched-section order, assertion outcomes, completeness, and original/replacement text

Failure or incomplete reports can be downloaded and retain their status. Malformed or unsupported input cannot produce a current export. Edits invalidate the previous review; stale exports are disabled. Re-import the manifest and replacement separately to reproduce a review.

## Run and verify

Node 22+ and Python 3.12 are sufficient for the source/native checks:

```sh
npm ci
python -m pip install --require-hashes -r requirements-test.txt
npm run verify
python -m http.server 4173 --directory dist
```

Open `http://localhost:4173`. The pinned npm lockfile is part of the source. Python EditorConfig 0.17.1 is a test-only dependency; its wheel is hash-pinned and not vendored.

`npm run test:browser` is the Playwright suite, after installing the official Chromium runtime with `npx playwright install --with-deps chromium`. This is configured in GitHub Actions; browser execution status is separate from source/native test success. The initial authoring environment did not launch a local browser.

## Implementation

- Official `editorconfig` 3.0.2 and `@one-ini/wasm` 0.2.1 are the production resolver/parser
- Browser adapter only replaces the pinned WASM wrapper's filesystem byte-loader with identical embedded bytes; parser/matcher logic is unchanged
- `path-browserify` and `buffer` supply browser primitives; filesystem methods throw
- The app passes only explicitly traversed imported configs, using a separate cache per before/after phase
- Resolution/validation runs in disposable module Workers with an 8-second limit, generation guards, and fail-closed bounds
- No third-party CDN or runtime network request is required for processing
- Matched-section trace is precedence information, not full per-property provenance

The public low-level `parseFromFilesSync` API is deprecated upstream but pinned here; upgrades require the native and browser gates again.

## Limits and supported syntax

See [scope and grammar](docs/SCOPE.md). This is intentionally a conservative interoperability subset. Valid EditorConfig constructs outside the subset are rejected, not approximated. Independent official cores can disagree beyond the tested corpus. JS 3.0.2 is the production implementation; fixture agreement is not universal conformance proof.

## Evidence and positioning

See [verification](docs/VERIFICATION.md) and [research](docs/RESEARCH.md). The useful difference being explored is editable replacement plus bounded impact review and explicit change/stay checks. Existing tools already provide parsing, multi-file inspection, and provenance. Demand for this combined workflow has not been validated. No novel algorithm, patentability, commercial success, or whole-repository safety claim is made.

## Licensing

No license grant is made for original IndentDelta source. Third-party components retain their own licenses. The reproducible build writes complete upstream copyright and license texts to `dist/THIRD-PARTY-NOTICES.txt`, linked in the app. It includes MIT, ISC, BSD-3-Clause and BlueOak-1.0.0 components. These notices apply only to named dependencies. Neither `node_modules`, vendored binaries nor package caches are source deliverables.
