# 📋 Event Attendance System

A simple and efficient **Event Attendance Management System** built using **HTML, CSS, and JavaScript**.

The application is designed to make attendance management easier during college events, workshops, seminars, technical events, and other programs. It allows organizers to create events, manage registered students, mark attendance, view attendance statistics, and export records.

The current version works as a **client-side web application** and stores its data locally in the browser using `localStorage`. Therefore, no backend or database is required for the current prototype.

---

## 🚀 Project Overview

Managing attendance manually during an event can be time-consuming and can lead to errors, especially when there are many students.

This project provides a digital solution where an event organizer can:

* Create and manage multiple events
* Register students for individual events
* Search students using their roll number
* Mark attendance quickly
* Record attendance time
* View attendance statistics
* Import student information using CSV
* Export attendance data
* Switch between Admin Mode and Attendance Mode
* Use Light Mode or Dark Mode
* Store event data locally in the browser

The main goal is to provide a **simple, fast, and easy-to-use attendance system for event operators**.

---

## ✨ Features

### 📅 1. Event Management

The system allows the administrator to create and manage multiple events.

Each event can contain:

* Event name
* Venue
* Event date
* Start time
* End time
* Organizer
* Event description

### Event Management Capabilities

* Create multiple events
* Switch between existing events
* Manage students separately for each event
* Prevent duplicate event names
* Store event information locally
* Maintain attendance records independently for each event

This makes the system suitable when the same application is used for multiple college events.

---

## 👨‍🎓 2. Student Management

Students can be registered for an individual event.

Each student record contains:

| Field      | Description                                      |
| ---------- | ------------------------------------------------ |
| Roll No    | Unique identification/roll number of the student |
| Name       | Student's full name                              |
| Department | Student's department                             |
| Year       | Academic year                                    |

### Student Management Features

* Add new students
* Edit existing student details
* Delete students
* View registered students
* Maintain separate student lists for different events
* Prevent duplicate student entries where applicable

This allows the administrator to prepare the registered student list before attendance begins.

---

## ✅ 3. Attendance System

The Attendance Mode is designed for the person who is actually taking attendance during an event.

The operator can:

1. Enter or search for a student's roll number.
2. Find the registered student.
3. Mark the student as present.
4. Record the attendance time.
5. Immediately see the updated attendance status.

The system is designed to keep the attendance process quick so that operators do not need to navigate through unnecessary administrative controls.

### Attendance Information

For each student, the system can maintain:

* Student details
* Attendance status
* Attendance time

---

## 📊 4. Attendance Records & Statistics

The system provides attendance information for the selected event.

The administrator can view:

* Total registered students
* Number of present students
* Number of absent students
* Attendance status
* Attendance time
* Registered student information

The statistics update when attendance is marked, allowing the organizer to quickly understand the current attendance situation.

---

## 📥 5. Import Students Using CSV

The application supports importing registered student information from a **CSV (Comma-Separated Values)** file.

This is useful when the student list is already available in spreadsheet form and manually entering every student would take too much time.

### Expected CSV Format

The CSV file should contain these columns:

```csv
Roll No,Name,Department,Year
101,Piyush,EXTC,1
102,Rahul,CSE,1
103,Aditya,IT,1
```

### Column Requirements

| Column     | Example |
| ---------- | ------- |
| Roll No    | 101     |
| Name       | Piyush  |
| Department | EXTC    |
| Year       | 1       |

The imported students can then be used in the attendance system.

### Excel and CSV

CSV files can be created or edited using applications such as:

* Microsoft Excel
* Google Sheets
* LibreOffice Calc
* Other spreadsheet applications
* Text editors such as Notepad

A spreadsheet containing student information can be saved/exported as CSV and then imported into the application.

---

## 📤 6. Export Attendance Data

The system can export student and attendance information as a **CSV file**.

The exported data can be opened using:

* Microsoft Excel
* Google Sheets
* LibreOffice Calc
* Other spreadsheet applications

This provides a convenient way to maintain attendance records after an event.

### Benefits

* Easy record keeping
* Easy sharing
* Easy spreadsheet analysis
* Useful for event documentation
* Creates a backup outside the browser

---

## 🔄 7. Admin Mode & Attendance Mode

The application provides two different operating modes.

### 👨‍💼 Admin Mode

Admin Mode is used for managing the event and student information.

It provides access to functions such as:

* Event management
* Student management
* Student import
* Attendance records
* Statistics
* Data management

### ✅ Attendance Mode

Attendance Mode is intended for the event operator.

It focuses mainly on:

* Searching students
* Entering roll numbers
* Marking attendance
* Viewing attendance status

Administrative tables and unnecessary controls are kept out of the way during attendance operation.

This separation helps make the interface cleaner during a live event.

---

## 🌙 8. Light & Dark Mode

The website supports two visual themes:

* ☀️ Light Mode
* 🌙 Dark Mode

The selected theme is saved so that the user's preference can remain available when the website is reopened in the same browser.

This improves usability in different lighting conditions.

---

## 💾 9. Local Data Storage

The current prototype uses the browser's **`localStorage`** for storing application data.

This means the application can store information such as:

* Events
* Student records
* Attendance status
* Attendance time
* Theme preference

### Advantages

* No backend required
* No database setup required
* Simple to run
* Works locally
* Suitable for a prototype or demonstration

### Important Limitation

Because the current version uses browser `localStorage`, the data is associated with the browser/device being used.

For example, data entered on one computer will not automatically appear on another computer.

