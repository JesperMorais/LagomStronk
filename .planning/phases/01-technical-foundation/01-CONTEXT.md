# Phase 1: Technical Foundation - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish storage abstraction layer (localStorage + IndexedDB), migrate existing data, implement capacity monitoring, and create event bus for decoupled feature communication. This is infrastructure that enables future features without technical debt.

</domain>

<decisions>
## Implementation Decisions

### Migration behavior
- Silent migration on app load — user doesn't know it's happening
- On failure: show error with retry button (don't block app, don't fail silently)
- No manual migration controls or data tools in settings

### Storage warning UX
- 70% capacity: toast notification, auto-dismisses
- Show once per session (don't repeat during same session)
- Message suggests exporting old workouts to free space
- 90% capacity: second warning with more urgent treatment (red/modal)

### Claude's Discretion
- Backup retention strategy after migration (leaning toward keeping until quota pressure)
- Exact toast/notification styling and duration
- Event bus implementation pattern
- Storage abstraction API design
- Migration retry logic and timing

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches for infrastructure work.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-technical-foundation*
*Context gathered: 2026-02-05*
