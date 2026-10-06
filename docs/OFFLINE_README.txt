IndentDelta offline app

1. Extract this ZIP into a folder.
2. In that folder, run: python3 serve.py
   On Windows, use: py serve.py
3. Open the printed address, normally http://127.0.0.1:8765/
4. Keep the terminal open while using the app. Press Ctrl+C to stop.

Python 3.10+ is sufficient. No package installation or internet connection is
needed to run this bundle. The server binds only to your computer's loopback
address and serves only this extracted folder. To choose another local port:
python3 serve.py --port 8766

Do not just double-click index.html: browser module-worker restrictions on
file:// prevent a reliable launch. The local server is required; it does not
upload data or publish the app to the internet. Do not put private files in the
app folder while serving it.

All app assets, the EditorConfig parser and its WASM bytes, the example
manifest, and dependency notices are included. No CDN, telemetry, account,
autosave, or repository modification is used. Reviews remain in memory unless
you explicitly download them. Reloading resets the example.

Try "Keep exception last" to see the corrected example. Import an explicit
configuration hierarchy and finite paths using the manifest format, edit one
replacement, and review before applying anything elsewhere. The app is not a
whole-repository safety proof or editor-behavior emulator. Unsupported syntax
is rejected. Read the scope panel in the app.

CONTENTS.sha256 records the exact included files. Source and reproducibility:
https://github.com/Masanori-Spec/indent-delta

No license grant is made for original IndentDelta code. The complete licenses
in THIRD-PARTY-NOTICES.txt apply only to the named third-party dependencies.
