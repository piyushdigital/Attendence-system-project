// ========== script.js ==========
// Phase 6B: Multi-Event Management
// All operations are scoped to the currently selected event.

// ============================================================
// 1. DATA LAYER — Events + Current Event
// ============================================================

const EVENTS_STORAGE_KEY = 'eventAttendanceEvents';
const CURRENT_EVENT_KEY = 'eventAttendanceCurrentEventId';

// Old keys for migration
const OLD_STUDENTS_KEY = 'eventStudents';
const OLD_ATTENDANCE_KEY = 'eventAttendance';

let events = [];
let currentEventId = null;

// Helper: generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

// Load events from localStorage
function loadEvents() {
    const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (stored) {
        try {
            events = JSON.parse(stored);
            // Ensure each event has an id and students array
            events.forEach(ev => {
                if (!ev.id) ev.id = generateId();
                if (!ev.students) ev.students = [];
                // Ensure each student has the required fields
                ev.students.forEach(s => {
                    if (s.present === undefined) s.present = false;
                    if (s.attendanceTime === undefined) s.attendanceTime = null;
                    if (s.attendanceTime && typeof s.attendanceTime === 'string') {
                        s.attendanceTime = new Date(s.attendanceTime);
                    }
                });
            });
            return;
        } catch (e) { /* ignore */ }
    }
    events = [];
}

// Save events to localStorage
function saveEvents() {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
}

// Load current event ID
function loadCurrentEventId() {
    const stored = localStorage.getItem(CURRENT_EVENT_KEY);
    if (stored) {
        currentEventId = stored;
        // Validate that the event still exists
        const exists = events.some(ev => ev.id === currentEventId);
        if (!exists) currentEventId = null;
    } else {
        currentEventId = null;
    }
}

// Save current event ID
function saveCurrentEventId() {
    if (currentEventId) {
        localStorage.setItem(CURRENT_EVENT_KEY, currentEventId);
    } else {
        localStorage.removeItem(CURRENT_EVENT_KEY);
    }
}

// Get current event object
function getCurrentEvent() {
    return events.find(ev => ev.id === currentEventId) || null;
}

// Get current event's students (array reference)
function getCurrentStudents() {
    const ev = getCurrentEvent();
    return ev ? ev.students : [];
}

// ============================================================
// 2. DATA MIGRATION (from old single-event storage)
// ============================================================

function migrateOldData() {
    // Check if old keys exist and if we have no events yet
    const oldStudents = localStorage.getItem(OLD_STUDENTS_KEY);
    const oldAttendance = localStorage.getItem(OLD_ATTENDANCE_KEY);
    if (!oldStudents && !oldAttendance) return false;
    if (events.length > 0) return false; // already have events

    // Build student list from old data
    let students = [];
    try {
        if (oldStudents) {
            students = JSON.parse(oldStudents);
            if (!Array.isArray(students)) students = [];
        }
    } catch (e) { students = []; }

    // Apply attendance if available
    if (oldAttendance) {
        try {
            const attData = JSON.parse(oldAttendance);
            students.forEach(s => {
                const record = attData[s.rollNo];
                if (record) {
                    s.present = record.present || false;
                    s.attendanceTime = record.attendanceTime ? new Date(record.attendanceTime) : null;
                }
            });
        } catch (e) { /* ignore */ }
    }

    if (students.length === 0) {
        // If no students, we can still create a demo event with sample data
        students = [
            { rollNo: "101", name: "Rahul Patil", department: "EXTC", year: "Final Year", present: false, attendanceTime: null },
            { rollNo: "102", name: "Aman Shah", department: "Mechanical", year: "Final Year", present: false, attendanceTime: null },
            { rollNo: "103", name: "Priya Joshi", department: "Computer", year: "Final Year", present: false, attendanceTime: null }
        ];
    }

    // Create a new event with these students
    const newEvent = {
        id: generateId(),
        name: "Imported Existing Data",
        venue: "",
        date: "",
        startTime: "",
        endTime: "",
        organizer: "",
        description: "",
        students: students
    };
    events.push(newEvent);
    currentEventId = newEvent.id;
    saveEvents();
    saveCurrentEventId();

    // Clear old keys to avoid re-migration
    localStorage.removeItem(OLD_STUDENTS_KEY);
    localStorage.removeItem(OLD_ATTENDANCE_KEY);

    return true;
}

// ============================================================
// 3. HELPER FUNCTIONS (adapted for current event)
// ============================================================

