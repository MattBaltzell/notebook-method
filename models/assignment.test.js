'use strict';

const { NotFoundError } = require('../expressError');
const db = require('../db.js');
const Assignment = require('./assignment.js');
const Teacher = require('./teacher.js');
const Student = require('./student.js');

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create() */

describe('create', function () {
  test('works', async function () {
    const teacher = await Teacher.add('u2');

    const data = {
      title: 'Test Assignment 1',
      subjectCode: 'MATH1',
      instructions: 'Complete workbook pages and then wait for teacher.',
      teacherID: teacher.teacherID,
    };
    const assignment = await Assignment.create(data);

    expect(assignment).toEqual({
      id: expect.any(Number),
      title: 'Test Assignment 1',
      subjectCode: 'MATH1',
      instructions: 'Complete workbook pages and then wait for teacher.',
      teacherID: teacher.teacherID,
    });
  });
});

/************************************** getAll(teacherID) */

describe('getAll', function () {
  test('works', async function () {
    const teacher = await Teacher.add('u2');

    const assignment1 = await Assignment.create({
      title: 'Test1',
      subjectCode: 'MATH1',
      instructions: 'Testing1',
      teacherID: teacher.teacherID,
    });
    const assignment2 = await Assignment.create({
      title: 'Test2',
      subjectCode: 'LANG1',
      instructions: 'Testing2',
      teacherID: teacher.teacherID,
    });

    const assignments = await Assignment.getAll(teacher.teacherID);
    expect(assignments).toEqual([
      {
        id: expect.any(Number),
        instructions: 'Testing1',
        subjectCode: 'MATH1',
        teacherID: teacher.teacherID,
        title: 'Test1',
      },
      {
        id: expect.any(Number),
        instructions: 'Testing2',
        subjectCode: 'LANG1',
        title: 'Test2',
        teacherID: teacher.teacherID,
      },
    ]);
  });
});

/************************************** get(id) */

describe('get', function () {
  test('works', async function () {
    const teacher = await Teacher.add('u2');

    const assignment1 = await Assignment.create({
      title: 'Test1',
      subjectCode: 'MATH1',
      instructions: 'Testing1',
      teacherID: teacher.teacherID,
    });
    const assignment2 = await Assignment.create({
      title: 'Test2',
      subjectCode: 'LANG1',
      instructions: 'Testing2',
      teacherID: teacher.teacherID,
    });

    const assignment = await Assignment.get(assignment2.id);
    expect(assignment).toEqual({
      id: assignment2.id,
      instructions: 'Testing2',
      subjectCode: 'LANG1',
      title: 'Test2',
      teacherID: teacher.teacherID,
    });
  });
});

/****************************] getAllStudentAssignments() */

describe('getAllStudentAssignments', function () {
  test('works', async function () {
    const teacher = await Teacher.add('u2');
    const student1 = await Student.add('u1', teacher.teacherID, '6');
    const student2 = await Student.add('u3', teacher.teacherID, '6');

    const assignment1 = await Assignment.create({
      title: 'Test1',
      subjectCode: 'MATH1',
      instructions: 'Testing1',
      teacherID: teacher.teacherID,
    });

    await Assignment.assign({
      assignmentID: assignment1.id,
      studentID: student1.studentID,
      dateDue: '08/20/2022',
    });
    await Assignment.assign({
      assignmentID: assignment1.id,
      studentID: student2.studentID,
      dateDue: '08/20/2022',
    });

    const studentAssignments = await Assignment.getAllStudentAssignments();
    expect(studentAssignments).toEqual({});
    // need to fill out the above expect statement to pass test
  });
});

/************************************** toggleSubmit() */

describe('toggleSubmit', function () {
  test('works', async function () {
    const teacher = await Teacher.add('u2');
    const student = await Student.add('u1', teacher.teacherID, '3');

    const assignment = await Assignment.create({
      title: 'Test Assignment 1',
      subjectCode: 'MATH1',
      instructions: 'Complete workbook pages and then wait for teacher.',
      teacherID: teacher.teacherID,
    });

    const studentAssignment = await Assignment.assign({
      assignmentID: assignment.id,
      studentID: student.studentID,
      dateDue: '08/20/2022',
    });

    // test submission
    const subResp = await Assignment.toggleSubmit(studentAssignment.id);
    expect(subResp).toEqual({ id: studentAssignment.id, isSubmitted: true });
    // test unsubmission
    const unSubResp = await Assignment.toggleSubmit(studentAssignment.id);
    expect(unSubResp).toEqual({ id: studentAssignment.id, isSubmitted: false });
  });

  test('notfounderror when invalid assignment id given', async function () {
    try {
      await Assignment.toggleSubmit(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
