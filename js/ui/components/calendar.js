/**
 * WorkoutCalendar component
 * Displays workout history in a hybrid month/week calendar view
 * with intensity gradient markers based on workout volume
 */

export class WorkoutCalendar {
    constructor(container, workouts) {
        this.container = container;
        this.workouts = workouts || [];
        this.currentDate = new Date();
        this.selectedDate = null;
        this.intensityCache = new Map(); // Cache for month intensity calculations

        this.render();
        this.attachEvents();
    }

    /**
     * Main render method - creates calendar HTML structure
     */
    render() {
        this.container.innerHTML = `
            <div class="calendar-container">
                <div class="calendar-header">
                    <button class="calendar-nav-btn" data-nav="prev">‹</button>
                    <div class="calendar-month-title">${this.getMonthTitle()}</div>
                    <button class="calendar-nav-btn" data-nav="next">›</button>
                </div>
                <div class="calendar-weekdays">
                    <div class="calendar-weekday">Sun</div>
                    <div class="calendar-weekday">Mon</div>
                    <div class="calendar-weekday">Tue</div>
                    <div class="calendar-weekday">Wed</div>
                    <div class="calendar-weekday">Thu</div>
                    <div class="calendar-weekday">Fri</div>
                    <div class="calendar-weekday">Sat</div>
                </div>
                <div class="calendar-grid">
                    ${this.renderMonth()}
                </div>
            </div>
            <div class="calendar-popup" style="display: none;">
                <div class="calendar-popup-content">
                    <button class="calendar-popup-close">&times;</button>
                    <div class="calendar-popup-body"></div>
                </div>
            </div>
        `;
    }

    /**
     * Get formatted month title (e.g., "January 2026")
     */
    getMonthTitle() {
        const month = this.currentDate.toLocaleString('en-US', { month: 'long' });
        const year = this.currentDate.getFullYear();
        return `${month} ${year}`;
    }

    /**
     * Render the calendar month grid
     */
    renderMonth() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        // Get intensity data for this month
        const intensities = this.getMonthIntensities(year, month);

        // Today's date for highlighting
        const today = new Date();
        const todayStr = this.dateToString(today);

        let html = '';

        // Add empty cells for days before month starts
        for (let i = 0; i < startDayOfWeek; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = this.dateToString(date);
            const intensity = intensities[dateStr] || 0;
            const hasWorkout = intensity > 0;

            const isToday = dateStr === todayStr;
            const isSelected = dateStr === this.selectedDate;

            let classes = 'calendar-day';
            if (hasWorkout) classes += ' has-workout';
            if (isToday) classes += ' today';
            if (isSelected) classes += ' selected';

            html += `
                <div class="${classes}" data-date="${dateStr}" style="--intensity: ${intensity}">
                    <span class="day-number">${day}</span>
                    ${hasWorkout ? '<div class="day-marker"></div>' : ''}
                </div>
            `;
        }

