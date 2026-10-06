# Verification ledger

Release scope: public GitHub source plus a downloadable, locally served offline app. No remotely hosted application is required or promised.

## Verified browser/runtime baseline

[Run 37425061311](https://github.com/Masanori-Spec/indent-delta/actions/runs/37425061311) passed on exact commit `b5d944ab26e51fd21d0c351038ed5d65f05f3da2`:

- 33 original source/native tests passed
- 50 before/after resolutions across six scenarios agreed among the production resolver, physical official JS 3.0.2, and physical Python 0.17.1
- All three real Chromium browser tests passed, with no unexpected, flaky, skipped, or errored tests
- Browser controls covered naive/fixed exceptions, stale-export disabling, protected-property failure, removed roots, malformed input recovery, target switching, imports, reset/reload, delayed import cancellation, oversized import rollback, and Worker startup failure
- The actual downloaded four-file review ZIP was re-read by both official physical cores: 10 before/after resolutions matched fixed expected values, all six assertions passed, and one path changed
- Desktop, 390-pixel mobile, and 200% base-text enlargement screenshots were inspected; tables use bounded horizontal scrolling, with no observed page-level overflow/overlap blocker
- No external application requests were observed in the tested flow

The artifact ZIP was downloaded and checked against GitHub's SHA-256 digest:
`20990693a52ec7b5c1bd96a29973a906fbc140b05631d916c2aedc4b4146bbe0`.

The app-generated review ZIP SHA-256 was:
`eb9688ebc03274e98fd770c9cb4e203b046bf7c84e71db75f8ac3c4329f0ac92`.

The first Ubuntu 24.04 attempt stopped before any browser test because Chromium had no usable sandbox. Pinning Ubuntu 22.04 resolved that environment issue while retaining `chromiumSandbox: true`; no sandbox or security setting was disabled.

## Offline distribution verification

The release adds a deterministic nine-entry offline ZIP and a loopback-only standard-library Python launcher. All six app assets are byte-identical to the tested browser/runtime baseline. Key hashes:

- `app.js`: `eac1481eb4078db24d8a8c93d5f807ca107e6efb98b6ab8288b11ff2d483a4f8`
- `worker.js`: `c8310563d9b7a7d154a97776206288bba37ce3a34c8003e75ec8093f66879ad1`
- `index.html`: `8699b6985431d53141702df8e49e23dd458ee63e8239981b6dc69b2c687b3945`
- `style.css`: `d0253e39b440d9b2d80350b38c0a3b1cff2f787239188be09cb36e8e4a9aed1b`

The package writer verifies every ZIP entry and CRC, materializes the exact extracted bytes, and supplies `CONTENTS.sha256`. A 34th integration test starts the extracted launcher on an ephemeral loopback port and checks that all six served assets are byte-identical. The browser CI workflow now serves this same extracted offline package, instead of a separate build directory.

[Current workflow runs](https://github.com/Masanori-Spec/indent-delta/actions/workflows/verify.yml) are the source of truth for the latest published commit. The historical baseline above is identified explicitly and does not silently claim that a later revision passed.

## Independent checks and limits

Additional fixed expected-value checks passed for all 50 resolutions against both physical official cores. All ten bundled dependency notices and byte-identical official WASM were checked. Unsupported cross-core disagreements are rejected conservatively; finite fixture agreement is not universal conformance proof.

Negative controls fail as intended: placing an exception before a later broad rule fails both CMakeLists stay assertions; removing root reports unknown ancestry; changing protected end_of_line fails its stay assertion. No whole-repository or editor-plugin behavior claim is made.

## Reproduce the downloaded review

`tests/browser.spec.mjs` saves the actual app-generated ZIP, extracts its four entries using Python's standard ZIP reader, checks exact original bytes, and hands the extracted replacement/manifest to `scripts/python-oracle.py` and `scripts/js-physical-oracle.mjs`. Both create fresh temporary physical hierarchies and call official cores. `npm run test:native` exercises the same physical consumers without a browser. Temporary fixtures are removed normally, and malformed traversal paths are rejected before writing.
