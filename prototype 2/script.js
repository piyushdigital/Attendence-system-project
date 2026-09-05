/*
 * Event Attendance Management System
 * Developed by Piyush Parshuram Sarnekar
 * GitHub: https://github.com/piyushdigital
 */

// ========== script.js ==========
// (All previous functionality is kept; new functions for the table are added.)

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

// ----- DOM references (existing) -----
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

// ----- NEW DOM references for table -----
const tableFilter = document.getElementById('tableFilter');
const tableContainer = document.getElementById('studentTableContainer');

// ----- State -----
let currentStudent = null;

// ----- Helper: format date/time (same as before) -----
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

// ----- Update statistics dashboard (unchanged) -----
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

// ----- Clear the student card (unchanged) -----
function clearStudentCard() {
    studentCard.classList.add('hidden');
    currentStudent = null;
    attendanceMessage.textContent = '';
    attendanceMessage.className = 'attendance-message';
}

// ----- Display a student (unchanged) -----
function displayStudent(student) {
    studentCard.classList.remove('hidden');
    studentName.textContent = student.name;
    studentRoll.textContent = student.rollNo;
    studentDept.textContent = student.department;
    studentYear.textContent = student.year;

    if (student.present) {
        statusBadge.textContent = 'Present';
        statusBadge.className = 'badge present';
        studentTime.textContent = formatDateTime(student.attendanceTime);
        markPresentBtn.disabled = true;
    } else {
        statusBadge.textContent = 'Absent';
        statusBadge.className = 'badge absent';
        studentTime.textContent = 'Not marked';
        markPresentBtn.disabled = false;
    }

    currentStudent = student;
    attendanceMessage.textContent = '';
    attendanceMessage.className = 'attendance-message';
}

// ----- Search (unchanged) -----
function searchStudent() {
    const input = rollInput.value.trim();
    searchFeedback.textContent = '';
    searchFeedback.className = 'search-feedback';

    if (input === '') {
        searchFeedback.textContent = 'Please enter a roll number.';
        searchFeedback.className = 'search-feedback error';
        clearStudentCard();
        return;
    }

    const found = students.find(s => s.rollNo.trim() === input);
    if (found) {
        searchFeedback.textContent = `Student found: ${found.name}`;
        searchFeedback.className = 'search-feedback success';
        displayStudent(found);
    } else {
        searchFeedback.textContent = 'Student not found.';
        searchFeedback.className = 'search-feedback error';
        clearStudentCard();
    }
}

// ----- Mark attendance (updated to re‑render the table) -----
function markAttendance() {
    if (!currentStudent) {
        attendanceMessage.textContent = 'Please search for a student first.';
        attendanceMessage.className = 'attendance-message warning';
        return;
    }

    if (currentStudent.present) {
        attendanceMessage.textContent = 'Attendance already marked.';
        attendanceMessage.className = 'attendance-message info';
        markPresentBtn.disabled = true;
        return;
    }

    // Mark present
    currentStudent.present = true;
    currentStudent.attendanceTime = new Date();

    displayStudent(currentStudent);   // updates the card
    attendanceMessage.textContent = 'Attendance marked successfully!';
    attendanceMessage.className = 'attendance-message success';

    updateStatistics();
    renderStudentTable();   // <-- NEW: refresh the table
}

// ===== NEW: Render the registered students table =====
function renderStudentTable() {
    const filterValue = tableFilter.value.trim().toLowerCase();

    // Filter students based on roll number or name (case‑insensitive)
    let filtered = students;
    if (filterValue !== '') {
        filtered = students.filter(s =>
            s.rollNo.toLowerCase().includes(filterValue) ||
            s.name.toLowerCase().includes(filterValue)
        );
    }

    // If no students match, show a message
    if (filtered.length === 0) {
        tableContainer.innerHTML = `<div class="no-students-msg">No students found.</div>`;
        return;
    }

    // Build the table
    let html = `<table class="student-table">
        <thead>
            <tr>
                <th>Roll No.</th>
                <th>Name</th>
                <th>Department</th>
                <th>Year</th>
                <th>Status</th>
                <th>Attendance Time</th>
            </tr>
        </thead>
        <tbody>`;

    filtered.forEach(s => {
        const statusClass = s.present ? 'present' : 'absent';
        const statusText = s.present ? 'Present' : 'Absent';
        const timeDisplay = s.present ? formatDateTime(s.attendanceTime) : '—';
        html += `<tr>
            <td>${s.rollNo}</td>
            <td>${s.name}</td>
            <td>${s.department}</td>
            <td>${s.year}</td>
            <td><span class="status-badge-table ${statusClass}">${statusText}</span></td>
            <td>${timeDisplay}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    tableContainer.innerHTML = html;
}

// ----- Event listeners (existing) -----
searchBtn.addEventListener('click', searchStudent);

rollInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchStudent();
    }
});

markPresentBtn.addEventListener('click', markAttendance);

// ----- NEW: filter event for the table -----
tableFilter.addEventListener('input', renderStudentTable);

// ----- Initialization -----
function init() {
    clearStudentCard();
    updateStatistics();
    renderStudentTable();   // <-- render the table on load
    rollInput.focus();
}

init();

// ----- Explanation (for developer) -----
/*
 * Phase 2 additions:
 * - New section "Registered Students" with a filter input and a table container.
 * - renderStudentTable() reads the current students array, applies the filter,
 *   and builds the table HTML. It is called on page load, after marking attendance,
 *   and whenever the filter input changes.
 * - The table displays all students (or filtered subset) with columns: Roll No.,
 *   Name, Department, Year, Status (with badge), and Attendance Time.
 * - The filter works on Roll Number and Name (case‑insensitive substring).
 * - All existing Phase 1 functionality (search, card, stats, duplicate prevention)
 *   remains unchanged and works alongside the new table.
 */


/*
 * Event Attendance Management System
 * Developed by Piyush Parshuram Sarnekar
 * GitHub: https://github.com/piyushdigital
 */