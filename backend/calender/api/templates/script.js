// ============================================================
//  CALENDAR SCRIPT — Beginner Friendly Version
//  Every line is explained so you know exactly what's happening!
// ============================================================


// ── STEP 1: FIND ELEMENTS ON THE PAGE ───────────────────────
//
// Think of "querySelector" like a treasure hunt.
// We tell JavaScript: "Go find the element with this class or id."
// We store each found element in a variable so we can use it later.

// The grid where all the day boxes will be drawn
var calendarDates = document.querySelector('.calendar-dates');

// The big title that shows "April 2025" etc.
var monthYearTitle = document.getElementById('month-year');

// A smaller subtitle like "Apr 1, 2025 – Apr 30, 2025"
var monthRangeText = document.getElementById('month-range');

// A little badge that shows "Week 3" etc.
var weekPill = document.getElementById('week-pill');

// The short month text inside the Today button (e.g. "APR")
var monthShortText = document.getElementById('month-short');

// The day number inside the Today button (e.g. "21")
var todayNumberText = document.getElementById('today-number');

// The ← (previous month) button
var prevMonthBtn = document.getElementById('prev-month');

// The → (next month) button
var nextMonthBtn = document.getElementById('next-month');

// The "Today" button that jumps back to the current date
var todayBtn = document.getElementById('today-btn');


// ── STEP 2: REMEMBER TODAY'S DATE ───────────────────────────
//
// "new Date()" creates an object that knows today's full date and time.
// We store it in "today" so we can always compare other dates against it.

var today = new Date();

// These two variables track WHICH month and year is currently shown.
// They change when the user clicks ← or →.
// getMonth() returns 0 for January, 1 for February … 11 for December.
var currentMonth = today.getMonth();
var currentYear  = today.getFullYear();


// ── STEP 3: HELPFUL LOOKUP LISTS ────────────────────────────
//
// Arrays are ordered lists. Index 0 = first item, index 1 = second, etc.
// So months[0] gives us "January", months[3] gives us "April", and so on.

var months = [
  'January', 'February', 'March',     'April',
  'May',     'June',     'July',      'August',
  'September','October', 'November',  'December'
];

// Same idea but short 3-letter versions for tighter spaces
var monthAbbr = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec'
];


// ── STEP 4: EVENTS DATA ─────────────────────────────────────
//
// "window.calendarEvents" is a place where a server or another script
// can drop in event data before this script runs.
// If nothing was placed there, we use an empty object {} as a fallback.
//
// The object looks like this:
//   {
//     "2025-04-21": [
//       { title: "Team Meeting", time: "10:00 AM", color: "blue" },
//       { title: "Dentist",      time: "2:00 PM",  color: "red"  }
//     ]
//   }
// Keys are dates in "YYYY-MM-DD" format. Values are arrays of events.

var calendarEvents = window.calendarEvents || {};


// ── HELPER FUNCTION: Build an ISO date string ────────────────
//
// A function is a reusable block of code. We "call" it by name whenever needed.
// This one takes a year, month, and day and returns a string like "2025-04-07".
// ISO format is useful because it's sortable and universally understood.
//
// "padStart(2, '0')" adds a leading zero when needed: 7 → "07"

function buildDateString(year, month, day) {
  var mm = String(month + 1).padStart(2, '0'); // month is 0-based, add 1 first
  var dd = String(day).padStart(2, '0');
  return year + '-' + mm + '-' + dd;           // e.g. "2025-04-07"
}


// ── HELPER FUNCTION: Which week of the month is a date in? ──
//
// Dividing the day number by 7 and rounding up gives the week number.
// Day 1–7 → week 1, Day 8–14 → week 2, etc.

function getWeekOfMonth(dateObject) {
  return Math.ceil(dateObject.getDate() / 7);
}


// ── FUNCTION: Update the page header ────────────────────────
//
// This runs every time the calendar is drawn to keep titles in sync.

