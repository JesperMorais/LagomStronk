# Deferred Issues

Issues logged during development for future consideration.

## ISS-001: Hero Section Customization

**Phase:** 2 | **Task:** UAT Feedback
**Priority:** Enhancement
**Status:** Open

**Description:**
User wants customizable hero progress display options:
- Current: Streak + 7-day calendar + This Week volume + Recent PRs
- Option: Last 5 weeks volume comparison
- Other potential views: monthly progress, muscle group breakdown, etc.

**Rationale:**
Different users have different progress visualization preferences. Some prefer weekly tracking, others prefer longer-term trends.

**Implementation Notes:**
- Add settings option for hero display mode
- Store preference in localStorage
- Possible modes: "weekly" (current), "5-week-volume", "monthly"
- Consider making stats cards configurable too

---