A future version can use a cloud database/backend to allow multiple devices and users to share the same event data.

---

## 📱 10. Responsive Interface

The website is designed to work across different screen sizes.

It can be used on:

* 💻 Desktop computers
* 💻 Laptops
* 📱 Mobile devices

The exact mobile experience depends on the screen size and the responsive CSS implementation.

---

## 👤 11. Author Credit

The website includes an author credit:

**Made by Piyush Parshuram Sarnekar**

The project also includes a link to the author's GitHub profile.

---

# 🛠️ Technologies Used

The project is built using basic web technologies:

### HTML

Used to create the structure of the application, including:

* Forms
* Buttons
* Tables
* Input fields
* Navigation/interface elements
* Student and attendance sections

### CSS

Used for:

* Website layout
* Styling
* Responsive design
* Light/Dark themes
* Buttons and cards
* Tables
* User interface elements

### JavaScript

Used to implement the application's functionality, including:

* Event management
* Student management
* Attendance operations
* Searching students
* Statistics
* CSV import/export
* Local storage
* Theme switching
* Admin/Attendance modes

---

# 📂 Project Structure

The project follows a simple frontend structure:

```text
Attendence-system-project/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

> The exact files may change as the project is developed further.

---

# ⚙️ How to Run the Project

There is no complicated installation process required for the current version.

## Method 1 — Open Directly

1. Download or clone the repository.
2. Open the project folder.
3. Double-click `index.html`.
4. The website will open in your browser.

---

## Method 2 — Using VS Code Live Server

For development, you can use **Visual Studio Code**.

1. Clone or download the repository.
2. Open the project folder in VS Code.
3. Open `index.html`.
4. Start it using the **Live Server** extension.
5. The website will open in your default browser.

---

# 🔗 GitHub Repository

The complete project source code is available on GitHub:

**PiyushDigital / Attendence-system-project**

---

# 🧑‍💻 Basic Working Flow

The application can be used with the following workflow:

```text
Create Event
     ↓
Add / Import Students
     ↓
Select Event
     ↓
Open Attendance Mode
     ↓
Search Student by Roll No.
     ↓
Mark Attendance
     ↓
Attendance Time Recorded
     ↓
View Statistics & Records
     ↓
Export Attendance Data
```

---

# 📋 Example Use Case

Suppose a college organizes a technical workshop.

The organizer can create an event such as:

```text
Event Name: IoT Workshop
Venue: Seminar Hall
Date: 10 September 2026
Organizer: Technical Club
```

The organizer can then add students manually or import a CSV file containing the registered student list.

During the workshop, the attendance operator switches to **Attendance Mode**.

When a student arrives:

```text
Enter Roll No.
      ↓
Find Student
      ↓
Mark Present
      ↓
Attendance Time Recorded
```

The administrator can later view the attendance statistics and export the records as a CSV file.

---

# 📥 Sample Student CSV

A sample CSV file for importing students can look like this:

```csv
Roll No,Name,Department,Year
101,Piyush,EXTC,1
102,Rahul,CSE,1
103,Aditya,IT,1
104,Akash,Mechanical,1
105,Neha,Civil,1
```

Make sure the column names and data format match what the application expects.

---

# 🔐 Current System Limitations

The current version is a **frontend/local prototype**, so it has some limitations:

* Data is stored only in browser `localStorage`.
* There is currently no online database.
* Data is not automatically synchronized between multiple devices.
* There is no user authentication/login system.
* The current CSV import focuses on student data.
* Clearing browser storage can remove locally stored application data.

These limitations can be addressed in future versions.

---

# 🔮 Future Improvements

The project can be extended with several features in the future.

### ☁️ Cloud Database

Integrate a backend/database such as Supabase or another cloud database so that event and attendance data can be stored online.

### 👥 Multi-User Access

Allow multiple authorized event operators or administrators to use the same event system.

### 🔐 Authentication

Add administrator/operator login and access control.

### 📱 QR Code Attendance

Students could scan a QR code or use a unique event identifier to make attendance faster.

### 📈 Advanced Reports

Add:

* Attendance percentage
* Department-wise statistics
* Year-wise statistics
* Event-wise reports
* Graphs and charts

### 📊 Excel Support

Expand the import system to support `.xlsx` Excel files directly.

### ☁️ Online Backup

Automatically back up attendance records to cloud storage.

---

# 🎯 Project Goals

The main goals of this project are:

* Reduce manual attendance work
* Make event attendance faster
* Reduce data-entry errors
* Organize student information
* Provide quick attendance statistics
* Make attendance records easy to export
* Provide a simple interface for event operators
* Create a foundation for a future cloud-based attendance system

---

# 📌 Current Project Status

**Status: Working Prototype 🚀**

The core frontend functionality has been implemented using:

* HTML
* CSS
* JavaScript
* Browser Local Storage

The project is currently suitable for **local testing, demonstrations, and event-attendance use on a single browser/device**.

Future versions can introduce a backend and cloud database for multi-device access and centralized data management.

---

# 🤝 Contributing

Contributions and suggestions are welcome.

If you want to improve the project:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Test the application.
5. Commit your changes.
6. Open a Pull Request.

---

# 📄 License

This project is currently available as an educational/project prototype.

If a formal open-source license is added later, the licensing information can be updated here.

---

## 👨‍💻 Author

**Piyush Parshuram Sarnekar**

Built as a web-based **Event Attendance Management System** using HTML, CSS and JavaScript.

⭐ If you find this project useful, consider giving the repository a star on GitHub!