function formatDateTime(date) {
    if (!date) return 'Not marked';
    if (typeof date === 'string') date = new Date(date);
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function formatDate(date) {
    if (!date) return '—';
    if (typeof date === 'string') date = new Date(date);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatTime(date) {
    if (!date) return '—';
    if (typeof date === 'string') date = new Date(date);
    return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function findStudent(rollNo) {
    const students = getCurrentStudents();
    return students.find(s => s.rollNo.trim() === rollNo.trim());
}

function getStats() {
    const students = getCurrentStudents();
    const total = students.length;
    const present = students.filter(s => s.present).length;
    const absent = total - present;
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);
    return { total, present, absent, percentage };
}

function updateAllStats() {
    const stats = getStats();
    // Attendance Mode stats
    document.getElementById('totalCount').textContent = stats.total;
    document.getElementById('presentCount').textContent = stats.present;
    document.getElementById('absentCount').textContent = stats.absent;
    document.getElementById('percentCount').textContent = stats.percentage + '%';
    // Admin Mode stats
    document.getElementById('totalCountAdmin').textContent = stats.total;
    document.getElementById('presentCountAdmin').textContent = stats.present;
    document.getElementById('absentCountAdmin').textContent = stats.absent;
    document.getElementById('percentCountAdmin').textContent = stats.percentage + '%';
    // Records summary
    document.getElementById('recordsTotal').textContent = stats.total;
    document.getElementById('recordsPresent').textContent = stats.present;
    document.getElementById('recordsAbsent').textContent = stats.absent;
    document.getElementById('recordsPercent').textContent = stats.percentage + '%';
}

// ============================================================
// 4. RENDER CURRENT EVENT DISPLAY
// ============================================================

function renderCurrentEventDisplay() {
    const ev = getCurrentEvent();
    const attendanceName = document.getElementById('attendanceEventName');
    const attendanceDetails = document.getElementById('attendanceEventDetails');
    const adminName = document.getElementById('adminEventName');
    const adminDetails = document.getElementById('adminEventDetails');

    if (!ev) {
        attendanceName.textContent = '— No event selected —';
        attendanceDetails.innerHTML = '';
        adminName.textContent = '— No event selected —';
        adminDetails.innerHTML = '';
        return;
    }

    attendanceName.textContent = ev.name;
    adminName.textContent = ev.name;

    let details = [];
    if (ev.venue) details.push(`📍 ${ev.venue}`);
    if (ev.date) details.push(`📅 ${ev.date}`);
    if (ev.startTime || ev.endTime) {
        let timeStr = '';
        if (ev.startTime) timeStr += ev.startTime;
        if (ev.endTime) timeStr += (timeStr ? ' - ' : '') + ev.endTime;
        if (timeStr) details.push(`🕐 ${timeStr}`);
    }
    if (ev.organizer) details.push(`👤 ${ev.organizer}`);
    // Description is shown separately if needed
    const detailHtml = details.map(d => `<span class="detail-item">${d}</span>`).join('');
    attendanceDetails.innerHTML = detailHtml;
    adminDetails.innerHTML = detailHtml;

    // Also show description if present (as extra line)
    if (ev.description) {
        const descHtml = `<span class="detail-item">📝 ${ev.description}</span>`;
        attendanceDetails.innerHTML += '<br>' + descHtml;
        adminDetails.innerHTML += '<br>' + descHtml;
    }
}

// ============================================================
// 5. RENDER EVENT LIST (Admin)
// ============================================================

function renderEventList() {
    const container = document.getElementById('eventListContainer');
    if (events.length === 0) {
        container.innerHTML = `<div class="empty-events-msg">🎪 No events created yet. Create your first event to get started.</div>`;
        return;
    }

    let html = '';
    events.forEach(ev => {
        const isCurrent = ev.id === currentEventId;
        const metaParts = [];
        if (ev.venue) metaParts.push(ev.venue);
        if (ev.date) metaParts.push(ev.date);
        const meta = metaParts.length ? metaParts.join(' · ') : '';
        html += `
            <div class="event-card ${isCurrent ? 'current' : ''}">
                <div class="event-info">
                    <div class="event-name">${ev.name}</div>
                    ${meta ? `<div class="event-meta">${meta}</div>` : ''}
                </div>
                <div class="event-actions">
                    ${!isCurrent ? `<button class="btn-sm btn-select" data-id="${ev.id}">Select</button>` : `<span style="font-size:0.85rem;color:#4f46e5;font-weight:600;">✔ Active</span>`}
                    <button class="btn-sm btn-edit" data-id="${ev.id}">Edit</button>
                    <button class="btn-sm btn-delete" data-id="${ev.id}">Delete</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;

    // Attach event listeners
    container.querySelectorAll('.btn-select').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            selectEvent(id);
        });
    });
    container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            openEditEventModal(id);
        });
    });
    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            deleteEvent(id);
        });
    });
}

// ============================================================
// 6. EVENT CRUD OPERATIONS
// ============================================================

function createEvent() {
    const name = document.getElementById('eventNameInput').value.trim();
    const feedback = document.getElementById('createEventFeedback');
    feedback.textContent = '';
    feedback.className = 'create-event-feedback';

    if (!name) {
        feedback.textContent = 'Event Name is required.';
        feedback.className = 'create-event-feedback error';
        return;
    }

    // Check for duplicate name (optional)
    if (events.some(ev => ev.name.toLowerCase() === name.toLowerCase())) {
        feedback.textContent = 'An event with this name already exists.';
        feedback.className = 'create-event-feedback error';
        return;
    }

    const newEvent = {
        id: generateId(),
        name: name,
        venue: document.getElementById('eventVenueInput').value.trim(),
        date: document.getElementById('eventDateInput').value,
        startTime: document.getElementById('eventStartTimeInput').value,
        endTime: document.getElementById('eventEndTimeInput').value,
        organizer: document.getElementById('eventOrganizerInput').value.trim(),
        description: document.getElementById('eventDescriptionInput').value.trim(),
        students: []
    };

    events.push(newEvent);
    saveEvents();
    // Select the new event
    selectEvent(newEvent.id);
    // Clear form
    document.getElementById('eventNameInput').value = '';
    document.getElementById('eventVenueInput').value = '';
    document.getElementById('eventDateInput').value = '';
    document.getElementById('eventStartTimeInput').value = '';
    document.getElementById('eventEndTimeInput').value = '';
    document.getElementById('eventOrganizerInput').value = '';
    document.getElementById('eventDescriptionInput').value = '';
    feedback.textContent = `✅ Event "${name}" created successfully!`;
    feedback.className = 'create-event-feedback success';
    // Re-render event list
    renderEventList();
}

function selectEvent(id) {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    currentEventId = id;
    saveCurrentEventId();
    // Refresh all UI
    renderCurrentEventDisplay();
    renderEventList();
    clearAllSearch();
    updateAllStats();
    renderStudentTable();
    renderAttendanceRecords();
    // Update attendance mode heading (already done)
    // Focus appropriate input
    if (currentMode === 'attendance') {
        document.getElementById('rollInput').focus();
    } else {
        document.getElementById('rollInputAdmin').focus();
    }
}

function openEditEventModal(id) {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    document.getElementById('editEventName').value = ev.name;
    document.getElementById('editEventVenue').value = ev.venue || '';
    document.getElementById('editEventDate').value = ev.date || '';
    document.getElementById('editEventStartTime').value = ev.startTime || '';
    document.getElementById('editEventEndTime').value = ev.endTime || '';
    document.getElementById('editEventOrganizer').value = ev.organizer || '';
    document.getElementById('editEventDescription').value = ev.description || '';
    document.getElementById('editEventFeedback').textContent = '';
    document.getElementById('editEventFeedback').className = 'edit-feedback';
    // Store the id in a data attribute
    document.getElementById('editEventModal').dataset.eventId = id;
    document.getElementById('editEventModal').classList.remove('hidden');
}

function saveEditEvent() {
    const modal = document.getElementById('editEventModal');
    const id = modal.dataset.eventId;
    const ev = events.find(e => e.id === id);
    if (!ev) return;

    const name = document.getElementById('editEventName').value.trim();
    const feedback = document.getElementById('editEventFeedback');
    feedback.textContent = '';
    feedback.className = 'edit-feedback';

    if (!name) {
        feedback.textContent = 'Event Name is required.';
        feedback.className = 'edit-feedback error';
        return;
    }

    // Check duplicate name (excluding itself)
    if (events.some(e => e.id !== id && e.name.toLowerCase() === name.toLowerCase())) {
        feedback.textContent = 'Another event with this name already exists.';
        feedback.className = 'edit-feedback error';
        return;
    }

    ev.name = name;
    ev.venue = document.getElementById('editEventVenue').value.trim();
    ev.date = document.getElementById('editEventDate').value;
    ev.startTime = document.getElementById('editEventStartTime').value;
    ev.endTime = document.getElementById('editEventEndTime').value;
    ev.organizer = document.getElementById('editEventOrganizer').value.trim();
    ev.description = document.getElementById('editEventDescription').value.trim();

    saveEvents();
    closeEditEventModal();
    // Refresh UI
    renderCurrentEventDisplay();
    renderEventList();
    // If current event was edited, update stats/table (they remain same)
    if (currentEventId === id) {
        updateAllStats();
        renderStudentTable();
        renderAttendanceRecords();
    }
}

function closeEditEventModal() {
    document.getElementById('editEventModal').classList.add('hidden');
}

function deleteEvent(id) {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    if (!confirm(`Delete event "${ev.name}"?`)) return;
    if (!confirm(`⚠️ This will delete the event, its student list, and all attendance records. Are you sure?`)) return;

    events = events.filter(e => e.id !== id);
    saveEvents();
    // If this was the current event, select another or set to null
    if (currentEventId === id) {
        if (events.length > 0) {
            selectEvent(events[0].id);
        } else {
            currentEventId = null;
            saveCurrentEventId();
            // Refresh UI to show empty state
            renderCurrentEventDisplay();
            renderEventList();
            clearAllSearch();
            updateAllStats();
            renderStudentTable();
            renderAttendanceRecords();
        }
    } else {
        // Just refresh list
        renderEventList();
        // If current event is still valid, no need to reload data
    }
}

// ============================================================
// 7. MODE SWITCHING (adjusted)
// ============================================================

let currentMode = 'attendance';

function switchMode(mode) {
    currentMode = mode;
    document.getElementById('adminModeBtn').classList.toggle('active', mode === 'admin');
    document.getElementById('attendanceModeBtn').classList.toggle('active', mode === 'attendance');
    document.getElementById('adminModeContent').style.display = mode === 'admin' ? 'block' : 'none';
    document.getElementById('attendanceModeContent').style.display = mode === 'attendance' ? 'block' : 'none';

    clearAllSearch();

    if (mode === 'admin') {
        renderEventList();
        renderStudentTable();
        renderAttendanceRecords();
    } else {
        // In attendance mode, clear admin tables
        document.getElementById('studentTableContainerAdmin').innerHTML = '';
        document.getElementById('recordsTableContainer').innerHTML = '';
    }

    // Focus appropriate input
    if (mode === 'attendance') {
        document.getElementById('rollInput').focus();
    } else {
        document.getElementById('rollInputAdmin').focus();
    }
    // Always render current event display (both modes)
    renderCurrentEventDisplay();
    updateAllStats();
}

// ============================================================
// 8. RENDER STUDENT TABLE (Admin only, current event)
// ============================================================

function renderStudentTable() {
    if (currentMode !== 'admin') return;
    const container = document.getElementById('studentTableContainerAdmin');
    const filterValue = document.getElementById('tableFilterAdmin').value.trim().toLowerCase();
    const students = getCurrentStudents();

    let filtered = students;
    if (filterValue) {
        filtered = students.filter(s =>
            s.rollNo.toLowerCase().includes(filterValue) ||
            s.name.toLowerCase().includes(filterValue)
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="no-students-msg">No students found.</div>`;
        return;
    }

    let html = `<table class="student-table"><thead><tr>
        <th>Roll No.</th><th>Name</th><th>Department</th><th>Year</th><th>Status</th><th>Attendance Time</th>
        <th>Admin Actions</th>
    </tr></thead><tbody>`;

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
            <td>
                <button class="action-btn edit" data-roll="${s.rollNo}">✏️ Edit</button>
                <button class="action-btn correct" data-roll="${s.rollNo}">${s.present ? '🔴 Unmark' : '✅ Mark'}</button>
                <button class="action-btn remove" data-roll="${s.rollNo}">🗑️ Remove</button>
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;

    container.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(btn.dataset.roll));
    });
    container.querySelectorAll('.action-btn.correct').forEach(btn => {
        btn.addEventListener('click', () => correctAttendance(btn.dataset.roll));
    });
    container.querySelectorAll('.action-btn.remove').forEach(btn => {
        btn.addEventListener('click', () => removeStudent(btn.dataset.roll));
    });
}

