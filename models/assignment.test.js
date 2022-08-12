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

/************************************** toggleSubmit() */
//Need to update toggleSubmit method to make these tests run properly

// describe('toggleSubmit', function () {
//   test('works', async function () {
//     const teacher = await Teacher.add('u2');
//     const student = await Student.add('u1', teacher.teacherID, '3');

//     const data = {
//       title: 'Test Assignment 1',
//       subjectCode: 'MATH1',
//       instructions: 'Complete workbook pages and then wait for teacher.',
//       studentID: student.studentID,
//       teacherID: teacher.teacherID,
//       dateDue: '08/23/2022',
//     };
//     const assignment = await Assignment.create(data);
//     // test submission
//     const subResp = await Assignment.toggleSubmit(assignment.id);
//     expect(subResp).toEqual({ id: assignment.id, isSubmitted: true });
//     // test unsubmission
//     const unSubResp = await Assignment.toggleSubmit(assignment.id);
//     expect(unSubResp).toEqual({ id: assignment.id, isSubmitted: false });
//   });

//   test('notfounderror when invalid assignment id given', async function () {
//     try {
//       await Assignment.toggleSubmit(0);
//       fail();
//     } catch (err) {
//       expect(err instanceof NotFoundError).toBeTruthy();
//     }
//   });
// });
