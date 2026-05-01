const calendarDates = document.querySelector('.calendar-dates');
const monthYear = document.getElementById('month-year');
const monthRange = document.getElementById('month-range');
const weekPill = document.getElementById('week-pill');
const monthShort = document.getElementById('month-short');
const todayNumber = document.getElementById('today-number');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const todayBtn = document.getElementById('today-btn');
const voiceStatus = document.getElementById('voice-status');
const voiceText = document.getElementById('voice-text');
const startVoiceBtn = document.getElementById('start-voice');
const stopVoiceBtn = document.getElementById('stop-voice');
const calendarEvents = {};

//Current Date and Time Retrieval(Non-const so Let is used)
const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

//Month is actually 0-11
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const monthAbbr = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

//Convert to YYYY-MM-DD format
function isoDate(year, month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

//Week number
function getWeekOfMonth(dateObj) {
  return Math.ceil(dateObj.getDate() / 7);
}

//Update the date header in the calender
function updateHeader(month, year) {
  //Main Title "January 2026"
  monthYear.textContent = `${months[month]} ${year}`;

  //Subtitle "Jan 1, 2026 - Jan 31, 2026"
  const startLabel = `${monthAbbr[month]} 1, ${year}`;
  //to get the last date of the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const endLabel = `${monthAbbr[month]} ${daysInMonth}, ${year}`;
  monthRange.textContent = `${startLabel} - ${endLabel}`;

  
  const isCurrentMonth = month === today.getMonth() && year === today.getFullYear();
  const weekNumber = isCurrentMonth ? getWeekOfMonth(today) : 1;
  weekPill.textContent = `Week ${weekNumber}`;

  monthShort.textContent = monthAbbr[today.getMonth()].toUpperCase();
  todayNumber.textContent = String(today.getDate());
}

function createEventNode(eventData) {
  const eventNode = document.createElement('div');
  const colorClass = eventData.color || 'slate';
  eventNode.className = `event ${colorClass}`;

  const timePart = eventData.time ? `<span>${eventData.time}</span>` : '';
  eventNode.innerHTML = `${eventData.title || ''} ${timePart}`.trim();
  return eventNode;
}

function createDayCell({ dayNumber, year, month, isOtherMonth }) {
  const cell = document.createElement('article');
  cell.className = `day${isOtherMonth ? ' other-month' : ''}`;
  cell.dataset.date = isoDate(year, month, dayNumber);

  const dateLabel = document.createElement('span');
  dateLabel.className = 'date-number';
  dateLabel.textContent = String(dayNumber);

  if (
    dayNumber === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
  ) {
    dateLabel.classList.add('current');
  }
  cell.appendChild(dateLabel);

  const dayEvents = calendarEvents[cell.dataset.date] || [];
  dayEvents.slice(0, 3).forEach((eventData) => {
    cell.appendChild(createEventNode(eventData));
  });

  if (dayEvents.length > 3) {
    const moreNode = document.createElement('div');
    moreNode.className = 'more-link';
    moreNode.textContent = `${dayEvents.length - 3} more...`;
    cell.appendChild(moreNode);
  }

  return cell;
}

function renderCalendar(month, year) {
  calendarDates.innerHTML = '';
  updateHeader(month, year);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const rowCount = totalCells / 7;
  calendarDates.style.setProperty('--calendar-rows', String(rowCount));

  for (let i = 0; i < totalCells; i++) {
    if (i < firstDay) {
      const dayNumber = prevMonthDays - firstDay + i + 1;
      const prevMonthDate = new Date(year, month - 1, dayNumber);
      calendarDates.appendChild(createDayCell({
        dayNumber,
        year: prevMonthDate.getFullYear(),
        month: prevMonthDate.getMonth(),
        isOtherMonth: true
      }));
      continue;
    }

    const currentCellDay = i - firstDay + 1;
    if (currentCellDay <= daysInMonth) {
      calendarDates.appendChild(createDayCell({
        dayNumber: currentCellDay,
        year,
        month,
        isOtherMonth: false
      }));
      continue;
    }

    const nextMonthDay = currentCellDay - daysInMonth;
    const nextMonthDate = new Date(year, month + 1, nextMonthDay);
    calendarDates.appendChild(createDayCell({
      dayNumber: nextMonthDay,
      year: nextMonthDate.getFullYear(),
      month: nextMonthDate.getMonth(),
      isOtherMonth: true
    }));
  }
}

renderCalendar(currentMonth, currentYear);

prevMonthBtn.addEventListener('click', () => {
  currentMonth -= 1;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear -= 1;
  }
  renderCalendar(currentMonth, currentYear);
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth += 1;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear += 1;
  }
  renderCalendar(currentMonth, currentYear);
});

todayBtn.addEventListener('click', () => {
  currentMonth = today.getMonth();
  currentYear = today.getFullYear();
  renderCalendar(currentMonth, currentYear);
});

calendarDates.addEventListener('click', (event) => {
  const targetDay = event.target.closest('.day');
  if (!targetDay) {
    return;
  }

  const selectedDate = targetDay.dataset.date;
  if (selectedDate) {
    alert(`You clicked on ${selectedDate}`);
  }
});

//Speech library object
const SpeechRecognition = window.SpeechRecognition;
let recognition = null;

//to change the status button
function setVoiceStatus(message, isListening = false) {
  if (!voiceStatus) {
    return;
  }

  voiceStatus.textContent = message;
  voiceStatus.classList.toggle('listening', isListening);
}

//speech logic
if (voiceText && startVoiceBtn && stopVoiceBtn) {

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    //when clicked record button
    recognition.onstart = () => {
      setVoiceStatus('Listening... speak now', true);
    };
    
    //On every interim end(word)
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      voiceText.value = `${transcript}`.trim();
      const lastResult = event.results[event.results.length - 1];

      // if (lastResult.isFinal) {
      //   await sendToBackend(transcript.trim());
      // }
    };

    //auto stop when gap happends
    recognition.onspeechend = () => {
      recognition.stop();
    };    

    recognition.onerror = () => {
      setVoiceStatus('Microphone error. Please allow microphone access.', false);
    };

    //when all done, status back to ready to listen
    recognition.onend = () => {
      if (voiceStatus.classList.contains('listening')) {
        setVoiceStatus('Ready to listen', false);
      }
    };

    //button logics, startVoiceBtn -> start
    startVoiceBtn.addEventListener('click', () => {
      recognition.start();
    });

    //stopVoiceBtn -> stop
    stopVoiceBtn.addEventListener('click', () => {
      recognition.stop();
      setVoiceStatus('Stopped', false);
    });
  } else {
    setVoiceStatus('Voice input not supported in this browser', false);
    startVoiceBtn.disabled = true;
    stopVoiceBtn.disabled = true;
  }

}

// function sendToBackend(context){



// }