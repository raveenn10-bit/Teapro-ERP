# Database Migration Guide

Imports may originate from Excel, CSV, compatible SQLite databases and structured legacy exports. Missing historical data must never be fabricated.

1. Make a read-only copy of the source.
2. Identify encoding, date/decimal formats, identifiers and opening balances.
3. Map columns and preview normalized values.
4. Resolve missing required fields, invalid dates, duplicate IDs and ambiguous money/weight values.
5. Dry-run in a demonstration database and reconcile counts/totals/balances.
6. Import production data in one transaction; a failure must roll back.
7. Store the import audit entry and error report.

Preserve source IDs. Historical bills retain original rates and calculation snapshots. Distinguish blank, zero and unknown values. Do not silently merge duplicate people or transactions. Opening balances require an effective date and balancing journal entry. Untrusted SQLite sources require schema validation and parameterized access.
