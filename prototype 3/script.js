// ========== script.js ==========
// Phase 3: Added localStorage persistence and reset functionality.

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

// ----- NEW DOM references for table & reset -----
const tableFilter = document.getElementById('tableFilter');
const tableContainer = document.getElementById('studentTableContainer');
const resetBtn = document.getElementById('resetBtn');

// ----- State -----
let currentStudent = null;

// ----- Helper: format date/time (unchanged) -----
function formatDateTime(date) {
    if (!date) return 'Not marked';
    // If date is a string (from localStorage), convert to Date
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// ===== NEW: localStorage functions =====

// Save attendance data to localStorage
function saveAttendance() {
    // Build an object with roll numbers as keys
    const attendanceData = {};
    students.forEach(s => {
        attendanceData[s.rollNo] = {
            present: s.present,
            // Store attendanceTime as ISO string if present, otherwise null
            attendanceTime: s.attendanceTime ? s.attendanceTime.toISOString() : null
        };
    });
    localStorage.setItem('eventAttendance', JSON.stringify(attendanceData));
}

// Load attendance data from localStorage and apply to students
function loadAttendance() {
    const stored = localStorage.getItem('eventAttendance');
    if (!stored) {
        // No saved data: ensure all are absent (already default)
        return;
    }
    try {
        const data = JSON.parse(stored);
        students.forEach(s => {
            const record = data[s.rollNo];
            if (record) {
                s.present = record.present;
                // Convert stored ISO string back to Date object, or null
                s.attendanceTime = record.attendanceTime ? new Date(record.attendanceTime) : null;
            }
        });
    } catch (e) {
        console.warn('Failed to load attendance data:', e);
    }
}

// Reset all attendance
function resetAttendance() {
    if (!confirm('Are you sure you want to reset all attendance records?')) {
        return; // user cancelled
    }
    // Remove from localStorage
    localStorage.removeItem('eventAttendance');
    // Reset all students
    students.forEach(s => {
        s.present = false;
        s.attendanceTime = null;
    });
    // Clear the currently displayed student card
    clearStudentCard();
    // Update UI
    updateStatistics();
    renderStudentTable();
    // Also clear any search feedback if needed
    searchFeedback.textContent = '';
    searchFeedback.className = 'search-feedback';
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

// ----- Mark attendance (updated to save to localStorage) -----
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
    currentStudent.attendanceTime = new Date(); // now

    displayStudent(currentStudent);   // updates the card
    attendanceMessage.textContent = 'Attendance marked successfully!';
    attendanceMessage.className = 'attendance-message success';

    // Save to localStorage
    saveAttendance();

    updateStatistics();
    renderStudentTable();   // refresh the table
}

// ===== Render the registered students table (unchanged) =====
function renderStudentTable() {
    const filterValue = tableFilter.value.trim().toLowerCase();

    let filtered = students;
    if (filterValue !== '') {
        filtered = students.filter(s =>
            s.rollNo.toLowerCase().includes(filterValue) ||
            s.name.toLowerCase().includes(filterValue)
        );
    }

    if (filtered.length === 0) {
        tableContainer.innerHTML = `<div class="no-students-msg">No students found.</div>`;
        return;
    }

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

// ----- Event listeners (existing + new) -----
searchBtn.addEventListener('click', searchStudent);

rollInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchStudent();
    }
});

markPresentBtn.addEventListener('click', markAttendance);

// Table filter event
tableFilter.addEventListener('input', renderStudentTable);

// Reset button event
resetBtn.addEventListener('click', resetAttendance);

// ----- Initialization (updated to load attendance) -----
function init() {
    // Load saved attendance from localStorage (if any)
    loadAttendance();

    // Now render all UI based on the loaded data
    clearStudentCard();
    updateStatistics();
    renderStudentTable();
    rollInput.focus();
}

init();

// ----- Explanation (for developer) -----
/*
 * Phase 3 changes:
 * - Added localStorage key "eventAttendance" to store attendance data persistently.
 * - saveAttendance() serializes the students array into a JSON object keyed by rollNo.
 * - loadAttendance() reads the stored data and updates each student's present and attendanceTime.
 * - resetAttendance() clears localStorage, resets all students to absent, and updates the UI.
 * - markAttendance() now calls saveAttendance() after updating a student.
 * - On page load, init() calls loadAttendance() before rendering the table and stats.
 * - The reset button is styled and placed in the stats header with a confirmation dialog.
 * - All existing Phase 1 & 2 functionality remains intact.
 */