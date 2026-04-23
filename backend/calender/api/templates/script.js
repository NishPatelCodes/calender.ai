var dates = document.querySelector(".calendar-dates");

var today = new Date();
var day = today.getDate();
var month = today.getMonth();
var year = today.getFullYear();

const firstDate = new Date(year, month, 1);

const daysInMonth = new Date(year, month + 1, 0).getDate();

let date = 1;
const firstDay = firstDate.getDay();

for (let i = 0; i < 42; i++) { // better than 35
    var DateBox = document.createElement("div");
    DateBox.classList.add("date-box");

    if (i >= firstDay && date <= daysInMonth) {
        DateBox.textContent = date;

        // highlight today
        if (date === day) {
            DateBox.classList.add("today");
        }

        date++;
    }

    dates.append(DateBox);
}