// ============================================================
// 9. ATTENDANCE MODE — SEARCH & VERIFICATION (current event)
// ============================================================

let currentSearchStudent = null;

function clearAllSearch() {
    // Attendance Mode
    document.getElementById('studentCard').classList.add('hidden');
    document.getElementById('searchFeedback').textContent = '';
    document.getElementById('searchFeedback').className = 'search-feedback';
    document.getElementById('attendanceMessage').textContent = '';
    document.getElementById('attendanceMessage').className = 'attendance-message';
    // Admin Mode
    document.getElementById('studentCardAdmin').classList.add('hidden');
    document.getElementById('searchFeedbackAdmin').textContent = '';
    document.getElementById('searchFeedbackAdmin').className = 'search-feedback';
    document.getElementById('attendanceMessageAdmin').textContent = '';
    document.getElementById('attendanceMessageAdmin').className = 'attendance-message';
    currentSearchStudent = null;
}

function performSearchAttendance() {
    const ev = getCurrentEvent();
    if (!ev) {
        const feedback = document.getElementById('searchFeedback');
        feedback.textContent = 'No event selected. Please select an event in Admin Mode.';
        feedback.className = 'search-feedback error';
        document.getElementById('studentCard').classList.add('hidden');
        currentSearchStudent = null;
        return;
    }

    const input = document.getElementById('rollInput').value.trim();
    const feedback = document.getElementById('searchFeedback');
    feedback.textContent = '';
    feedback.className = 'search-feedback';

    if (!input) {
        feedback.textContent = 'Please enter a roll number.';
        feedback.className = 'search-feedback error';
        document.getElementById('studentCard').classList.add('hidden');
        currentSearchStudent = null;
        document.getElementById('rollInput').focus();
        return;
    }

    const student = findStudent(input);
    if (!student) {
        feedback.textContent = 'Student not found.';
        feedback.className = 'search-feedback error';
        document.getElementById('studentCard').classList.add('hidden');
        currentSearchStudent = null;
        document.getElementById('rollInput').focus();
        return;
    }

    feedback.textContent = `✅ Student found: ${student.name}`;
    feedback.className = 'search-feedback success';
    currentSearchStudent = student;
    displayStudentAttendance(student);
}

