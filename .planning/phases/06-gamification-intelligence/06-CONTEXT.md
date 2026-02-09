# Phase 6: Gamification & Intelligence - Context

**Gathered:** 2026-02-09
**Status:** Ready for research

<vision>
## How This Should Work

LagomStronk becomes a knowledgeable training companion — not a gamified achievement grinder, but an app that subtly guides you and surfaces useful patterns in your training.

**During workouts:** The app provides contextual nudges. "You hit 80kg last time, try 82.5 today." "You haven't trained legs in 8 days." These feel like a training buddy who remembers everything, not a robot barking orders.

**Between sessions (dashboard):** When you open the app, you see insights waiting — weekly training summaries, muscle balance alerts, trend highlights. It answers the question "how's my training going?" at a glance.

**Onboarding:** A setup flow captures your goals, experience level, preferences, and equipment. This makes all the recommendations personal — the app knows who it's coaching.

**Light gamification:** Streaks, badges, and milestones exist as gentle motivation (think Duolingo's streak, not an Xbox achievement grind). Just enough to build habits without making it feel like a game. The gamification serves the coaching, not the other way around.

The overall feel is: smart and helpful. The app makes you feel like you're training intelligently without needing to be a programming nerd about your workouts.

</vision>

<essential>
## What Must Be Nailed

- **Progressive overload hints** — The core coaching feature. During workouts, suggest when to increase weight/reps based on recent performance. This is what makes the app feel intelligent.
- **Training balance insights** — Muscle group heatmaps, imbalance alerts, recovery status. Users should see the big picture of their training and catch blindspots (e.g., "you haven't trained back in 2 weeks").
- **Onboarding + personalization** — A setup flow that captures goals, experience level, and preferences so recommendations actually make sense for the individual. Without this, the intelligence is generic and useless.

</essential>

<boundaries>
## What's Out of Scope

- Social features — No leaderboards, friend challenges, or sharing. This is a personal tool.
- AI/LLM integration — Keep all intelligence rule-based for now (e.g., "you did X, try Y"). AI/LLM-powered coaching is a future evolution, not this phase.
- Nutrition guidance — No meal plans, calorie targets, or macro suggestions. Stay in the strength training lane.
- Health platform sync — Deferred (Phase 5 requires Capacitor/native wrapper for Health Connect and HealthKit access).

</boundaries>

<specifics>
## Specific Ideas

- No specific app references — open to whatever approach works, as long as it feels smart and helpful rather than noisy or gamey.
- Intelligence should be rule-based and deterministic — users should be able to understand why the app is suggesting something.
- Gamification elements (streaks, badges) should serve habit-building, not become the focus.

</specifics>

<notes>
## Additional Context

Phase 5 (Health Integration) has been deferred because Health Connect and HealthKit require native API access via Capacitor, which is not yet part of the project. This means Phase 6 becomes the next phase to execute.

The user values the "smart coach" and "data insights" aspects much more than pure gamification. The achievement system is a light layer on top, not the core value proposition.

The user noted that AI/LLM integration is needed in the future — this phase lays the rule-based foundation that AI could enhance later.

</notes>

---

*Phase: 06-gamification-intelligence*
*Context gathered: 2026-02-09*
