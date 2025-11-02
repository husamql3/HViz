-- Students table
CREATE TABLE students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')),
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    enrollment_date TEXT NOT NULL,
    grade_level INTEGER NOT NULL,
    status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'Graduated', 'Transferred')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Teachers table
CREATE TABLE teachers (
    teacher_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    date_of_birth TEXT,
    hire_date TEXT NOT NULL,
    department TEXT,
    qualification TEXT,
    status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'Inactive', 'On Leave')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_code TEXT UNIQUE NOT NULL,
    course_name TEXT NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    grade_level INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Classes table (specific instances of courses)
CREATE TABLE classes (
    class_id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    teacher_id INTEGER NOT NULL,
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL CHECK(semester IN ('Fall', 'Spring', 'Summer')),
    room_number TEXT,
    schedule TEXT,
    max_students INTEGER DEFAULT 30,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id)
);

-- Enrollments table (students enrolled in classes)
CREATE TABLE enrollments (
    enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    enrollment_date TEXT NOT NULL,
    status TEXT DEFAULT 'Enrolled' CHECK(status IN ('Enrolled', 'Completed', 'Dropped', 'Failed')),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    UNIQUE(student_id, class_id)
);

-- Grades table
CREATE TABLE grades (
    grade_id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER NOT NULL,
    assignment_name TEXT,
    grade_value REAL,
    max_points REAL,
    grade_date TEXT,
    grade_type TEXT CHECK(grade_type IN ('Homework', 'Quiz', 'Test', 'Project', 'Final', 'Midterm')),
    comments TEXT,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id)
);

-- Attendance table
CREATE TABLE attendance (
    attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    attendance_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Present', 'Absent', 'Late', 'Excused')),
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (class_id) REFERENCES classes(class_id),
    UNIQUE(student_id, class_id, attendance_date)
);

-- Parents/Guardians table
CREATE TABLE parents (
    parent_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    address TEXT,
    relationship TEXT NOT NULL CHECK(relationship IN ('Father', 'Mother', 'Guardian', 'Other')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Student-Parent relationship table
CREATE TABLE student_parents (
    student_id INTEGER NOT NULL,
    parent_id INTEGER NOT NULL,
    is_primary_contact INTEGER DEFAULT 0,
    PRIMARY KEY (student_id, parent_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (parent_id) REFERENCES parents(parent_id)
);

-- Departments table
CREATE TABLE departments (
    department_id INTEGER PRIMARY KEY AUTOINCREMENT,
    department_name TEXT UNIQUE NOT NULL,
    head_teacher_id INTEGER,
    description TEXT,
    FOREIGN KEY (head_teacher_id) REFERENCES teachers(teacher_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_student_name ON students(last_name, first_name);
CREATE INDEX idx_teacher_name ON teachers(last_name, first_name);
CREATE INDEX idx_enrollment_student ON enrollments(student_id);
CREATE INDEX idx_enrollment_class ON enrollments(class_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_grades_enrollment ON grades(enrollment_id);