function displayStudentAttendance(student) {
    const card = document.getElementById('studentCard');
    card.classList.remove('hidden');

    const nameDisplay = document.getElementById('studentNameDisplay');
    nameDisplay.textContent = student.name;
    nameDisplay.className = 'student-name-display';

    document.getElementById('studentRoll').textContent = student.rollNo;
    document.getElementById('studentDept').textContent = student.department;
    document.getElementById('studentYear').textContent = student.year;

    const badge = document.getElementById('statusBadge');
    const timeEl = document.getElementById('studentTime');
    const confirmBtn = document.getElementById('confirmMarkBtn');
    const msg = document.getElementById('attendanceMessage');

    if (student.present) {
        badge.textContent = 'Present';
        badge.className = 'badge present';
        timeEl.textContent = formatDateTime(student.attendanceTime);
        confirmBtn.disabled = true;
        msg.textContent = '⚠️ Attendance already marked.';
        msg.className = 'attendance-message warning';
        nameDisplay.className = 'student-name-display present-name';
    } else {
        badge.textContent = 'Absent';
        badge.className = 'badge absent';
        timeEl.textContent = 'Not marked';
        confirmBtn.disabled = false;
        msg.textContent = 'Verify this student before marking attendance.';
        msg.className = 'attendance-message info';
        nameDisplay.className = 'student-name-display absent-name';
    }

    if (!confirmBtn.disabled) {
        confirmBtn.focus();
    }
}

// ============================================================
// 10. ATTENDANCE MODE — CONFIRM & CANCEL (current event)
// ============================================================

function confirmMarkAttendance() {
    const ev = getCurrentEvent();
    if (!ev) {
        document.getElementById('attendanceMessage').textContent = 'No event selected.';
        document.getElementById('attendanceMessage').className = 'attendance-message warning';
        return;
    }

    if (!currentSearchStudent) {
        document.getElementById('attendanceMessage').textContent = 'Please search for a student first.';
        document.getElementById('attendanceMessage').className = 'attendance-message warning';
        return;
    }

    if (currentSearchStudent.present) {
        document.getElementById('attendanceMessage').textContent = '⚠️ Attendance already marked.';
        document.getElementById('attendanceMessage').className = 'attendance-message warning';
        document.getElementById('confirmMarkBtn').disabled = true;
        return;
    }

    // Mark present
    currentSearchStudent.present = true;
    currentSearchStudent.attendanceTime = new Date();
    saveEvents(); // save whole events array

    // Update the card to show success state
    const nameDisplay = document.getElementById('studentNameDisplay');
    nameDisplay.textContent = currentSearchStudent.name;
    nameDisplay.className = 'student-name-display present-name';

    document.getElementById('statusBadge').textContent = 'Present';
    document.getElementById('statusBadge').className = 'badge present';
    document.getElementById('studentTime').textContent = formatDateTime(currentSearchStudent.attendanceTime);
    document.getElementById('confirmMarkBtn').disabled = true;

    const msg = document.getElementById('attendanceMessage');
    msg.innerHTML = `✅ <strong>Attendance marked successfully!</strong><br>
        ${currentSearchStudent.name} · ${formatTime(currentSearchStudent.attendanceTime)}`;
    msg.className = 'attendance-message success';

    // Update statistics and admin table
    updateAllStats();
    if (currentMode === 'admin') {
        renderStudentTable();
        renderAttendanceRecords();
    }

    // Clear input and focus for next student
    document.getElementById('rollInput').value = '';
    document.getElementById('rollInput').focus();
}

