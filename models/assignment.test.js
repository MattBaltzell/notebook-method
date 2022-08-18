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

/************************************** getAllForTeacher(teacherID) */

describe('getAllForTeacher', function () {
  test('works', async function () {
    const teacher = await Teacher.get('u4');

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

    const assignments = await Assignment.getAllForTeacher(teacher.username);

    expect(assignments).toEqual([
      {
        id: expect.any(Number),
        instructions: 'Instructions for Assignment 1',
        subjectCode: 'HIST1',
        teacherID: teacher.teacherID,
        title: 'Assignment1',
      },
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

/************************************** update() */

describe('update', function () {
  const updateData = {
    title: 'Updated Assignment 1',
    subjectCode: 'SCI3',
    instructions: 'Updated instructions',
  };

  test('works', async function () {
    const assignmentRes = await db.query(
      `SELECT id FROM assignments WHERE title='Assignment1'`
    );
    const assignment1 = assignmentRes.rows[0];
    const assignment = await Assignment.update(assignment1.id, updateData);

    expect(assignment).toEqual({
      ...updateData,
      id: expect.any(Number),
      teacherID: expect.any(Number),
    });
  });

  test('not found if no such assignment', async function () {
    try {
      await Assignment.update(0, { subjectCode: 'MATH1' });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toEqual('No assignment: 0');
    }
  });

  test('not found if no such subjectCode', async function () {
    try {
      const assignmentRes = await db.query(
        `SELECT id FROM assignments WHERE title='Assignment1'`
      );
      const assignment1 = assignmentRes.rows[0];
      await Assignment.update(assignment1.id, {
        subjectCode: 'FakeSubj',
      });

      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toEqual(`No subject code: FakeSubj`);
    }
  });

  test('bad request if no data', async function () {
    expect.assertions(1);
    try {
      const assignmentRes = await db.query(
        `SELECT id FROM assignments WHERE title='Assignment1'`
      );
      const assignment1 = assignmentRes.rows[0];
      await Assignment.update(assignment1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** delete() */

describe('delete', function () {
  test('works', async function () {
    const assignmentRes = await db.query(
      `SELECT id FROM assignments WHERE title='Assignment1'`
    );
    const deleted = await Assignment.delete(assignmentRes.rows[0].id);
    expect(deleted).toEqual({ deleted: assignmentRes.rows[0].id });
    const result = await db.query(
      `SELECT id FROM assignments WHERE title='Assignment1'`
    );
    expect(result.rows.length).toEqual(0);
  });

  test('not found if no such assignment', async function () {
    try {
      await Assignment.delete(0);
      fail();
    } catch (err) {
      expect(err.message).toEqual(`No assignment: 0`);
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
