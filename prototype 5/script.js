// ========== script.js ==========
// Phase 5: Added Attendance Records with filtering, sorting, export, and print.

// ============================================================
// 1. DATA LAYER
// ============================================================

let students = [];

const DEFAULT_STUDENTS = [
    { rollNo: "101", name: "Rahul Patil", department: "EXTC", year: "Final Year", present: false, attendanceTime: null },
    { rollNo: "102", name: "Aman Shah", department: "Mechanical", year: "Final Year", present: false, attendanceTime: null },
    { rollNo: "103", name: "Priya Joshi", department: "Computer", year: "Final Year", present: false, attendanceTime: null }
];

const STORAGE_KEY_STUDENTS = 'eventStudents';
const STORAGE_KEY_ATTENDANCE = 'eventAttendance';

function loadStudents() {
    const stored = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                students = parsed;
                students.forEach(s => {
                    if (s.present === undefined) s.present = false;
                    if (s.attendanceTime === undefined) s.attendanceTime = null;
                    if (s.attendanceTime && typeof s.attendanceTime === 'string') {
                        s.attendanceTime = new Date(s.attendanceTime);
                    }
                });
                return;
            }
        } catch (e) { /* ignore */ }
    }
    students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
}

function saveStudents() {
    const toSave = students.map(s => ({
        rollNo: s.rollNo,
        name: s.name,
        department: s.department,
        year: s.year
    }));
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(toSave));
}

function loadAttendance() {
    const stored = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
    if (!stored) return;
    try {
        const data = JSON.parse(stored);
        students.forEach(s => {
            const record = data[s.rollNo];
            if (record) {
                s.present = record.present || false;
                s.attendanceTime = record.attendanceTime ? new Date(record.attendanceTime) : null;
            }
        });
    } catch (e) { /* ignore */ }
}

function saveAttendance() {
    const data = {};
    students.forEach(s => {
        data[s.rollNo] = {
            present: s.present,
            attendanceTime: s.attendanceTime ? s.attendanceTime.toISOString() : null
        };
    });
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(data));
}

function saveAllData() {
    saveStudents();
    saveAttendance();
}

function loadAllData() {
    loadStudents();
    loadAttendance();
}

// ============================================================
// 2. HELPER FUNCTIONS
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
        minute: '2-digit'
    });
}

function findStudent(rollNo) {
    return students.find(s => s.rollNo.trim() === rollNo.trim());
}

function getStats() {
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
// 3. MODE SWITCHING
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
        renderStudentTable();
        renderAttendanceRecords();
    } else {
        // In attendance mode, clear admin table and records
        document.getElementById('studentTableContainerAdmin').innerHTML = '';
        document.getElementById('recordsTableContainer').innerHTML = '';
    }

    if (mode === 'attendance') {
        document.getElementById('rollInput').focus();
    } else {
        document.getElementById('rollInputAdmin').focus();
    }
}

// ============================================================
// 4. RENDER STUDENT TABLE (Admin only)
// ============================================================

function renderStudentTable() {
    if (currentMode !== 'admin') return;

    const container = document.getElementById('studentTableContainerAdmin');
    const filterValue = document.getElementById('tableFilterAdmin').value.trim().toLowerCase();

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
// 5. SEARCH (Attendance Mode)
// ============================================================

let currentSearchStudent = null;

function clearAllSearch() {
    document.getElementById('studentCard').classList.add('hidden');
    document.getElementById('searchFeedback').textContent = '';
    document.getElementById('searchFeedback').className = 'search-feedback';
    document.getElementById('attendanceMessage').textContent = '';
    document.getElementById('attendanceMessage').className = 'attendance-message';
    document.getElementById('studentCardAdmin').classList.add('hidden');
    document.getElementById('searchFeedbackAdmin').textContent = '';
    document.getElementById('searchFeedbackAdmin').className = 'search-feedback';
    document.getElementById('attendanceMessageAdmin').textContent = '';
    document.getElementById('attendanceMessageAdmin').className = 'attendance-message';
    currentSearchStudent = null;
}

function performSearchAttendance() {
    const input = document.getElementById('rollInput').value.trim();
    const feedback = document.getElementById('searchFeedback');
    feedback.textContent = '';
    feedback.className = 'search-feedback';

    if (!input) {
        feedback.textContent = 'Please enter a roll number.';
        feedback.className = 'search-feedback error';
        document.getElementById('studentCard').classList.add('hidden');
        currentSearchStudent = null;
        return;
    }

    const student = findStudent(input);
    if (!student) {
        feedback.textContent = 'Student not found.';
        feedback.className = 'search-feedback error';
        document.getElementById('studentCard').classList.add('hidden');
        currentSearchStudent = null;
        return;
    }

    feedback.textContent = `Student found: ${student.name}`;
    feedback.className = 'search-feedback success';
    currentSearchStudent = student;
    displayStudentAttendance(student);
}

function displayStudentAttendance(student) {
    const card = document.getElementById('studentCard');
    card.classList.remove('hidden');
    document.getElementById('studentName').textContent = student.name;
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
        msg.className = 'attendance-message info';
    } else {
        badge.textContent = 'Absent';
        badge.className = 'badge absent';
        timeEl.textContent = 'Not marked';
        confirmBtn.disabled = false;
        msg.textContent = '';
        msg.className = 'attendance-message';
    }
}

