# Triage

## Fix order

critical → serious → moderate → minor. One violation class at a time, minimal diff, re-scan before moving on.

## incomplete is never a pass

`incomplete` means axe could not be certain and a person must look. Every `incomplete` result stays open with:

- owner (who reviews it),
- the manual step (what to check),
- its disposition (pass/fail after review). Common shapes:
  - background "overlapped by another element" → sample the rendered colors with a colour picker;
  - "content contains only non-text characters" (glyphs, separators) → pass if decorative;
  - sourceless stub media (`video`/`audio` with no src) → pass with a note, or remove the stub;
  - ID reference unresolvable across a shadow boundary → pierce `shadowRoot`, verify the referenced ID exists and the interaction works, then pass.

Never auto-close `incomplete`. Never roll it into "0 violations" claims.

## Zero-false-positive discipline

No violation class is "fixed" without a same-scope re-scan showing it gone. Before/after violation counts are the evidence.

## ARIA changes

`aria-*` changes must cite axe's `helpUrl`/rule docs for that rule. Never invent ARIA from memory.

## Report shape

- Files touched
- Rule IDs + impact (e.g. `button-name`, serious)
- Before/after violation counts on the scoped surface, with node counts + selectors/targets
- Remaining manual items (`incomplete` dispositions)
- If a gate/redirect answers (login wall, signup), record the final URL + gate identity as scope evidence
- Audit-only runs: per-viewport tables (the stricter viewport governs — a mobile-only flag is still a finding); third-party/ad findings carved out separately; fixture-page caveats stated (test stubs flag by design — prefer verifying fixes against a scratch copy, and say when a fix is intentionally unmergable upstream)