function cancelMarkAttendance() {
    document.getElementById('studentCard').classList.add('hidden');
    document.getElementById('attendanceMessage').textContent = '';
    document.getElementById('attendanceMessage').className = 'attendance-message';
    document.getElementById('searchFeedback').textContent = '';
    document.getElementById('searchFeedback').className = 'search-feedback';
    document.getElementById('rollInput').value = '';
    currentSearchStudent = null;
    document.getElementById('rollInput').focus();
}

// ============================================================
// 11. KEYBOARD SUPPORT (Attendance Mode)
// ============================================================

document.getElementById('rollInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const card = document.getElementById('studentCard');
        const confirmBtn = document.getElementById('confirmMarkBtn');
        if (!card.classList.contains('hidden') && !confirmBtn.disabled) {
            confirmMarkAttendance();
        } else {
            performSearchAttendance();
        }
    }
});

// ============================================================
// 12. ADMIN MODE — SEARCH (current event)
// ============================================================

let currentAdminSearchStudent = null;

function performSearchAdmin() {
    const ev = getCurrentEvent();
    if (!ev) {
        const feedback = document.getElementById('searchFeedbackAdmin');
        feedback.textContent = 'No event selected. Please create or select an event.';
        feedback.className = 'search-feedback error';
        document.getElementById('studentCardAdmin').classList.add('hidden');
        currentAdminSearchStudent = null;
        return;
    }

    const input = document.getElementById('rollInputAdmin').value.trim();
    const feedback = document.getElementById('searchFeedbackAdmin');
    feedback.textContent = '';
    feedback.className = 'search-feedback';

    if (!input) {
        feedback.textContent = 'Please enter a roll number.';
        feedback.className = 'search-feedback error';
        document.getElementById('studentCardAdmin').classList.add('hidden');
        currentAdminSearchStudent = null;
        return;
    }

    const student = findStudent(input);
    if (!student) {
        feedback.textContent = 'Student not found.';
        feedback.className = 'search-feedback error';
        document.getElementById('studentCardAdmin').classList.add('hidden');
        currentAdminSearchStudent = null;
        return;
    }

    feedback.textContent = `Student found: ${student.name}`;
    feedback.className = 'search-feedback success';
    currentAdminSearchStudent = student;
    displayStudentAdmin(student);
}

function displayStudentAdmin(student) {
    const card = document.getElementById('studentCardAdmin');
    card.classList.remove('hidden');
    document.getElementById('studentNameAdmin').textContent = student.name;
    document.getElementById('studentRollAdmin').textContent = student.rollNo;
    document.getElementById('studentDeptAdmin').textContent = student.department;
    document.getElementById('studentYearAdmin').textContent = student.year;

    const badge = document.getElementById('statusBadgeAdmin');
    const timeEl = document.getElementById('studentTimeAdmin');
    const msg = document.getElementById('attendanceMessageAdmin');

    if (student.present) {
        badge.textContent = 'Present';
        badge.className = 'badge present';
        timeEl.textContent = formatDateTime(student.attendanceTime);
        msg.textContent = 'This student is present.';
        msg.className = 'attendance-message info';
    } else {
        badge.textContent = 'Absent';
        badge.className = 'badge absent';
        timeEl.textContent = 'Not marked';
        msg.textContent = 'This student is absent.';
        msg.className = 'attendance-message warning';
    }
}

// ============================================================
// 13. ADMIN FUNCTIONS (current event)
// ============================================================

function addStudent() {
    const ev = getCurrentEvent();
    if (!ev) {
        document.getElementById('addFeedback').textContent = 'No event selected.';
        document.getElementById('addFeedback').className = 'add-feedback error';
        return;
    }

    const rollNo = document.getElementById('addRollNo').value.trim();
    const name = document.getElementById('addName').value.trim();
    const department = document.getElementById('addDept').value.trim();
    const year = document.getElementById('addYear').value.trim();
    const feedback = document.getElementById('addFeedback');

    feedback.textContent = '';
    feedback.className = 'add-feedback';

    if (!rollNo || !name || !department || !year) {
        feedback.textContent = 'All fields are required.';
        feedback.className = 'add-feedback error';
        return;
    }
    if (findStudent(rollNo)) {
        feedback.textContent = `Roll number "${rollNo}" already exists in this event.`;
        feedback.className = 'add-feedback error';
        return;
    }

    ev.students.push({ rollNo, name, department, year, present: false, attendanceTime: null });
    saveEvents();
    updateAllStats();
    renderStudentTable();
    renderAttendanceRecords();
    document.getElementById('addRollNo').value = '';
    document.getElementById('addName').value = '';
    document.getElementById('addDept').value = '';
    document.getElementById('addYear').value = '';
    feedback.textContent = `✅ Student "${name}" added successfully!`;
    feedback.className = 'add-feedback success';
    document.getElementById('studentCardAdmin').classList.add('hidden');
}

function removeStudent(rollNo) {
    const ev = getCurrentEvent();
    if (!ev) return;
    const student = findStudent(rollNo);
    if (!student) return;
    if (!confirm(`Are you sure you want to remove "${student.name}" (${rollNo})?`)) return;

    ev.students = ev.students.filter(s => s.rollNo !== rollNo);
    saveEvents();
    updateAllStats();
    renderStudentTable();
    renderAttendanceRecords();
    if (currentAdminSearchStudent && currentAdminSearchStudent.rollNo === rollNo) {
        document.getElementById('studentCardAdmin').classList.add('hidden');
        currentAdminSearchStudent = null;
    }
}

let editTargetRoll = null;

function openEditModal(rollNo) {
    const student = findStudent(rollNo);
    if (!student) return;
    editTargetRoll = rollNo;
    document.getElementById('editRollNo').value = student.rollNo;
    document.getElementById('editName').value = student.name;
    document.getElementById('editDept').value = student.department;
    document.getElementById('editYear').value = student.year;
    document.getElementById('editFeedback').textContent = '';
    document.getElementById('editFeedback').className = 'edit-feedback';
    document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    editTargetRoll = null;
}