function confirmMarkAttendance() {
    if (!currentSearchStudent) return;
    if (currentSearchStudent.present) {
        document.getElementById('attendanceMessage').textContent = '⚠️ Attendance already marked.';
        document.getElementById('attendanceMessage').className = 'attendance-message info';
        return;
    }
    currentSearchStudent.present = true;
    currentSearchStudent.attendanceTime = new Date();
    saveAttendance();
    displayStudentAttendance(currentSearchStudent);
    document.getElementById('attendanceMessage').textContent = '✅ Attendance marked successfully!';
    document.getElementById('attendanceMessage').className = 'attendance-message success';
    updateAllStats();
    if (currentMode === 'admin') {
        renderStudentTable();
        renderAttendanceRecords();
    }
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
// 6. SEARCH (Admin Mode)
// ============================================================

let currentAdminSearchStudent = null;

function performSearchAdmin() {
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
// 7. ADMIN FUNCTIONS
// ============================================================

function addStudent() {
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
        feedback.textContent = `Roll number "${rollNo}" already exists.`;
        feedback.className = 'add-feedback error';
        return;
    }

    students.push({ rollNo, name, department, year, present: false, attendanceTime: null });
    saveStudents();
    saveAttendance();
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
    const student = findStudent(rollNo);
    if (!student) return;
    if (!confirm(`Are you sure you want to remove "${student.name}" (${rollNo})?`)) return;

    students = students.filter(s => s.rollNo !== rollNo);
    saveStudents();
    saveAttendance();
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
        feedback.textContent = `Roll number "${rollNo}" already exists.`;
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

    saveStudents();
    saveAttendance();
    updateAllStats();
    renderStudentTable();
    renderAttendanceRecords();
    closeEditModal();

    if (currentAdminSearchStudent && currentAdminSearchStudent.rollNo === rollNo) {
        displayStudentAdmin(student);
    }
}

function correctAttendance(rollNo) {
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

    saveAttendance();
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
    if (!confirm('⚠️ WARNING: This will clear attendance for ALL registered students. Continue?')) return;
    if (!confirm('Are you absolutely sure? This action cannot be undone.')) return;

    students.forEach(s => {
        s.present = false;
        s.attendanceTime = null;
    });
    saveAttendance();
    updateAllStats();
    renderStudentTable();
    renderAttendanceRecords();
    document.getElementById('studentCard').classList.add('hidden');
    document.getElementById('studentCardAdmin').classList.add('hidden');
    currentSearchStudent = null;
    currentAdminSearchStudent = null;
    document.getElementById('dangerFeedback').textContent = '✅ All attendance records have been reset.';
    document.getElementById('dangerFeedback').className = 'danger-feedback success';
    setTimeout(() => {
        document.getElementById('dangerFeedback').textContent = '';
        document.getElementById('dangerFeedback').className = 'danger-feedback';
    }, 4000);
}

function clearStudentList() {
    if (students.length === 0) {
        document.getElementById('dangerFeedback').textContent = 'Student list is already empty.';
        document.getElementById('dangerFeedback').className = 'danger-feedback info';
        return;
    }
    if (!confirm('⚠️ WARNING: This will remove ALL students from the list. Continue?')) return;
    if (!confirm('Are you absolutely sure? All student data will be permanently deleted.')) return;

    students = [];
    saveStudents();
    saveAttendance();
    updateAllStats();
    renderStudentTable();
    renderAttendanceRecords();
    document.getElementById('studentCard').classList.add('hidden');
    document.getElementById('studentCardAdmin').classList.add('hidden');
    currentSearchStudent = null;
    currentAdminSearchStudent = null;
    document.getElementById('dangerFeedback').textContent = '🗑️ All students have been removed.';
    document.getElementById('dangerFeedback').className = 'danger-feedback success';
    setTimeout(() => {
        document.getElementById('dangerFeedback').textContent = '';
        document.getElementById('dangerFeedback').className = 'danger-feedback';
    }, 4000);
}

// ============================================================
// 8. CSV / EXCEL IMPORT
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
            errors.push(`Row ${idx + 1}: Duplicate roll number "${roll}".`);
        }
        rollNos.add(roll);
    });
    return errors;
}

