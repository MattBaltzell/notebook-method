'use strict';

const { NotFoundError, BadRequestError } = require('../expressError');
const db = require('../db.js');
const Assignment = require('./assignment.js');
const StudentAssignment = require('./studentAssignment.js');
const Teacher = require('./teacher.js');
const Student = require('./student.js');
const User = require('./user.js');

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

/************************************** assign() */

describe('assign', function () {
  test('works', async function () {
    const student = await Student.get('u5');
    const assignmentRes = await db.query(
      `SELECT id FROM assignments WHERE title='Assignment1'`
    );
    const data = {
      assignmentID: assignmentRes.rows[0].id,
      studentID: student.studentID,
      dateDue: '10/13/2022',
    };

    const studentAssignment = await StudentAssignment.assign(data);

    expect(studentAssignment).toEqual({
      id: expect.any(Number),
      assignmentID: assignmentRes.rows[0].id,
      studentID: student.studentID,
      dateDue: new Date('10/13/2022'),
      dateAssigned: expect.any(Date),
    });
  });

  test('not found if no such assignment', async function () {
    try {
      const student = await Student.get('u5');

      await StudentAssignment.assign({
        assignmentID: 0,
        studentID: student.studentID,
        dateDue: '10/13/2022',
      });
      fail();
    } catch (err) {
      expect(err.message).toEqual('No assignment with id: 0');
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test('not found if no such student', async function () {
    try {
      const assignmentRes = await db.query(
        `SELECT id FROM assignments WHERE title='Assignment1'`
      );
      const assignment = assignmentRes.rows[0];

      await StudentAssignment.assign({
        assignmentID: assignment.id,
        studentID: 0,
        dateDue: '10/13/2022',
      });
      fail();
    } catch (err) {
      expect(err.message).toEqual('No student with id: 0');
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*******************************getAllForAssignment(id) */
describe('getAllForAssignment', function () {
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

    await StudentAssignment.assign({
      assignmentID: assignment1.id,
      studentID: student1.studentID,
      dateDue: '08/20/2022',
    });
    await StudentAssignment.assign({
      assignmentID: assignment1.id,
      studentID: student2.studentID,
      dateDue: '08/22/2022',
    });

    const studentAssignments = await StudentAssignment.getAllForAssignment(
      assignment1.id
    );
    expect(studentAssignments).toEqual([
      {
        id: expect.any(Number),
        assignmentID: expect.any(Number),
        studentID: student1.studentID,
        dateAssigned: expect.any(Date),
        dateDue: new Date('08/20/2022'),
        dateSubmitted: null,
        dateApproved: null,
        isSubmitted: false,
        isApproved: false,
      },
      {
        id: expect.any(Number),
        assignmentID: expect.any(Number),
        studentID: student2.studentID,
        dateAssigned: expect.any(Date),
        dateDue: new Date('08/22/2022'),
        dateSubmitted: null,
        dateApproved: null,
        isSubmitted: false,
        isApproved: false,
      },
    ]);
  });
});

/***************************** getAllForStudent(username) */

describe('getAllForStudent', function () {
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

    await StudentAssignment.assign({
      assignmentID: assignment1.id,
      studentID: student1.studentID,
      dateDue: '08/20/2022',
    });
    await StudentAssignment.assign({
      assignmentID: assignment1.id,
      studentID: student2.studentID,
      dateDue: '08/22/2022',
    });

    const studentAssignments = await StudentAssignment.getAllForStudent('u1');
    expect(studentAssignments).toEqual([
      {
        id: expect.any(Number),
        assignmentID: expect.any(Number),
        studentID: student1.studentID,
        dateAssigned: expect.any(Date),
        dateDue: new Date('08/20/2022'),
        dateSubmitted: null,
        dateApproved: null,
        isSubmitted: false,
        isApproved: false,
      },
    ]);
  });
});
