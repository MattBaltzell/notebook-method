-- DROP TABLE IF EXISTS teachers_students;

DROP TABLE IF EXISTS teachers_students;
DROP TABLE IF EXISTS assignments_textbooks;
DROP TABLE IF EXISTS students_textbooks;
DROP TABLE IF EXISTS textbooks;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_types;

CREATE TABLE user_types(
    id SERIAL PRIMARY KEY,
    type text NOT NULL UNIQUE
);

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    user_type_id int NOT NULL REFERENCES user_types ,
    username text NOT NULL UNIQUE,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    first_name text,
    last_name text,
    avatar_url text,
    join_at timestamp without time zone NOT NULL,
    last_login_at timestamp with time zone
);

CREATE TABLE teachers(
    id SERIAL PRIMARY KEY,
    user_id int NOT NULL UNIQUE REFERENCES users ON DELETE CASCADE
);

CREATE TABLE students(
    id SERIAL PRIMARY KEY,
    user_id int NOT NULL UNIQUE REFERENCES users ON DELETE CASCADE,
    teacher_id int REFERENCES teachers ON DELETE CASCADE,
    grade text
);

CREATE TABLE subjects(
    code text PRIMARY KEY,
    grade text NOT NULL,
    title text NOT NULL,
    description text NOT NULL
);

CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    subject_id int,
    instructions text,
    assigned_to int NOT NULL REFERENCES students ON DELETE CASCADE,
    assigned_by int NOT NULL REFERENCES teachers ON DELETE CASCADE,
    date_assigned timestamp with time zone NOT NULL,
    date_due timestamp with time zone,
    date_submitted timestamp with time zone,
    date_approved timestamp with time zone,
    is_submitted boolean DEFAULT false,
    is_approved boolean DEFAULT false
);

CREATE TABLE textbooks(
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    author text NOT NULL,
    image_url text,
    subject_code text REFERENCES subjects,
    added_by int REFERENCES users
);

CREATE TABLE students_textbooks(
    student_id int NOT NULL REFERENCES students ON DELETE CASCADE,
    textbook_id int NOT NULL REFERENCES textbooks ON DELETE CASCADE,
    PRIMARY KEY(student_id, textbook_id)
);

CREATE TABLE assignments_textbooks(
    assignment_id int NOT NULL REFERENCES assignments ON DELETE CASCADE,
    textbook_id int NOT NULL REFERENCES textbooks ON DELETE CASCADE,
    PRIMARY KEY(assignment_id, textbook_id)
);

CREATE TABLE teachers_students(
    teacher_id int NOT NULL REFERENCES teachers ON DELETE CASCADE,
    student_id int NOT NULL REFERENCES students ON DELETE CASCADE,
    PRIMARY KEY(teacher_id, student_id)
);
 

