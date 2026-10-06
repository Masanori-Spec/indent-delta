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

## Run the offline app

The `indent-delta-offline.zip` deliverable is a self-contained app bundle. Extract it, run `python3 serve.py` (`py serve.py` on Windows), and open the printed loopback URL, normally `http://127.0.0.1:8765/`. Python 3.10+ is sufficient; no npm install or internet connection is needed. All UI/worker/WASM assets and third-party notices are included. Use `--port 8766` if needed. Keep the terminal open and press Ctrl+C to stop.

Do not double-click `index.html`: browser restrictions on file:// module workers require a local HTTP server. The launcher binds only to `127.0.0.1`, serves only the extracted folder, and does not open a browser or upload anything. Do not place private files in that folder while serving it.

The public source repository also includes the prebuilt `dist/` assets. After GitHub **Code → Download ZIP** and extraction, run from the repository folder:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:8765/`. This release is public source plus an offline app; a remotely hosted website is not required or promised.

## Rebuild and verify

Node 22+ and Python 3.12 are used for development and native checks:

```sh
npm ci
python -m pip install --require-hashes -r requirements-test.txt
npm run verify
```

This builds the app, deterministically packages `release/indent-delta-offline.zip`, checks its nine entries, runs 34 unit/integration tests, and compares 50 before/after resolutions with both physical official cores. `CONTENTS.sha256` records the exact offline files. The extracted package is materialized in ignored `.offline-preview/` for testing.

The pinned npm lockfile is part of the source. Python EditorConfig 0.17.1 is test-only, hash-pinned, and not vendored. To run the real-browser suite, install the official browser runtime with `npx playwright install --with-deps chromium`, then run `npm run test:browser`. Browser CI serves the actual extracted offline package and retains Chromium sandboxing on Ubuntu 22.04; no security settings are weakened.

The app's browser controls and four-file review download passed [CI on b5d944ab](https://github.com/Masanori-Spec/indent-delta/actions/runs/37425061311). The packaged app assets are byte-identical to that tested build. See [current verification runs](https://github.com/Masanori-Spec/indent-delta/actions/workflows/verify.yml) for the final/current source revision. CI also uploads the offline app ZIP, screenshots, browser report, and the app-generated review ZIP as `verification-evidence`.

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
