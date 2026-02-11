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

## ISS-002: Customizable Body Tracking Visualizations

**Phase:** 4 | **Task:** UAT Feedback
**Priority:** Enhancement
**Status:** Open

**Description:**
User wants better, more customizable visualizations for body tracking charts. Current charts use a standard mint gradient line chart pattern.

**Rationale:**
Different users may want different chart styles, time ranges, comparison views, or data overlays for their body tracking data.

**Implementation Notes:**
- Chart time range selector (1 month, 3 months, 6 months, all time)
- Goal lines / target weight overlay
- Comparison overlays (e.g., weight vs body fat on same chart)
- Different chart types (line vs bar vs area)
- Custom color themes per metric
- Consider alongside ISS-001 (hero customization)

---