function saveEditStudent() {
    const ev = getCurrentEvent();
    if (!ev) return;

    const rollNo = document.getElementById('editRollNo').value.trim();
    const name = document.getElementById('editName').value.trim();
    const department = document.getElementById('editDept').value.trim();
    const year = document.getElementById('editYear').value.trim();
    const feedback = document.getElementById('editFeedback');

    feedback.textContent = '';
    feedback.className = 'edit-feedback';

    if (!rollNo || !name || !department || !year) {
        feedback.textContent = 'All fields are required.';
        feedback.className = 'edit-feedback error';
        return;
    }

    const student = findStudent(editTargetRoll);
    if (!student) {
        feedback.textContent = 'Student not found.';
        feedback.className = 'edit-feedback error';
        return;
    }

    if (rollNo !== editTargetRoll && findStudent(rollNo)) {
        feedback.textContent = `Roll number "${rollNo}" already exists in this event.`;
        feedback.className = 'edit-feedback error';
        return;
    }

    const wasPresent = student.present;
    const attendanceTime = student.attendanceTime;

    student.rollNo = rollNo;
    student.name = name;
    student.department = department;
    student.year = year;
    student.present = wasPresent;
    student.attendanceTime = attendanceTime;

    saveEvents();
    updateAllStats();
    renderStudentTable();
    renderAttendanceRecords();
    closeEditModal();

    if (currentAdminSearchStudent && currentAdminSearchStudent.rollNo === rollNo) {
        displayStudentAdmin(student);
    }
}

function correctAttendance(rollNo) {
    const ev = getCurrentEvent();
    if (!ev) return;
    const student = findStudent(rollNo);
    if (!student) return;

    if (student.present) {
        if (!confirm(`Are you sure you want to remove "${student.name}"'s attendance?`)) return;
        student.present = false;
        student.attendanceTime = null;
    } else {
        if (!confirm(`Mark "${student.name}" as present?`)) return;
        student.present = true;
        student.attendanceTime = new Date();
    }

    saveEvents();
    updateAllStats();
    renderStudentTable();
    renderAttendanceRecords();

    if (currentAdminSearchStudent && currentAdminSearchStudent.rollNo === rollNo) {
        displayStudentAdmin(student);
    }
    if (currentSearchStudent && currentSearchStudent.rollNo === rollNo) {
        displayStudentAttendance(student);
    }
}

function resetAllAttendance() {
    const ev = getCurrentEvent();
    if (!ev) {
        document.getElementById('dangerFeedback').textContent = 'No event selected.';
        document.getElementById('dangerFeedback').className = 'danger-feedback error';
        return;
    }
    if (!confirm('⚠️ WARNING: This will clear attendance for ALL students in this event. Continue?')) return;
    if (!confirm('Are you absolutely sure? This action cannot be undone.')) return;

    ev.students.forEach(s => {
        s.present = false;
        s.attendanceTime = null;
    });
    saveEvents();
    updateAllStats();
    renderStudentTable();
    renderAttendanceRecords();
    document.getElementById('studentCard').classList.add('hidden');
    document.getElementById('studentCardAdmin').classList.add('hidden');
    currentSearchStudent = null;
    currentAdminSearchStudent = null;
    document.getElementById('dangerFeedback').textContent = '✅ All attendance records have been reset for this event.';
    document.getElementById('dangerFeedback').className = 'danger-feedback success';
    setTimeout(() => {
        document.getElementById('dangerFeedback').textContent = '';
        document.getElementById('dangerFeedback').className = 'danger-feedback';
    }, 4000);
}

function clearStudentList() {
    const ev = getCurrentEvent();
    if (!ev) {
        document.getElementById('dangerFeedback').textContent = 'No event selected.';
        document.getElementById('dangerFeedback').className = 'danger-feedback error';
        return;
    }
    if (ev.students.length === 0) {
        document.getElementById('dangerFeedback').textContent = 'Student list is already empty for this event.';
        document.getElementById('dangerFeedback').className = 'danger-feedback info';
        return;
    }
    if (!confirm('⚠️ WARNING: This will remove ALL students from this event. Continue?')) return;
    if (!confirm('Are you absolutely sure? All student data will be permanently deleted.')) return;

    ev.students = [];
    saveEvents();
    updateAllStats();
    renderStudentTable();
    renderAttendanceRecords();
    document.getElementById('studentCard').classList.add('hidden');
    document.getElementById('studentCardAdmin').classList.add('hidden');
    currentSearchStudent = null;
    currentAdminSearchStudent = null;
    document.getElementById('dangerFeedback').textContent = '🗑️ All students have been removed from this event.';
    document.getElementById('dangerFeedback').className = 'danger-feedback success';
    setTimeout(() => {
        document.getElementById('dangerFeedback').textContent = '';
        document.getElementById('dangerFeedback').className = 'danger-feedback';
    }, 4000);
}

// ============================================================
// 14. CSV / EXCEL IMPORT (current event)
// ============================================================

function validateImportData(data) {
    const errors = [];
    const rollNos = new Set();
    if (!data || data.length === 0) {
        errors.push('No data found in file.');
        return errors;
    }
    const headers = Object.keys(data[0]);
    const required = ['rollNo', 'name', 'department', 'year'];
    for (const req of required) {
        if (!headers.includes(req)) {
            errors.push(`Missing required column: "${req}"`);
        }
    }
    if (errors.length > 0) return errors;

    data.forEach((row, idx) => {
        const roll = (row.rollNo || '').trim();
        const name = (row.name || '').trim();
        const dept = (row.department || '').trim();
        const year = (row.year || '').trim();
        if (!roll) errors.push(`Row ${idx + 1}: Roll Number is empty.`);
        if (!name) errors.push(`Row ${idx + 1}: Name is empty.`);
        if (!dept) errors.push(`Row ${idx + 1}: Department is empty.`);
        if (!year) errors.push(`Row ${idx + 1}: Year is empty.`);
        if (roll && rollNos.has(roll)) {
            errors.push(`Row ${idx + 1}: Duplicate roll number "${roll}" in file.`);
        }
        rollNos.add(roll);
    });
    return errors;
}

