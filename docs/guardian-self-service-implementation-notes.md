# Guardian Self-Service Implementation Notes

## Playwright Evidence

- T057: `e2e/guardian-self-service.spec.js` checks guardian routes at 390px, 768px, and 1440px for horizontal overflow, keyboard-reachable controls, main landmarks, headings, unlabeled controls, and readable text contrast.
- T065: Playwright timed linked-student detail, academic summary, and contact workflows; budgets are encoded as 120s, 180s, and 120s assertions.
- T066: Playwright state-distinction proxy covers linked-student list, no-linked-students, student detail, academic summary, contact view, no-academic-period, unavailable-summary, and not-found states. This is automated proxy evidence, not moderated human UAT.
- T067: Playwright render/transition timing assertions require list render under 1.5s and selected-student views under 2s after mocked service resolution.

## Validation

- `npm run test:unit -- tests/guardian-self-service`: passed.
- `npm run test:unit`: passed.
- `npm run build`: passed with existing Rolldown pure-annotation and large-chunk warnings.
- `env CI=1 npm run test:e2e -- e2e/guardian-self-service.spec.js --project=chromium`: passed, 3 tests.
