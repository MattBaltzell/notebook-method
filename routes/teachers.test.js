'use strict';

const request = require('supertest');

const app = require('../app');

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u4Token,
  a1Token,
  t1Token,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /teachers */

describe('GET /teachers', function () {
  test('works', async function () {
    const resp = await request(app)
      .get('/teachers')
      .set('authorization', `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      teachers: [
        {
          userID: expect.any(Number),
          teacherID: expect.any(Number),
          username: 'u3',
          firstName: 'U3F',
          lastName: 'U3L',
          email: 'user3@user.com',
          userTypeID: 2,
        },
        {
          userID: expect.any(Number),
          teacherID: expect.any(Number),
          username: 'u4',
          firstName: 'U4F',
          lastName: 'U4L',
          email: 'user4@user.com',
          userTypeID: 2,
        },
      ],
    });
  });
});

/******************************* GET /teachers/:username */

describe('GET /teachers/:username', function () {
  test('works', async function () {
    const resp = await request(app)
      .get('/teachers/u3')
      .set('authorization', `Bearer ${t1Token}`);
    expect(resp.body).toEqual({
      teacher: {
        userID: expect.any(Number),
        teacherID: expect.any(Number),
        username: 'u3',
        email: 'user3@user.com',
        firstName: 'U3F',
        lastName: 'U3L',
        userTypeID: 2,
        avatarURL: null,
        joinAt: expect.any(String),
        lastLoginAt: null,
        students: [
          {
            userID: expect.any(Number),
            studentID: expect.any(Number),
            username: 'u5',
            email: 'user5@user.com',
            firstName: 'U5F',
            lastName: 'U5L',
            grade: '3',
            userTypeID: 3,
          },
        ],
      },
    });
  });
});

// /************************************** DELETE /teachers/:username */

describe('DELETE /teachers/:username', function () {
  test('works', async function () {
    const resp = await request(app)
      .delete('/teachers/u4')
      .set('authorization', `Bearer ${a1Token}`);
    expect(resp.body).toEqual({ message: 'Deleted.' });

    const teachers = await request(app).get('/teachers');
    expect(teachers.body).toEqual({
      teachers: [
        {
          userID: expect.any(Number),
          teacherID: expect.any(Number),
          username: 'u3',
          firstName: 'U3F',
          lastName: 'U3L',
          email: 'user3@user.com',
          userTypeID: 2,
        },
      ],
    });

    const userRes = await request(app)
      .get('/users/u4')
      .set('authorization', `Bearer ${u4Token}`);

    expect(userRes.body.user.userTypeID).toEqual(1);
  });
});
