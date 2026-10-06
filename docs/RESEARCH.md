# Positioning and evidence

Checked 2026-10-06. This is a small integration experiment for a portfolio, not validated commercial demand.

## Observed problem

[EditorConfig issue #385](https://github.com/editorconfig/editorconfig/issues/385) describes wanting `*.txt` treatment with a `CMakeLists.txt` exception, and concern about the fragility of redeclaring the exception later. This is evidence of a concrete configuration concern. It is not a request for a before/after impact matrix. The research also noted maintainers' existing ordering tests; IndentDelta does not present ordering as a new algorithm or an unfixed core defect.

## Existing capabilities

[AZTools EditorConfig Tester](https://aztools.app/en/t/editorconfig-tester/) already offers offline multi-config inspection, overrides/root cutoffs, resolved values, property source file/line, and derived tab widths. [The official JavaScript core](https://github.com/editorconfig/editorconfig-core-js) also exposes matching-file information and a CLI `--files` option. Provenance and multi-file resolution are established features.

[VS Code issue #329](https://github.com/editorconfig/editorconfig-vscode/issues/329) and [issue #356](https://github.com/editorconfig/editorconfig-vscode/issues/356) are related provenance/visibility signals from the research, not direct validation of a replacement-impact product.

## Modest difference under test

A single focused workflow: import the explicit hierarchy and finite paths; edit one replacement; review before/after values; express intended change/stay assertions; export original, replacement, manifest and review report together. The app is deliberately smaller than a repository linter, editor extension, or full provenance inspector.

No user interviews, adoption measurements, paid validation, novelty search, or patentability determination has been completed. There is no evidence here that users will prefer this combined workflow over existing tools or a small script. No outreach was performed.

## Pinned implementations

- JavaScript: `editorconfig` 3.0.2, npm lockfile integrity pinned; research source commit [71d4a0a](https://github.com/editorconfig/editorconfig-core-js/commit/71d4a0a5ee9b3ee3e07c82c456965697395fbbc0)
- INI runtime: `@one-ini/wasm` 0.2.1, published WASM bytes with upstream notice
- Independent Python core: EditorConfig 0.17.1, hash-pinned test wheel; research source commit [e1298e0](https://github.com/editorconfig/editorconfig-core-py/commit/e1298e0b8c66041f2e32e84d7c7bbe99ffdba339)

Known implementation disagreements discovered during review are rejected conservatively, documented in SCOPE.md, and covered by regression tests. Finite parity evidence does not justify a general EditorConfig conformance claim.
