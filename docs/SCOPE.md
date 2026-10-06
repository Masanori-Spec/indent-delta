# Scope and grammar

This release is an explicit-input review tool. It does not enumerate a repository, discover missing `.editorconfig` files, inspect file contents, emulate editor plugins, apply edits, or attest to all possible paths.

## Ancestry

Paths are absolute, normalized POSIX names in a virtual filesystem. Empty segments, `.` / `..`, backslashes, controls, config directory glob metacharacters (`{}[]*?`), and file paths naming `.editorconfig` are rejected. The app searches only declared config ancestors. A directory being under `root = true` does not imply that its own missing config was checked. Explicit absent declarations are required for missing intermediate configs.

A before/after lookup stops at its own first `root = true`. Changing or removing root can expose an unknown parent. That makes the relevant resolution unknown and the overall report incomplete. Duplicate/conflicting imported config paths are rejected.

## Conservative syntax

Accepted:

- Lowercase property keys and `root = true` / `root = false` in the preamble
- `key = value` pairs; values are single ASCII scalar tokens from letters, digits, `_ + . -`
- Whole-line `#` / `;` comments beginning in column one; comment text may be Unicode
- LF or CRLF line endings, ordinary ASCII space/tab indentation for pairs and sections
- Wildcards `*`, `**`, `?`
- Positive ASCII letter/digit character classes; ranges must be ascending and wholly lowercase, uppercase, or digits
- Nonempty comma-separated brace lists of simple tokens, or ascending canonical integer ranges without padding
- Lowercase duplicate keys within a section; the last assignment wins

Rejected rather than approximated:

- Mixed-case keys, including `Root`, and case-variant duplicates
- Escapes, extglobs, leading whole-pattern negation, negative/complex classes, nested braces
- Empty sections/classes/list entries, alphabetic/stepped/descending/zero-padded/plus-signed ranges
- Whitespace, `#`, or `;` inside globs
- Inline comments, colon assignment, empty values, noncanonical JSON numeric spelling such as `1e3`
- Byte-order marks, non-ASCII whitespace outside column-one comments, unsupported controls, lone CR endings
- Reserved properties `__proto__`, `constructor`, `prototype`; preamble properties other than root; section-scoped root

These restrictions preserve ordinary exception-edit examples while refusing known official-core disagreements. They are a product boundary, not a claim that the rejected inputs are invalid in all EditorConfig implementations. JS core results are authoritative for this app; finite oracle tests do not prove all admitted inputs agree across all implementations.

## Work bounds

- 32 config files, 512 unique finite paths
- 1 MiB total UTF-8 config text, before and after
- 8192 lines and 512 sections per config; 2048 total sections
- 256 characters per glob; range width 100; at most 6 globstars
- At most 256 expansion alternatives, including the JS core's implicit globstar expansions
- 32 distinct property names including derived `indent_size` and `tab_width`
- 1024 assertions, 4096 explicit absent entries, 4096 total before/after matched-section trace entries and 4096 unknown-ancestry entries
- Paths up to 1024 characters, keys 128, values 1024; raw manifest up to 2.5 MB
- An 8-second disposable Worker deadline; exceeding a bound blocks the review, without truncating data into a pass

## Assertion semantics

`stay` compares the full before/after state of a property, including explicit unset and absence. `change` requires an actual difference and, if `value` is supplied, that final state. `value` checks only the final state. `"<absent>"` denotes no property, while `"unset"` denotes the unset directive. An unknown ancestor cannot satisfy an assertion. A review without assertions says “No assertions supplied.”

## Privacy and interruptions

The app's CSP disables network connections; only its static same-origin assets are loaded. No autosave, service worker, storage, telemetry, upload, or repository write exists. New edits invalidate result/download state. Imports are bounded and validated in a worker before installing sanitized state; superseded imports cannot overwrite newer intent. A failed import preserves the preceding scope and says so.