function processImportData(data, feedbackEl) {
    const ev = getCurrentEvent();
    if (!ev) {
        feedbackEl.textContent = 'No event selected.';
        feedbackEl.className = 'import-feedback error';
        return false;
    }

    const errors = validateImportData(data);
    if (errors.length > 0) {
        feedbackEl.textContent = '❌ Validation errors:\n' + errors.join('\n');
        feedbackEl.className = 'import-feedback error';
        return false;
    }

    if (ev.students.length > 0) {
        if (!confirm('This will replace the current student list for this event. Continue?')) {
            feedbackEl.textContent = 'Import cancelled.';
            feedbackEl.className = 'import-feedback';
            return false;
        }
    }

    ev.students = data.map(row => ({
        rollNo: (row.rollNo || '').trim(),
        name: (row.name || '').trim(),
        department: (row.department || '').trim(),
        year: (row.year || '').trim(),
        present: false,
        attendanceTime: null
    }));

    saveEvents();
    updateAllStats();
    renderStudentTable();
    renderAttendanceRecords();
    document.getElementById('studentCard').classList.add('hidden');
    document.getElementById('studentCardAdmin').classList.add('hidden');
    currentSearchStudent = null;
    currentAdminSearchStudent = null;
    feedbackEl.textContent = `✅ Imported ${ev.students.length} students successfully!`;
    feedbackEl.className = 'import-feedback success';
    return true;
}

function importCSV() {
    const fileInput = document.getElementById('csvFileInput');
    const feedback = document.getElementById('importFeedback');
    feedback.textContent = '';
    feedback.className = 'import-feedback';

    if (!fileInput.files || fileInput.files.length === 0) {
        feedback.textContent = 'Please select a CSV file.';
        feedback.className = 'import-feedback error';
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const text = e.target.result;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length < 2) {
                feedback.textContent = 'File must contain a header row and at least one data row.';
                feedback.className = 'import-feedback error';
                return;
            }
            const headers = lines[0].split(',').map(h => h.trim());
            const data = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                const row = {};
                headers.forEach((h, idx) => {
                    row[h] = values[idx] || '';
                });
                data.push(row);
            }
            processImportData(data, feedback);
        } catch (err) {
            feedback.textContent = 'Error parsing CSV: ' + err.message;
            feedback.className = 'import-feedback error';
        }
    };
    reader.readAsText(file);
}

function importExcel() {
    const fileInput = document.getElementById('excelFileInput');
    const feedback = document.getElementById('importFeedback');
    feedback.textContent = '';
    feedback.className = 'import-feedback';

    if (!fileInput.files || fileInput.files.length === 0) {
        feedback.textContent = 'Please select an Excel file.';
        feedback.className = 'import-feedback error';
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            if (!jsonData || jsonData.length === 0) {
                feedback.textContent = 'No data found in the Excel file.';
                feedback.className = 'import-feedback error';
                return;
            }
            processImportData(jsonData, feedback);
        } catch (err) {
            feedback.textContent = 'Error parsing Excel: ' + err.message;
            feedback.className = 'import-feedback error';
        }
    };
    reader.readAsArrayBuffer(file);
}

// ============================================================
// 15. ATTENDANCE RECORDS (current event)
// ============================================================

let recordsSortColumn = null;
let recordsSortAsc = true;

function renderAttendanceRecords() {
    if (currentMode !== 'admin') return;
    const container = document.getElementById('recordsTableContainer');
    const searchVal = document.getElementById('recordsSearch').value.trim().toLowerCase();
    const statusFilter = document.getElementById('recordsStatusFilter').value;
    const students = getCurrentStudents();

    let filtered = students.filter(s => {
        const matchSearch = s.rollNo.toLowerCase().includes(searchVal) ||
                            s.name.toLowerCase().includes(searchVal);
        const matchStatus = statusFilter === 'all' ||
                            (statusFilter === 'present' && s.present) ||
                            (statusFilter === 'absent' && !s.present);
        return matchSearch && matchStatus;
    });

    if (recordsSortColumn) {
        filtered.sort((a, b) => {
            let valA, valB;
            switch (recordsSortColumn) {
                case 'rollNo':
                    valA = a.rollNo;
                    valB = b.rollNo;
                    break;
                case 'name':
                    valA = a.name;
                    valB = b.name;
                    break;
                case 'status':
                    valA = a.present ? 1 : 0;
                    valB = b.present ? 1 : 0;
                    break;
                case 'attendanceTime':
                    valA = a.attendanceTime ? a.attendanceTime.getTime() : 0;
                    valB = b.attendanceTime ? b.attendanceTime.getTime() : 0;
                    break;
                default:
                    valA = a.rollNo;
                    valB = b.rollNo;
            }
            if (valA < valB) return recordsSortAsc ? -1 : 1;
            if (valA > valB) return recordsSortAsc ? 1 : -1;
            return 0;
        });
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="no-records">No attendance records found.</div>`;
        return;
    }

    let html = `<table class="records-table"><thead><tr>`;
    const columns = [
        { key: 'rollNo', label: 'Roll No.' },
        { key: 'name', label: 'Name' },
        { key: 'department', label: 'Department' },
        { key: 'year', label: 'Year' },
        { key: 'status', label: 'Status' },
        { key: 'attendanceTime', label: 'Attendance Date' }
    ];
    columns.forEach(col => {
        const isSorted = recordsSortColumn === col.key;
        const cls = isSorted ? (recordsSortAsc ? 'sorted-asc' : 'sorted-desc') : '';
        html += `<th class="${cls}" data-sort="${col.key}">
            ${col.label}
            <span class="sort-indicator"></span>
        </th>`;
    });
    html += `<th>Attendance Time</th>`;
    html += `</tr></thead><tbody>`;

    filtered.forEach(s => {
        const statusClass = s.present ? 'present' : 'absent';
        const statusText = s.present ? 'Present' : 'Absent';
        const dateDisplay = s.present ? formatDate(s.attendanceTime) : '—';
        const timeDisplay = s.present ? formatTime(s.attendanceTime) : '—';
        html += `<tr>
            <td>${s.rollNo}</td>
            <td>${s.name}</td>
            <td>${s.department}</td>
            <td>${s.year}</td>
            <td><span class="status-badge-table ${statusClass}">${statusText}</span></td>
            <td>${dateDisplay}</td>
            <td>${timeDisplay}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;

    container.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', function() {
            const key = this.dataset.sort;
            if (recordsSortColumn === key) {
                recordsSortAsc = !recordsSortAsc;
            } else {
                recordsSortColumn = key;
                recordsSortAsc = true;
            }
            renderAttendanceRecords();
        });
    });
}

