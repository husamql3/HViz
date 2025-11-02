-- Create custom ENUM types
CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE student_status AS ENUM ('Active', 'Inactive', 'Graduated', 'Transferred');
CREATE TYPE teacher_status AS ENUM ('Active', 'Inactive', 'On Leave');
CREATE TYPE semester_type AS ENUM ('Fall', 'Spring', 'Summer');
CREATE TYPE enrollment_status AS ENUM ('Enrolled', 'Completed', 'Dropped', 'Failed');
CREATE TYPE grade_type AS ENUM ('Homework', 'Quiz', 'Test', 'Project', 'Final', 'Midterm');
CREATE TYPE attendance_status AS ENUM ('Present', 'Absent', 'Late', 'Excused');
CREATE TYPE relationship_type AS ENUM ('Father', 'Mother', 'Guardian', 'Other');

-- Students table
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender_type,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  enrollment_date DATE NOT NULL,
  grade_level INTEGER NOT NULL,
  status student_status DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teachers table
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  hire_date DATE NOT NULL,
  department VARCHAR(50),
  qualification VARCHAR(100),
  salary NUMERIC(10, 2),
  status teacher_status DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  department_name VARCHAR(50) UNIQUE NOT NULL,
  head_teacher_id INTEGER,
  description TEXT,
  budget NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (head_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);

-- Courses table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  grade_level INTEGER NOT NULL,
  department_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Classes table (specific instances of courses)
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL,
  teacher_id INTEGER NOT NULL,
  academic_year VARCHAR(9) NOT NULL,
  semester semester_type NOT NULL,
  room_number VARCHAR(20),
  schedule VARCHAR(100),
  max_students INTEGER DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE RESTRICT
);

-- Enrollments table (students enrolled in classes)
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  enrollment_date DATE NOT NULL,
  status enrollment_status DEFAULT 'Enrolled',
  final_grade VARCHAR(2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT unique_enrollment UNIQUE (student_id, class_id)
);

-- Grades table
CREATE TABLE grades (
  id SERIAL PRIMARY KEY,
  enrollment_id INTEGER NOT NULL,
  assignment_name VARCHAR(100),
  grade_value NUMERIC(5,2),
  max_points NUMERIC(5,2),
  grade_date DATE,
  grade_type grade_type,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

-- Attendance table
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL,
  class_id INTEGER NOT NULL,
  attendance_date DATE NOT NULL,
  status attendance_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT unique_attendance UNIQUE (student_id, class_id, attendance_date)
);

-- Parents/Guardians table
CREATE TABLE parents (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  relationship relationship_type NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student-Parent relationship table
CREATE TABLE student_parents (
  student_id INTEGER NOT NULL,
  parent_id INTEGER NOT NULL,
  is_primary_contact BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, parent_id),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
);

-- Assignments table
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  max_points NUMERIC(5,2) NOT NULL,
  assignment_type grade_type,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- Student submissions table
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  content TEXT,
  file_path VARCHAR(500),
  grade NUMERIC(5,2),
  feedback TEXT,
  graded_at TIMESTAMP,
  graded_by INTEGER,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (graded_by) REFERENCES teachers(id) ON DELETE SET NULL,
  CONSTRAINT unique_submission UNIQUE (assignment_id, student_id)
);

-- Events/Calendar table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(100),
  event_type VARCHAR(50),
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES teachers(id) ON DELETE SET NULL
);

-- Announcements table
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  target_audience VARCHAR(50),
  published_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES teachers(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_student_name ON students(last_name, first_name);
CREATE INDEX idx_student_status ON students(status);
CREATE INDEX idx_student_grade ON students(grade_level);
CREATE INDEX idx_teacher_name ON teachers(last_name, first_name);
CREATE INDEX idx_teacher_department ON teachers(department);
CREATE INDEX idx_enrollment_student ON enrollments(student_id);
CREATE INDEX idx_enrollment_class ON enrollments(class_id);
CREATE INDEX idx_enrollment_status ON enrollments(status);
CREATE INDEX idx_grades_enrollment ON grades(enrollment_id);
CREATE INDEX idx_grades_date ON grades(grade_date);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_course ON classes(course_id);
CREATE INDEX idx_classes_semester ON classes(semester);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_events_date ON events(event_date);

-- Create views for common queries
CREATE VIEW student_details AS
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  s.email,
  s.phone,
  s.grade_level,
  s.status,
  s.enrollment_date,
  COUNT(DISTINCT e.id) as enrolled_classes,
  AVG(g.grade_value) as average_grade
FROM students s
LEFT JOIN enrollments e ON s.id = e.student_id
LEFT JOIN grades g ON e.id = g.enrollment_id
GROUP BY s.id;

CREATE VIEW teacher_workload AS
SELECT 
  t.id,
  t.first_name,
  t.last_name,
  t.email,
  t.department,
  COUNT(DISTINCT c.id) as total_classes,
  COUNT(DISTINCT e.student_id) as total_students
FROM teachers t
LEFT JOIN classes c ON t.id = c.teacher_id
LEFT JOIN enrollments e ON c.id = e.class_id
GROUP BY t.id;

CREATE VIEW class_roster AS
SELECT 
  c.id as class_id,
  co.course_name,
  co.course_code,
  c.semester,
  c.academic_year,
  c.room_number,
  t.first_name || ' ' || t.last_name as teacher_name,
  COUNT(e.student_id) as enrolled_students,
  c.max_students
FROM classes c
JOIN courses co ON c.course_id = co.id
JOIN teachers t ON c.teacher_id = t.id
LEFT JOIN enrollments e ON c.id = e.class_id AND e.status = 'Enrolled'
GROUP BY c.id, co.course_name, co.course_code, c.semester, c.academic_year, 
         c.room_number, t.first_name, t.last_name, c.max_students;

-- Add comments to tables for documentation
COMMENT ON TABLE students IS 'Contains student information and enrollment details';
COMMENT ON TABLE teachers IS 'Contains teacher information and employment details';
COMMENT ON TABLE courses IS 'Course catalog with course descriptions and requirements';
COMMENT ON TABLE classes IS 'Specific instances of courses taught in a semester';
COMMENT ON TABLE enrollments IS 'Links students to classes they are enrolled in';
COMMENT ON TABLE grades IS 'Individual assignment and test grades';
COMMENT ON TABLE attendance IS 'Daily attendance records for students';
COMMENT ON TABLE parents IS 'Parent and guardian contact information';
COMMENT ON TABLE departments IS 'School departments and their administrators';
COMMENT ON TABLE assignments IS 'Class assignments and their details';
COMMENT ON TABLE submissions IS 'Student assignment submissions and grades';

-- Add CHECK constraints
ALTER TABLE students ADD CONSTRAINT chk_grade_level CHECK (grade_level BETWEEN 1 AND 12);
ALTER TABLE courses ADD CONSTRAINT chk_credits CHECK (credits > 0);
ALTER TABLE classes ADD CONSTRAINT chk_max_students CHECK (max_students > 0);
ALTER TABLE grades ADD CONSTRAINT chk_grade_value CHECK (grade_value >= 0 AND grade_value <= max_points);
ALTER TABLE teachers ADD CONSTRAINT chk_salary CHECK (salary > 0 OR salary IS NULL);
ALTER TABLE assignments ADD CONSTRAINT chk_max_points CHECK (max_points > 0);