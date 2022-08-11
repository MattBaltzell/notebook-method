'use strict';

const request = require('supertest');

const app = require('../app');

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /users */

describe('GET /users', function () {
  test('works', async function () {
    const resp = await request(app).get('/users');
    expect(resp.body).toEqual({
      users: [
        {
          id: expect.any(Number),
          username: 'u1',
          email: 'user1@user.com',
          firstName: 'U1F',
          lastName: 'U1L',
          userTypeID: 1,
          avatarURL: null,
          joinAt: expect.any(String),
          lastLoginAt: null,
        },
        {
          id: expect.any(Number),
          username: 'u2',
          email: 'user2@user.com',
          firstName: 'U2F',
          lastName: 'U2L',
          userTypeID: 1,
          avatarURL: null,
          joinAt: expect.any(String),
          lastLoginAt: null,
        },
        {
          id: expect.any(Number),
          username: 'u3',
          email: 'user3@user.com',
          firstName: 'U3F',
          lastName: 'U3L',
          userTypeID: 1,
          avatarURL: null,
          joinAt: expect.any(String),
          lastLoginAt: null,
        },
        {
          id: expect.any(Number),
          username: 'u4',
          email: 'user4@user.com',
          firstName: 'U4F',
          lastName: 'U4L',
          userTypeID: 1,
          avatarURL: null,
          joinAt: expect.any(String),
          lastLoginAt: null,
        },
      ],
    });
  });
});

/************************************** GET /users/:username */

describe('GET /users/:username', function () {
  test('works', async function () {
    const resp = await request(app).get('/users/u1');
    expect(resp.body).toEqual({
      user: {
        id: expect.any(Number),
        username: 'u1',
        email: 'user1@user.com',
        firstName: 'U1F',
        lastName: 'U1L',
        userTypeID: 1,
        avatarURL: null,
        joinAt: expect.any(String),
        lastLoginAt: null,
      },
    });
  });
});

/************************************** PATCH /users/:username */

describe('GET /users/:username', function () {
  test('works', async function () {
    const resp = await request(app)
      .patch('/users/u1')
      .send({
        firstName: 'User1',
        lastName: 'User1Lastname',
        email: 'user1@email.com',
        avatarURL: 'https://thisisatestlink.com/images',
      })
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: 'u1',
        email: 'user1@email.com',
        firstName: 'User1',
        lastName: 'User1Lastname',
        avatarURL: 'https://thisisatestlink.com/images',
      },
    });
  });

  test('works with single value', async function () {
    const resp = await request(app)
      .patch('/users/u1')
      .send({ avatarURL: 'https://thisisatestlink.com/img' })
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      user: {
        username: 'u1',
        email: 'user1@user.com',
        firstName: 'U1F',
        lastName: 'U1L',
        avatarURL: 'https://thisisatestlink.com/img',
      },
    });
  });

  test('auth error when attempting to edit another user', async function () {
    const resp = await request(app)
      .patch('/users/u2')
      .send({ avatarURL: 'https://thisisatestlink.com/img' })
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** PATCH /users/:username */

describe('DELETE /users/:username', function () {
  test('works', async function () {
    const resp = await request(app)
      .delete('/users/u1')
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ message: 'Deleted.' });
  });
});
