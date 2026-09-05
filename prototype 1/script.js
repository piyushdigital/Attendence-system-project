/*
 * Event Attendance Management System
 * Developed by Piyush Parshuram Sarnekar
 * GitHub: https://github.com/piyushdigital
 */

// ============================================================
// script.js – Event Attendance System (Phase 1)
// ============================================================

// ----- Sample student data -----
const students = [
    {
        rollNo: "101",
        name: "Rahul Patil",
        department: "EXTC",
        year: "Final Year",
        present: false,
        attendanceTime: null
    },
    {
        rollNo: "102",
        name: "Aman Shah",
        department: "Mechanical",
        year: "Final Year",
        present: false,
        attendanceTime: null
    },
    {
        rollNo: "103",
        name: "Priya Joshi",
        department: "Computer",
        year: "Final Year",
        present: false,
        attendanceTime: null
    }
];

// ----- DOM references -----
const rollInput = document.getElementById('rollInput');
const searchBtn = document.getElementById('searchBtn');
const searchFeedback = document.getElementById('searchFeedback');
const studentCard = document.getElementById('studentCard');
const statusBadge = document.getElementById('statusBadge');
const studentName = document.getElementById('studentName');
const studentRoll = document.getElementById('studentRoll');
const studentDept = document.getElementById('studentDept');
const studentYear = document.getElementById('studentYear');
const studentTime = document.getElementById('studentTime');
const markPresentBtn = document.getElementById('markPresentBtn');
const attendanceMessage = document.getElementById('attendanceMessage');

const totalCount = document.getElementById('totalCount');
const presentCount = document.getElementById('presentCount');
const absentCount = document.getElementById('absentCount');
const percentCount = document.getElementById('percentCount');

// ----- State -----
let currentStudent = null;          // The student currently shown in the card

// ----- Helper: format date/time -----
function formatDateTime(date) {
    if (!date) return 'Not marked';
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// ----- Update statistics dashboard -----
function updateStatistics() {
    const total = students.length;
    const present = students.filter(s => s.present).length;
    const absent = total - present;
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

    totalCount.textContent = total;
    presentCount.textContent = present;
    absentCount.textContent = absent;
    percentCount.textContent = percentage + '%';
}

// ----- Clear the student card (hide it) -----
function clearStudentCard() {
    studentCard.classList.add('hidden');
    currentStudent = null;
    // Also reset the attendance message
    attendanceMessage.textContent = '';
    attendanceMessage.className = 'attendance-message';
}

// ----- Display a student in the card -----
function displayStudent(student) {
    // Show the card
    studentCard.classList.remove('hidden');

    // Fill in the details
    studentName.textContent = student.name;
    studentRoll.textContent = student.rollNo;
    studentDept.textContent = student.department;
    studentYear.textContent = student.year;

    // Set status badge and time
    if (student.present) {
        statusBadge.textContent = 'Present';
        statusBadge.className = 'badge present';
        studentTime.textContent = formatDateTime(student.attendanceTime);
        // Disable mark button
        markPresentBtn.disabled = true;
    } else {
        statusBadge.textContent = 'Absent';
        statusBadge.className = 'badge absent';
        studentTime.textContent = 'Not marked';
        // Enable mark button
        markPresentBtn.disabled = false;
    }

    // Store reference to current student
    currentStudent = student;

    // Clear any previous attendance message
    attendanceMessage.textContent = '';
    attendanceMessage.className = 'attendance-message';
}

// ----- Search for a student by roll number -----
function searchStudent() {
    const input = rollInput.value.trim();

    // Clear any previous feedback
    searchFeedback.textContent = '';
    searchFeedback.className = 'search-feedback';

    // 1. Empty input
    if (input === '') {
        searchFeedback.textContent = 'Please enter a roll number.';
        searchFeedback.className = 'search-feedback error';
        clearStudentCard();
        return;
    }

    // 2. Find the student (case-insensitive, trim spaces)
    const found = students.find(s => s.rollNo.trim() === input);

    if (found) {
        // Success: display the student
        searchFeedback.textContent = `Student found: ${found.name}`;
        searchFeedback.className = 'search-feedback success';
        displayStudent(found);
    } else {
        // Not found
        searchFeedback.textContent = 'Student not found.';
        searchFeedback.className = 'search-feedback error';
        clearStudentCard();
    }
}

// ----- Mark attendance for the current student -----
function markAttendance() {
    // If no student is displayed, do nothing
    if (!currentStudent) {
        attendanceMessage.textContent = 'Please search for a student first.';
        attendanceMessage.className = 'attendance-message warning';
        return;
    }

    // If already present, show message and do nothing
    if (currentStudent.present) {
        attendanceMessage.textContent = 'Attendance already marked.';
        attendanceMessage.className = 'attendance-message info';
        // Ensure button is disabled (just in case)
        markPresentBtn.disabled = true;
        return;
    }

    // Mark as present
    currentStudent.present = true;
    currentStudent.attendanceTime = new Date();   // current date and time

    // Update the displayed card
    displayStudent(currentStudent);   // this will set badge, time, disable button

    // Show success message
    attendanceMessage.textContent = 'Attendance marked successfully!';
    attendanceMessage.className = 'attendance-message success';

    // Update statistics
    updateStatistics();
}

// ----- Event listeners -----

// Search button click
searchBtn.addEventListener('click', searchStudent);

// Enter key on input field
rollInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();   // prevent form submission if any
        searchStudent();
    }
});

// Mark Present button click
markPresentBtn.addEventListener('click', markAttendance);

// ----- Initialization on page load -----
function init() {
    // Clear any leftover card state
    clearStudentCard();
    // Update statistics with initial data
    updateStatistics();
    // Focus on the input field for convenience
    rollInput.focus();
}

// Run initialization
init();

// ----- Explanation (for developer) -----
/*
 * How script.js works:
 * 
 * 1. The sample student data is stored in the 'students' array.
 * 2. On page load, the init() function clears the card and updates statistics.
 *    - updateStatistics() calculates totals from the array and updates the four stats.
 * 3. When the user searches (click or Enter):
 *    - searchStudent() reads and trims the input.
 *    - If empty, shows an error and hides the card.
 *    - If a match is found, displayStudent() fills the card with the student's data.
 *    - If not found, shows an error and hides the card.
 * 4. displayStudent(student):
 *    - Shows the card, fills name/roll/dept/year.
 *    - Sets the badge (Present/absent) and attendance time.
 *    - Enables or disables the "Mark Present" button based on present status.
 *    - Stores the student in 'currentStudent'.
 * 5. When "Mark Present" is clicked:
 *    - markAttendance() checks if currentStudent exists and is absent.
 *    - If absent, sets present=true and attendanceTime=new Date().
 *    - Calls displayStudent() to refresh the card and disables the button.
 *    - Shows a success message and updates statistics.
 *    - If already present, shows "Attendance already marked." and does nothing else.
 * 6. All UI updates are reflected immediately; no persistence is used (Phase 1).
 */

// End of script.js

/*
 * Event Attendance Management System
 * Developed by Piyush Parshuram Sarnekar
 * GitHub: https://github.com/piyushdigital
 */