// ============================================================
// 16. EXPORT & PRINT (current event)
// ============================================================

function sanitizeFilename(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function exportAttendanceCSV() {
    const ev = getCurrentEvent();
    if (!ev) {
        alert('No event selected.');
        return;
    }
    const students = ev.students;
    if (students.length === 0) {
        alert('No students to export.');
        return;
    }

    const data = students.map(s => ({
        'Roll Number': s.rollNo,
        'Name': s.name,
        'Department': s.department,
        'Year': s.year,
        'Status': s.present ? 'Present' : 'Absent',
        'Attendance Date': s.present ? formatDate(s.attendanceTime) : '',
        'Attendance Time': s.present ? formatTime(s.attendanceTime) : ''
    }));

    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h] || ''));
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const safeName = sanitizeFilename(ev.name) || 'event';
    const date = new Date().toISOString().slice(0, 10);
    link.download = `${safeName}-attendance-${date}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
}

function printAttendanceReport() {
    window.print();
}

// ============================================================
// 17. INITIALIZATION
// ============================================================

function init() {
    // Load events and current event
    loadEvents();
    loadCurrentEventId();

    // Migrate old data if needed (only if no events exist)
    if (events.length === 0) {
        migrateOldData();
        // Reload after migration
        loadEvents();
        loadCurrentEventId();
    }

    // If still no events, set currentEventId to null
    if (events.length === 0) {
        currentEventId = null;
        saveCurrentEventId();
    } else if (!currentEventId) {
        // Select first event if none selected
        selectEvent(events[0].id);
    } else {
        // Ensure current event is valid
        const exists = events.some(ev => ev.id === currentEventId);
        if (!exists) {
            selectEvent(events[0].id);
        } else {
            // Just refresh UI with current event
            renderCurrentEventDisplay();
            updateAllStats();
            renderStudentTable();
            renderAttendanceRecords();
        }
    }

    // Set default mode
    switchMode('attendance');

    // ---- Event Listeners ----

    // Mode switching
    document.getElementById('adminModeBtn').addEventListener('click', () => switchMode('admin'));
    document.getElementById('attendanceModeBtn').addEventListener('click', () => switchMode('attendance'));

    // Attendance Mode search
    document.getElementById('searchBtn').addEventListener('click', performSearchAttendance);

    // Attendance Mode confirm/cancel
    document.getElementById('confirmMarkBtn').addEventListener('click', confirmMarkAttendance);
    document.getElementById('cancelMarkBtn').addEventListener('click', cancelMarkAttendance);

    // Admin Mode search
    document.getElementById('searchBtnAdmin').addEventListener('click', performSearchAdmin);
    document.getElementById('rollInputAdmin').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearchAdmin();
    });

    // Admin table filter
    document.getElementById('tableFilterAdmin').addEventListener('input', renderStudentTable);

    // Admin actions
    document.getElementById('addStudentBtn').addEventListener('click', addStudent);
    document.getElementById('resetAttendanceAdminBtn').addEventListener('click', resetAllAttendance);
    document.getElementById('clearStudentsBtn').addEventListener('click', clearStudentList);

    // Import buttons
    document.getElementById('importCsvBtn').addEventListener('click', importCSV);
    document.getElementById('importExcelBtn').addEventListener('click', importExcel);

    // Modal events (student edit)
    document.getElementById('editSaveBtn').addEventListener('click', saveEditStudent);
    document.getElementById('editCancelBtn').addEventListener('click', closeEditModal);
    document.getElementById('editModal').addEventListener('click', function(e) {
        if (e.target === this) closeEditModal();
    });

    // Event creation
    document.getElementById('createEventBtn').addEventListener('click', createEvent);
    // Enter key on event name input to create
    document.getElementById('eventNameInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            createEvent();
        }
    });

    // Event edit modal
    document.getElementById('editEventSaveBtn').addEventListener('click', saveEditEvent);
    document.getElementById('editEventCancelBtn').addEventListener('click', closeEditEventModal);
    document.getElementById('editEventModal').addEventListener('click', function(e) {
        if (e.target === this) closeEditEventModal();
    });

    // Records events
    document.getElementById('recordsSearch').addEventListener('input', renderAttendanceRecords);
    document.getElementById('recordsStatusFilter').addEventListener('change', renderAttendanceRecords);
    document.getElementById('exportCsvBtn').addEventListener('click', exportAttendanceCSV);
    document.getElementById('printReportBtn').addEventListener('click', printAttendanceReport);

    // Enter key on add form
    document.querySelectorAll('#addRollNo, #addName, #addDept, #addYear').forEach(el => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addStudent();
        });
    });

    console.log('✅ Event Attendance System initialized (Multi-Event).');
}

document.addEventListener('DOMContentLoaded', init);