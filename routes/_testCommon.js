'use strict';

const db = require('../db.js');
const User = require('../models/user');
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const StudentAssignment = require('../models/studentAssignment');
const Assignment = require('../models/assignment');
const { createToken } = require('../helpers/tokens');

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query('DELETE FROM students_assignments');
  // noinspection SqlWithoutWhere
  await db.query('DELETE FROM assignments');
  // noinspection SqlWithoutWhere
  await db.query('DELETE FROM students');
  // noinspection SqlWithoutWhere
  await db.query('DELETE FROM teachers');
  // noinspection SqlWithoutWhere
  await db.query('DELETE FROM users');
  // noinspection SqlWithoutWhere
  await User.register({
    username: 'u1',
    firstName: 'U1F',
    lastName: 'U1L',
    email: 'user1@user.com',
    password: 'password1',
    isAdmin: false,
  });
  await User.register({
    username: 'u2',
    firstName: 'U2F',
    lastName: 'U2L',
    email: 'user2@user.com',
    password: 'password2',
    isAdmin: false,
  });
  await User.register({
    username: 'u3',
    firstName: 'U3F',
    lastName: 'U3L',
    email: 'user3@user.com',
    password: 'password3',
    isAdmin: false,
  });
  await User.register({
    username: 'u4',
    firstName: 'U4F',
    lastName: 'U4L',
    email: 'user4@user.com',
    password: 'password4',
    isAdmin: false,
  });
  await User.register({
    username: 'u5',
    firstName: 'U5F',
    lastName: 'U5L',
    email: 'user5@user.com',
    password: 'password5',
    isAdmin: false,
  });
  await User.register({
    username: 'u6',
    firstName: 'U6F',
    lastName: 'U6L',
    email: 'user6@user.com',
    password: 'password6',
    isAdmin: false,
  });

  await User.register({
    username: 'a1',
    firstName: 'A1F',
    lastName: 'A1L',
    email: 'admin1@user.com',
    password: 'password',
    isAdmin: true,
  });

  const teacher1 = await Teacher.add('u3');
  const teacher2 = await Teacher.add('u4');

  const student1 = await Student.add('u5', teacher1.teacherID, '3');
  const student2 = await Student.add('u6', teacher2.teacherID, '6');

  const assignment1 = await Assignment.create({
    title: 'assignment1',
    subjectCode: 'MATH1',
    instructions: 'do assignment 1',
    teacherID: teacher1.teacherID,
  });

  const assignment2 = await Assignment.create({
    title: 'assignment2',
    subjectCode: 'SCI1',
    instructions: 'do assignment 2',
    teacherID: teacher1.teacherID,
  });

  const assignment3 = await Assignment.create({
    title: 'assignment3',
    subjectCode: 'LANG1',
    instructions: 'do assignment 3',
    teacherID: teacher2.teacherID,
  });

  const studentAssignment1 = await StudentAssignment.assign({
    assignmentID: assignment1.id,
    studentID: student1.studentID,
    dateDue: '10/01/2022',
  });
  const studentAssignment2 = await StudentAssignment.assign({
    assignmentID: assignment2.id,
    studentID: student1.studentID,
    dateDue: '10/02/2022',
  });
  const studentAssignment3 = await StudentAssignment.assign({
    assignmentID: assignment3.id,
    studentID: student2.studentID,
    dateDue: '10/03/2022',
  });
}

async function commonBeforeEach() {
  await db.query('BEGIN');
}

async function commonAfterEach() {
  await db.query('ROLLBACK');
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({ username: 'u1', userTypeID: 1, isAdmin: false });
const u4Token = createToken({ username: 'u4', userTypeID: 2, isAdmin: false });
const a1Token = createToken({ username: 'a1', userTypeID: 1, isAdmin: true });
const t1Token = createToken({ username: 'u3', userTypeID: 2, isAdmin: false });
const t2Token = createToken({ username: 'u4', userTypeID: 2, isAdmin: false });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u4Token,
  a1Token,
  t1Token,
  t2Token,
};
