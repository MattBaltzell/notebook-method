'use strict';

const { NotFoundError } = require('../expressError');
const db = require('../db.js');
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
    await Teacher.add('u1');
    const teachers = await Teacher.getAll();
    expect(teachers).toEqual([
      {
        userID: expect.any(Number),
        teacherID: expect.any(Number),
        username: 'u4',
        firstName: 'U4F',
        lastName: 'U4L',
        email: 'u4@email.com',
        userTypeID: 2,
      },
      {
        userID: expect.any(Number),
        teacherID: expect.any(Number),
        username: 'u1',
        firstName: 'U1F',
        lastName: 'U1L',
        email: 'u1@email.com',
        userTypeID: 2,
      },
    ]);
  });
});

/************************************** get() */

describe('get', function () {
  test('works', async function () {
    await Teacher.add('u1');
    const teacher = await Teacher.get('u1');
    expect(teacher).toEqual({
      userID: expect.any(Number),
      teacherID: expect.any(Number),
      username: 'u1',
      firstName: 'U1F',
      lastName: 'U1L',
      email: 'u1@email.com',
      userTypeID: 2,
      avatarURL: null,
      joinAt: expect.any(Date),
      lastLoginAt: null,
    });
  });

  test('notfounderror if teacher with given username is not found', async function () {
    try {
      await Teacher.get('u2');
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** add() */

describe('add', function () {
  test('works', async function () {
    const newTeacher = await Teacher.add('u1');
    expect(newTeacher).toEqual({
      userID: expect.any(Number),
      teacherID: expect.any(Number),
    });
    const found = await db.query(
      `SELECT
            u.id AS "userID",
            t.id AS "teacherID",
            u.username,
            u.user_type_id AS "userTypeID"
        FROM users AS u
        JOIN teachers AS t
            ON u.id = t.user_id
        WHERE username='u1'`
    );
    const teacher = found.rows[0];
    expect(teacher.userID).toEqual(expect.any(Number));
    expect(teacher.teacherID).toEqual(expect.any(Number));
    expect(teacher.username).toEqual('u1');
    expect(teacher.userTypeID).toEqual(2);
  });

  test('notfounderror if username doesnt exist', async function () {
    try {
      await Teacher.add('imposter');
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** delete() */

describe('delete', function () {
  test('works', async function () {
    // Create teacher to delete
    await Teacher.add('u1');
    // Delete the teacher
    const deletedTeacher = await Teacher.delete('u1');
    expect(deletedTeacher).toEqual({
      userID: expect.any(Number),
    });
    // Make sure u1 user is no longer a teacher
    const userRes = await db.query(
      `SELECT 
            id,
            username,
            user_type_id AS "userTypeID"
        FROM users
        WHERE username='u1'`
    );
    const user1 = userRes.rows[0];
    const result = await db.query(`SELECT * FROM teachers WHERE user_id=$1`, [
      user1.id,
    ]);
    expect(user1.userTypeID).toEqual(1);
    expect(result.rows.length).toEqual(0);
  });

  test('notfounderror if username doesnt exist', async function () {
    try {
      await Teacher.delete('imposter');
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