function updateHeader(month, year) {
  // Show the full month name and year, e.g. "April 2025"
  monthYearTitle.textContent = months[month] + ' ' + year;

  // Calculate the last day of the displayed month.
  // Trick: Day 0 of "next month" = last day of "current month".
  var lastDay = new Date(year, month + 1, 0).getDate();

  // Build a range string like "Apr 1, 2025 – Apr 30, 2025"
  monthRangeText.textContent =
    monthAbbr[month] + ' 1, ' + year +
    ' – ' +
    monthAbbr[month] + ' ' + lastDay + ', ' + year;

  // Show the correct week number on the pill badge.
  // Only meaningful for the current real month; otherwise default to Week 1.
  var isCurrentRealMonth = (month === today.getMonth() && year === today.getFullYear());
  var weekNumber = isCurrentRealMonth ? getWeekOfMonth(today) : 1;
  weekPill.textContent = 'Week ' + weekNumber;

  // Update the "Today" button's mini display with today's actual info
  // (this never changes — it always shows the real today)
  monthShortText.textContent = monthAbbr[today.getMonth()].toUpperCase();
  todayNumberText.textContent = String(today.getDate());
}


// ── FUNCTION: Create one event badge ────────────────────────
//
// For each event on a day we build a small coloured <div>.
// The color comes from the event's "color" property (default: "slate").

function createEventBadge(eventData) {
  var badge = document.createElement('div'); // create a new empty <div>

  // The CSS class controls the colour; fall back to "slate" if none given
  var colorClass = eventData.color || 'slate';
  badge.className = 'event ' + colorClass;

  // Show the time in a <span> if it exists, otherwise nothing
  var timePart = eventData.time ? '<span>' + eventData.time + '</span>' : '';

  // Set the badge's visible text (title + optional time)
  badge.innerHTML = (eventData.title || '') + ' ' + timePart;

  return badge; // hand the finished badge back to the caller
}


// ── FUNCTION: Create one day cell (<article>) ────────────────
//
// Each square on the calendar is an <article> element.
// We receive an object with the day's details and build the element.

function createDayCell(dayNumber, year, month, isOtherMonth) {

  // Create the outer box for this day
  var cell = document.createElement('article');

  // If this day belongs to the previous or next month, mark it visually
  cell.className = isOtherMonth ? 'day other-month' : 'day';

  // Store the ISO date on the element so click handlers can read it
  cell.dataset.date = buildDateString(year, month, dayNumber);

  // ── The date number in the corner ──
  var dateLabel = document.createElement('span');
  dateLabel.className = 'date-number';
  dateLabel.textContent = String(dayNumber);

  // Highlight today's number with a special CSS class
  var isToday = (
    dayNumber  === today.getDate()  &&
    month      === today.getMonth() &&
    year       === today.getFullYear()
  );
  if (isToday) {
    dateLabel.classList.add('current');
  }

  cell.appendChild(dateLabel); // put the number inside the cell

  // ── Add events for this day ──
  // Look up this date in the events object.
  // If there's nothing there, use an empty array [] so the code below still works.
  var dayEvents = calendarEvents[cell.dataset.date] || [];

  // Show at most 3 events to keep things tidy
  for (var i = 0; i < dayEvents.length && i < 3; i++) {
    cell.appendChild(createEventBadge(dayEvents[i]));
  }

  // If there are more than 3 events, show a "2 more…" link
  if (dayEvents.length > 3) {
    var moreLink = document.createElement('div');
    moreLink.className = 'more-link';
    moreLink.textContent = (dayEvents.length - 3) + ' more...';
    cell.appendChild(moreLink);
  }

  return cell; // hand the finished cell back to the caller
}


// ── MAIN FUNCTION: Draw the whole calendar ───────────────────
//
// This is called once on page load, and again every time the month changes.

