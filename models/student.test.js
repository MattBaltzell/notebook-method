'use strict';

const { NotFoundError } = require('../expressError');
const db = require('../db.js');
const Student = require('./student.js');
const Teacher = require('./teacher.js');
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

/************************************** getAll() */

describe('getAll', function () {
  test('works', async function () {
    const teacher = await Teacher.add('u2');
    await Student.add('u1', teacher.teacherID, '3');
    const students = await Student.getAll(teacher.teacherID);
    expect(students).toEqual([
      {
        userID: expect.any(Number),
        studentID: expect.any(Number),
        username: 'u1',
        firstName: 'U1F',
        lastName: 'U1L',
        email: 'u1@email.com',
        userTypeID: 3,
        grade: '3',
      },
    ]);
  });
});

/************************************** get() */

describe('get', function () {
  test('works', async function () {
    const teacher = await Teacher.add('u2');
    await Student.add('u1', teacher.teacherID, '3');
    const student = await Student.get('u1');
    expect(student).toEqual({
      userID: expect.any(Number),
      studentID: expect.any(Number),
      username: 'u1',
      firstName: 'U1F',
      lastName: 'U1L',
      email: 'u1@email.com',
      userTypeID: 3,
      grade: '3',
      teacherID: expect.any(Number),
      avatarURL: null,
      joinAt: expect.any(Date),
      lastLoginAt: null,
    });
  });

  test('notfounderror if student with given username is not found', async function () {
    try {
      await Student.get('imposter');
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** add() */

describe('add', function () {
  test('works', async function () {
    const teacher = await Teacher.add('u2');
    const newStudent = await Student.add('u1', teacher.teacherID, '3');
    expect(newStudent).toEqual({
      userID: expect.any(Number),
      studentID: expect.any(Number),
      grade: '3',
      teacherID: expect.any(Number),
    });
    const found = await db.query(
      `SELECT
            u.id AS "userID",
            s.id AS "studentID",
            u.username,
            u.user_type_id AS "userTypeID"
        FROM users AS u
        JOIN students AS s
            ON u.id = s.user_id
        WHERE username='u1'`
    );
    const student = found.rows[0];
    expect(student.userID).toEqual(expect.any(Number));
    expect(student.studentID).toEqual(expect.any(Number));
    expect(student.username).toEqual('u1');
    expect(student.userTypeID).toEqual(3);
  });

  test('notfounderror if username doesnt exist', async function () {
    try {
      const teacher = await Teacher.add('u2');
      await Student.add('imposter', teacher.teacherID, '3');
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toEqual(`No user: imposter`);
    }
  });

  test('notfounderror if teacherID doesnt exist', async function () {
    try {
      await Student.add('u1', 0, '3');
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.message).toEqual(`No teacher with id: 0`);
    }
  });
});

/************************************** update() */

describe('update', function () {
  test('works', async function () {
    const teacher1 = await Teacher.add('u2');
    const teacher2 = await Teacher.add('u3');
    const newStudent = await Student.add('u1', teacher1.teacherID, '3');

    await Student.update('u1', {
      grade: '4',
      teacherID: teacher2.teacherID,
    });

    const result = await db.query('SELECT * FROM students WHERE user_ID=$1', [
      newStudent.userID,
    ]);
    const student = result.rows[0];

    expect(result.rows.length).toEqual(1);
    expect(student.grade).toEqual('4');
    expect(student.teacher_id).toEqual(teacher2.teacherID);
  });

  test('not found if no such user', async function () {
    const teacher1 = await Teacher.add('u2');
    try {
      await Student.update('imposter', {
        grade: '4',
        teacherID: teacher1.teacherID,
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test('not found if no such teacherID', async function () {
    try {
      await Student.update('u1', {
        grade: '4',
        teacherID: 0,
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** delete() */

describe('delete', function () {
  test('works', async function () {
    // Create student to delete
    const teacher = await Teacher.add('u2');
    await Student.add('u1', teacher.teacherID, '3');
    // Delete the student
    const deletedStudent = await Student.delete('u1');
    expect(deletedStudent).toEqual({
      userID: expect.any(Number),
    });
    // Make sure u1 user is no longer a student
    const userRes = await db.query(
      `SELECT
            id,
            username,
            user_type_id AS "userTypeID"
        FROM users
        WHERE username='u1'`
    );
    const user1 = userRes.rows[0];
    const result = await db.query(`SELECT * FROM students WHERE user_id=$1`, [
      user1.id,
    ]);
    expect(user1.userTypeID).toEqual(1);
    expect(result.rows.length).toEqual(0);
  });

  test('notfounderror if username doesnt exist', async function () {
    try {
      await Student.delete('imposter');
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