        return html;
    }

    /**
     * Calculate workout intensities for a given month with caching
     * Returns object mapping dateStr -> intensity (0-1)
     */
    getMonthIntensities(year, month) {
        const cacheKey = `${year}-${month}`;

        // Return cached result if available
        if (this.intensityCache.has(cacheKey)) {
            return this.intensityCache.get(cacheKey);
        }

        const intensities = {};
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Find workouts in this month and calculate volumes
        const monthWorkouts = this.workouts.filter(w => {
            const workoutDate = new Date(w.date);
            return workoutDate >= firstDay && workoutDate <= lastDay;
        });

        if (monthWorkouts.length === 0) {
            this.intensityCache.set(cacheKey, intensities);
            return intensities;
        }

        // Calculate volume for each workout
        const volumes = {};
        let maxVolume = 0;

        for (const workout of monthWorkouts) {
            const volume = this.calculateWorkoutVolume(workout);
            volumes[workout.date] = volume;
            maxVolume = Math.max(maxVolume, volume);
        }

        // Normalize volumes to 0-1 range
        if (maxVolume > 0) {
            for (const dateStr in volumes) {
                intensities[dateStr] = volumes[dateStr] / maxVolume;
            }
        }

        // Cache the result
        this.intensityCache.set(cacheKey, intensities);

        return intensities;
    }

    /**
     * Calculate total volume for a workout
     */
    calculateWorkoutVolume(workout) {
        let totalVolume = 0;

        for (const exercise of workout.exercises) {
            for (const set of exercise.sets) {
                totalVolume += set.reps * set.weight;
            }
        }

        return totalVolume;
    }

    /**
     * Attach event listeners
     */
    attachEvents() {
        // Navigation buttons
        this.container.addEventListener('click', (e) => {
            const navBtn = e.target.closest('[data-nav]');
            if (navBtn) {
                const direction = navBtn.dataset.nav;
                if (direction === 'prev') {
                    this.prevMonth();
                } else if (direction === 'next') {
                    this.nextMonth();
                }
                return;
            }

            // Day selection
            const dayEl = e.target.closest('.calendar-day:not(.empty)');
            if (dayEl) {
                const dateStr = dayEl.dataset.date;
                this.selectDay(dateStr);
                return;
            }

            // Close popup
            const closeBtn = e.target.closest('.calendar-popup-close');
            if (closeBtn) {
                this.closePopup();
                return;
            }
        });

        // Close popup when clicking outside
        document.addEventListener('click', (e) => {
            const popup = this.container.querySelector('.calendar-popup');
            if (!popup) return;

            const isPopupClick = e.target.closest('.calendar-popup-content');
            const isDayClick = e.target.closest('.calendar-day');

            if (!isPopupClick && !isDayClick && popup.style.display !== 'none') {
                this.closePopup();
            }
        });
    }

    /**
     * Navigate to previous month
     */
    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.updateCalendar();
    }

    /**
     * Navigate to next month
     */
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.updateCalendar();
    }

    /**
     * Update calendar display after navigation
     */
    updateCalendar() {
        const monthTitle = this.container.querySelector('.calendar-month-title');
        const grid = this.container.querySelector('.calendar-grid');

        if (monthTitle) monthTitle.textContent = this.getMonthTitle();
        if (grid) grid.innerHTML = this.renderMonth();
    }

    /**
     * Select a day and show popup if it has a workout
     */
    selectDay(dateStr) {
        this.selectedDate = dateStr;

        // Update selected state
        this.container.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.toggle('selected', day.dataset.date === dateStr);
        });

        // Find workout for this date
        const workout = this.workouts.find(w => w.date === dateStr);

        if (workout) {
            this.showPopup(dateStr, workout);
        }
    }

    /**
     * Show popup with workout summary
     */
    showPopup(dateStr, workout) {
        const popup = this.container.querySelector('.calendar-popup');
        const popupBody = this.container.querySelector('.calendar-popup-body');

        if (!popup || !popupBody) return;

        // Calculate workout stats
        const exerciseCount = workout.exercises.length;
        const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
        const totalVolume = this.calculateWorkoutVolume(workout);

        // Format date
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        // Render popup content
        popupBody.innerHTML = `
            <div class="calendar-popup-date">${formattedDate}</div>
            <div class="calendar-popup-stats">
                <div class="popup-stat">
                    <span class="popup-stat-value">${exerciseCount}</span>
                    <span class="popup-stat-label">Exercise${exerciseCount !== 1 ? 's' : ''}</span>
                </div>
                <div class="popup-stat">
                    <span class="popup-stat-value">${totalSets}</span>
                    <span class="popup-stat-label">Set${totalSets !== 1 ? 's' : ''}</span>
                </div>
                <div class="popup-stat">
                    <span class="popup-stat-value">${Math.round(totalVolume)}</span>
                    <span class="popup-stat-label">Volume (kg)</span>
                </div>
            </div>
            <div class="calendar-popup-exercises">
                ${workout.exercises.map(ex => `
                    <span class="exercise-chip">${ex.name}</span>
                `).join('')}
            </div>
            <button class="btn btn-primary btn-view-details" data-date="${dateStr}">
                View Details
            </button>
        `;

        // Add click handler for view details button
        const viewDetailsBtn = popupBody.querySelector('.btn-view-details');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', () => {
                // Call global viewWorkout function
                if (window.viewWorkout) {
                    window.viewWorkout(dateStr);
                }
                this.closePopup();
            });
        }

        popup.style.display = 'block';
    }

    /**
     * Close the popup
     */
    closePopup() {
        const popup = this.container.querySelector('.calendar-popup');
        if (popup) {
            popup.style.display = 'none';
        }

        // Deselect day
        this.selectedDate = null;
        this.container.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
    }

    /**
     * Update workouts data and re-render
     */
    updateWorkouts(workouts) {
        this.workouts = workouts || [];
        // Clear intensity cache since data changed
        this.intensityCache.clear();
        this.updateCalendar();
    }

    /**
     * Convert Date object to YYYY-MM-DD string
     */
    dateToString(date) {
        return date.toISOString().split('T')[0];
    }
}

/**
 * Convenience function to create and render a calendar
 */
export function renderCalendar(container, workouts) {
    return new WorkoutCalendar(container, workouts);
}
