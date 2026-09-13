## ADDED Requirements

### Requirement: History-bound item is ineligible for Entity skip
When `item.useHistory` is true, Entity skip MUST return false. `shouldEntitySkip` and `resolveEntitySkip` MUST pass this into `resolveEntitySkipCandidate` so the Generation item session cannot skip before history apply. Fingerprint match, cached files on disk, and Reuse integrity MUST NOT override this. The system MUST NOT hash Diff report body or mtime for this decision.

#### Scenario: useHistory denies skip on warm cache
- **WHEN** `useHistory` is true, GenerationCache fingerprint matches, cached files exist, and (if reuse) manifest + integrity pass
- **THEN** `shouldEntitySkip` and `resolveEntitySkip` MUST return not-skipped

#### Scenario: useHistory false still allows skip
- **WHEN** `useHistory` is false or omitted, fingerprint matches, and files exist
- **THEN** Entity skip MAY apply under the existing hybrid rules

#### Scenario: Confirmed report is applied on the next generate
- **WHEN** a History-bound item has a warm cache entry and the Diff report file was edited since the last generate (same spec, same report path)
- **THEN** generate MUST run prepare and apply the report; it MUST NOT return `entitySkipped: true`