function renderCalendar(month, year) {

  // Clear whatever was there before (wipe the grid clean)
  calendarDates.innerHTML = '';

  // Update the title/header section at the top
  updateHeader(month, year);

  // ── Figure out the grid layout ──

  // getDay() on the 1st tells us which column to start on (0 = Sunday)
  var firstDayOfWeek = new Date(year, month, 1).getDay();

  // How many days does this month actually have?
  var daysInMonth = new Date(year, month + 1, 0).getDate();

  // How many days did last month have? (needed for the "tail" cells)
  var prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Total grid squares must be a multiple of 7 (full rows)
  // Example: if month starts on Wednesday (3) and has 30 days → 3+30=33 → ceil(33/7)*7 = 35 cells
  var totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

  // Tell CSS how many rows to draw (each row = 7 cells)
  var rowCount = totalCells / 7;
  calendarDates.style.setProperty('--calendar-rows', String(rowCount));

  // ── Fill every cell one by one ──
  for (var i = 0; i < totalCells; i++) {

    // CASE A: Cells before the 1st — show days from last month
    if (i < firstDayOfWeek) {
      var prevDay   = prevMonthTotalDays - firstDayOfWeek + i + 1;
      var prevDate  = new Date(year, month - 1, prevDay);
      calendarDates.appendChild(
        createDayCell(prevDay, prevDate.getFullYear(), prevDate.getMonth(), true)
      );
      continue; // skip to next loop iteration
    }

    // CASE B: Cells within the current month
    var currentDay = i - firstDayOfWeek + 1;
    if (currentDay <= daysInMonth) {
      calendarDates.appendChild(
        createDayCell(currentDay, year, month, false)
      );
      continue;
    }

    // CASE C: Cells after the last day — show days from next month
    var nextDay  = currentDay - daysInMonth;
    var nextDate = new Date(year, month + 1, nextDay);
    calendarDates.appendChild(
      createDayCell(nextDay, nextDate.getFullYear(), nextDate.getMonth(), true)
    );
  }
}


// ── DRAW THE CALENDAR FOR THE FIRST TIME ────────────────────
//
// Everything above just *defined* functions — nothing was drawn yet.
// This single call kicks everything off using today's month and year.

renderCalendar(currentMonth, currentYear);


// ── BUTTON: Go to the previous month ────────────────────────

prevMonthBtn.addEventListener('click', function () {
  currentMonth = currentMonth - 1;

  // If we go below January (0), wrap back to December (11) of last year
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear  = currentYear - 1;
  }

  renderCalendar(currentMonth, currentYear);
});


// ── BUTTON: Go to the next month ────────────────────────────

nextMonthBtn.addEventListener('click', function () {
  currentMonth = currentMonth + 1;

  // If we go above December (11), wrap forward to January (0) of next year
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear  = currentYear + 1;
  }

  renderCalendar(currentMonth, currentYear);
});


// ── BUTTON: Jump back to today ───────────────────────────────

todayBtn.addEventListener('click', function () {
  // Reset both trackers to the real current date
  currentMonth = today.getMonth();
  currentYear  = today.getFullYear();

  renderCalendar(currentMonth, currentYear);
});


// ── CLICKING ON A DAY ───────────────────────────────────────
//
// Instead of adding a click listener to EVERY single day cell
// (which wastes memory), we add ONE listener to the whole grid.
//
// When a click happens anywhere inside the grid, we walk UP the
// DOM tree from the clicked element using .closest('.day').
// If we land on a day cell, we read its stored date string.
//
// This pattern is called "event delegation" — very common in real projects!

calendarDates.addEventListener('click', function (event) {

  // Find the nearest ancestor (or self) that has the class "day"
  var clickedDay = event.target.closest('.day');

  // If the click wasn't on a day cell (e.g. clicked an empty gap), do nothing
  if (!clickedDay) {
    return;
  }

  // Read the ISO date we stored in data-date when we built the cell
  var selectedDate = clickedDay.dataset.date;

  if (selectedDate) {
    alert('You clicked on ' + selectedDate);
    // In a real app you'd open a modal or highlight the day instead of alert()
  }
});