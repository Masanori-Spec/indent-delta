# Verification ledger

## Passed locally before publication

- 33 source/native unit tests, including naive/fixed exception flows, missing ancestry, nested roots, unset versus absent, duplicates, grammar rejection, input/output bounds, ZIP extraction, and built-worker agreement
- 50 before/after resolutions across six scenarios agree among the browser-facing production resolver, physical official JS 3.0.2, and physical independent Python 0.17.1
- Negative controls: moving an exception ahead of a broad rule fails two stay assertions; removing root reports unknown ancestry; mutating protected end_of_line fails a stay check
- Source build succeeds with reproducible pinned dependencies and bundled upstream notices
- Additional independent fixed expected-value checks passed for all 50 resolutions on the frozen source, against both physical official cores; all ten bundled dependency notices and the byte-identical official WASM were checked

Evidence: `evidence/local-check.txt`, `evidence/native-parity.json`, and `evidence/browser-bundle-metafile.json`.

## Not yet established by this source snapshot

- Real-browser interactions/screenshots on the served app
- Actual hosted URL and deployed asset verification
- Hosted download extracted and consumed again by both physical official cores
- GitHub Actions success for the exact published commit

The CI browser suite is prepared to exercise the demo controls, edits/stale exports, root loss, malformed input recovery, target switching, import/repeated flows, ZIP download plus both independent physical consumers, mobile layout, 200% base-text enlargement, delayed-import race recovery, reload reset, and absence of external requests. A prepared test is not a passing test.

## Reproduce the exported review

`tests/browser.spec.mjs` saves the actual browser ZIP, extracts all four entries with Python's standard ZIP reader, checks byte-identical originals, and hands the extracted replacement and manifest to `scripts/python-oracle.py` and `scripts/js-physical-oracle.mjs`. Both write fresh temporary physical hierarchies and use the official cores. This verifies actual downloaded text rather than screenshot appearance alone.

`npm run test:native` uses the same physical consumers without a browser. Temporary directories are removed normally. No repository/config edits occur outside those controlled temporary fixtures.