function processImportData(data, feedbackEl) {
    const errors = validateImportData(data);
    if (errors.length > 0) {
        feedbackEl.textContent = '❌ Validation errors:\n' + errors.join('\n');
        feedbackEl.className = 'import-feedback error';
        return false;
    }

    if (students.length > 0) {
        if (!confirm('Importing this file will replace the current registered student list. Continue?')) {
            feedbackEl.textContent = 'Import cancelled.';
            feedbackEl.className = 'import-feedback';
            return false;
        }
    }

    students = data.map(row => ({
        rollNo: (row.rollNo || '').trim(),
        name: (row.name || '').trim(),
        department: (row.department || '').trim(),
        year: (row.year || '').trim(),
        present: false,
        attendanceTime: null
    }));

    saveStudents();
    saveAttendance();
    updateAllStats();
    renderStudentTable();
    renderAttendanceRecords();
    document.getElementById('studentCard').classList.add('hidden');
    document.getElementById('studentCardAdmin').classList.add('hidden');
    currentSearchStudent = null;
    currentAdminSearchStudent = null;
    feedbackEl.textContent = `✅ Imported ${students.length} students successfully!`;
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
// 9. ATTENDANCE RECORDS (NEW)
// ============================================================

// Sorting state for records table
let recordsSortColumn = null;
let recordsSortAsc = true;

function renderAttendanceRecords() {
    // Only in admin mode
    if (currentMode !== 'admin') return;

    const container = document.getElementById('recordsTableContainer');
    const searchVal = document.getElementById('recordsSearch').value.trim().toLowerCase();
    const statusFilter = document.getElementById('recordsStatusFilter').value;

    // Filter data
    let filtered = students.filter(s => {
        const matchSearch = s.rollNo.toLowerCase().includes(searchVal) ||
                            s.name.toLowerCase().includes(searchVal);
        const matchStatus = statusFilter === 'all' ||
                            (statusFilter === 'present' && s.present) ||
                            (statusFilter === 'absent' && !s.present);
        return matchSearch && matchStatus;
    });

    // Sort
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
    // We'll also need Time column but we'll handle separately
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

    // Attach click events for sorting
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
// 10. EXPORT ATTENDANCE CSV
// ============================================================

function exportAttendanceCSV() {
    // Get all students (no filter)
    const data = students.map(s => ({
        'Roll Number': s.rollNo,
        'Name': s.name,
        'Department': s.department,
        'Year': s.year,
        'Status': s.present ? 'Present' : 'Absent',
        'Attendance Date': s.present ? formatDate(s.attendanceTime) : '',
        'Attendance Time': s.present ? formatTime(s.attendanceTime) : ''
    }));

    if (data.length === 0) {
        alert('No students to export.');
        return;
    }

    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h] || ''));
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.download = `attendance-report-${date}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
}

// ============================================================
// 11. PRINT ATTENDANCE REPORT
// ============================================================

function printAttendanceReport() {
    window.print();
}

// ============================================================
// 12. INITIALIZATION
// ============================================================

function init() {
    loadAllData();

    // Default to Attendance Mode
    switchMode('attendance');

    updateAllStats();

    // Event Listeners

    // Mode switching
    document.getElementById('adminModeBtn').addEventListener('click', () => switchMode('admin'));
    document.getElementById('attendanceModeBtn').addEventListener('click', () => switchMode('attendance'));

    // Attendance Mode search
    document.getElementById('searchBtn').addEventListener('click', performSearchAttendance);
    document.getElementById('rollInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearchAttendance();
    });

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

    // Modal events
    document.getElementById('editSaveBtn').addEventListener('click', saveEditStudent);
    document.getElementById('editCancelBtn').addEventListener('click', closeEditModal);
    document.getElementById('editModal').addEventListener('click', function(e) {
        if (e.target === this) closeEditModal();
    });

    // Enter key on add form
    document.querySelectorAll('#addRollNo, #addName, #addDept, #addYear').forEach(el => {
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addStudent();
        });
    });

    // ---- New: Records events ----
    document.getElementById('recordsSearch').addEventListener('input', renderAttendanceRecords);
    document.getElementById('recordsStatusFilter').addEventListener('change', renderAttendanceRecords);
    document.getElementById('exportCsvBtn').addEventListener('click', exportAttendanceCSV);
    document.getElementById('printReportBtn').addEventListener('click', printAttendanceReport);

    console.log('✅ Event Attendance System initialized (Phase 5).');
}

document.addEventListener('DOMContentLoaded', init);