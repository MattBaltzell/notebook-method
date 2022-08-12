-- DROP TABLE IF EXISTS teachers_students;

DROP TABLE IF EXISTS teachers_students;
DROP TABLE IF EXISTS assignments_textbooks;
DROP TABLE IF EXISTS students_textbooks;
DROP TABLE IF EXISTS textbooks;
DROP TABLE IF EXISTS students_assignments;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_types;

CREATE TABLE user_types(
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL UNIQUE
);

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    user_type_id INTEGER NOT NULL 
        REFERENCES user_types ,
    username VARCHAR(25) NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE
        CHECK (position('@' IN email) > 1),
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    join_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE teachers(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE 
        REFERENCES users ON DELETE CASCADE
);

CREATE TABLE students(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE 
        REFERENCES users ON DELETE CASCADE,
    teacher_id INTEGER 
        REFERENCES teachers ON DELETE CASCADE,
    grade VARCHAR(3)
);

CREATE TABLE subjects(
    code VARCHAR(10) PRIMARY KEY,
    grade TEXT NOT NULL,
    title VARCHAR(25) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    subject_code VARCHAR(10) 
        REFERENCES subjects,
    instructions TEXT,
    teacher_id INTEGER NOT NULL 
        REFERENCES teachers ON DELETE CASCADE
);

CREATE TABLE students_assignments (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER NOT NULL 
        REFERENCES assignments ON DELETE CASCADE,
    student_id INTEGER NOT NULL 
        REFERENCES students ON DELETE CASCADE,
    date_assigned TIMESTAMP WITH TIME ZONE NOT NULL,
    date_due TIMESTAMP WITH TIME ZONE,
    date_submitted TIMESTAMP WITH TIME ZONE,
    date_approved TIMESTAMP WITH TIME ZONE,
    is_submitted BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false
);

CREATE TABLE textbooks(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author TEXT NOT NULL,
    image_url TEXT,
    subject_code VARCHAR(10) 
        REFERENCES subjects,
    added_by INTEGER 
        REFERENCES users
);

CREATE TABLE students_textbooks(
    student_id INTEGER NOT NULL 
        REFERENCES students ON DELETE CASCADE,
    textbook_id INTEGER NOT NULL 
        REFERENCES textbooks ON DELETE CASCADE,
    PRIMARY KEY(student_id, textbook_id)
);

CREATE TABLE assignments_textbooks(
    assignment_id INTEGER NOT NULL 
        REFERENCES assignments ON DELETE CASCADE,
    textbook_id INTEGER NOT NULL 
        REFERENCES textbooks ON DELETE CASCADE,
    PRIMARY KEY(assignment_id, textbook_id)
);

CREATE TABLE teachers_students(
    teacher_id INTEGER NOT NULL 
    
        REFERENCES teachers ON DELETE CASCADE,
    student_id INTEGER NOT NULL 
        REFERENCES students ON DELETE CASCADE,
    PRIMARY KEY(teacher_id, student_id)
);
 

