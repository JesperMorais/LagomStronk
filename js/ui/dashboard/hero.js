/**
 * Hero section component with streak display and workout suggestion
 */

/**
 * Calculate workout streak and weekly calendar data
 * @param {Array} workouts - Array of workout objects with date property
 * @returns {Object} { current, longest, weekDays }
 */
export function calculateStreak(workouts) {
    if (!workouts || workouts.length === 0) {
        return { current: 0, longest: 0, weekDays: getEmptyWeekDays() };
    }

    // Get unique workout dates and sort
    const dates = [...new Set(workouts.map(w => w.date))].sort();

    // Calculate current and longest streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    // Check if last workout was today or yesterday for current streak
    const lastWorkoutDate = dates[dates.length - 1];
    const isActive = lastWorkoutDate === today || lastWorkoutDate === yesterday;

    // Calculate longest streak
    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            tempStreak++;
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak if active
    if (isActive) {
        currentStreak = 1;
        for (let i = dates.length - 2; i >= 0; i--) {
            const prevDate = new Date(dates[i]);
            const currDate = new Date(dates[i + 1]);
            const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }

    // Get last 7 days calendar data
    const weekDays = getLast7Days(workouts);

    return { current: currentStreak, longest: longestStreak, weekDays };
}

/**
 * Get suggested workout based on history
 * @param {Object} data - Data object with workouts array
 * @returns {Object} { name, reason }
 */
export function getSuggestedWorkout(data) {
    if (!data || !data.workouts || data.workouts.length === 0) {
        return { name: 'Start Your First Workout', reason: 'Build your fitness foundation' };
    }

    // Get last 3 workouts
    const recentWorkouts = [...data.workouts]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);

    // Count muscle groups in recent workouts
    const muscleGroupCounts = {
        'Push': 0,
        'Pull': 0,
        'Legs': 0
    };

    const muscleGroupExercises = {
        'Push': ['Bench Press', 'Incline Bench Press', 'Dumbbell Bench Press', 'Overhead Press', 'Tricep Extensions', 'Tricep Pushdown', 'Skull Crushers', 'Lateral Raises'],
        'Pull': ['Barbell Row', 'Lat Pulldown', 'Seated Cable Row', 'Pull-ups', 'Chin-ups', 'Face Pulls', 'Bicep Curls', 'Hammer Curls'],
        'Legs': ['Squat', 'Front Squat', 'Deadlift', 'Romanian Deadlift', 'Leg Press', 'Leg Extension', 'Leg Curl', 'Lunges', 'Bulgarian Split Squat', 'Calf Raises']
    };

    recentWorkouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
            for (const [group, exercises] of Object.entries(muscleGroupExercises)) {
                if (exercises.includes(exercise.name)) {
                    muscleGroupCounts[group]++;
                    break;
                }
            }
        });
    });

    // Find least trained muscle group
    let minGroup = 'Push';
    let minCount = muscleGroupCounts['Push'];
    let daysAgo = 0;

    for (const [group, count] of Object.entries(muscleGroupCounts)) {
        if (count < minCount) {
            minCount = count;
            minGroup = group;
        }
    }

    // Calculate days since last workout of this type
    const today = new Date();
    for (const workout of data.workouts) {
        const hasGroupExercise = workout.exercises.some(ex =>
            muscleGroupExercises[minGroup].includes(ex.name)
        );
        if (hasGroupExercise) {
            const workoutDate = new Date(workout.date);
            daysAgo = Math.floor((today - workoutDate) / (1000 * 60 * 60 * 24));
            break;
        }
    }

    const reason = daysAgo === 0
        ? `Fresh muscle group rotation`
        : `Last ${minGroup.toLowerCase()} workout: ${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;

    return { name: `${minGroup} Day`, reason };
}

/**
 * Render hero section
 * @param {HTMLElement} container - Container element to render into
 * @param {Object} data - Data object with workouts array
 */
export function renderHero(container, data) {
    if (!container) return;

    const streak = calculateStreak(data.workouts);
    const suggestion = getSuggestedWorkout(data);

    // Empty state for new users
    if (data.workouts.length === 0) {
        container.innerHTML = `
            <div class="dashboard-hero">
                <div class="hero-empty">
                    <div class="hero-empty-icon">🏋️</div>
                    <div class="hero-empty-text">Start your first workout to build your streak!</div>
                    <div class="hero-empty-cta">Tap the button below to begin</div>
                </div>
            </div>
        `;
        return;
    }

    // Render hero with streak and suggestion
    container.innerHTML = `
        <div class="dashboard-hero">
            <div class="hero-content">
                <!-- Streak section -->
                <div class="hero-streak">
                    <div class="streak-flame">
                        <span class="flame-icon">🔥</span>
                        <span class="streak-number">${streak.current}</span>
                    </div>
                    <div class="streak-calendar">
                        ${streak.weekDays.map(day => `
                            <div class="calendar-day ${day.hasWorkout ? 'active' : ''} ${day.isToday ? 'today' : ''}">
                                <span class="day-letter">${day.letter}</span>
                                <span class="day-dot"></span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Suggested workout -->
                <div class="hero-suggestion" id="hero-suggestion">
                    <h3 class="suggestion-title">Suggested Next</h3>
                    <div class="suggestion-workout">${suggestion.name}</div>
                    <div class="suggestion-reason">${suggestion.reason}</div>
                </div>
            </div>
        </div>
    `;
}

// Helper functions

function getTodayStr() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function getYesterdayStr() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

function getLast7Days(workouts) {
    const days = [];
    const today = new Date();
    const workoutDates = new Set(workouts.map(w => w.date));
    const todayStr = getTodayStr();

    // Get last 7 days (including today)
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        days.push({
            letter: dayName[0], // First letter of day name
            hasWorkout: workoutDates.has(dateStr),
            isToday: dateStr === todayStr,
            date: dateStr
        });
    }

    return days;
}

function getEmptyWeekDays() {
    const days = [];
    const today = new Date();
    const todayStr = getTodayStr();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        days.push({
            letter: dayName[0],
            hasWorkout: false,
            isToday: dateStr === todayStr,
            date: dateStr
        });
    }

    return days;
}
