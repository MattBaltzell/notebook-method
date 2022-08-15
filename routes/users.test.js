'use strict';

const request = require('supertest');

const app = require('../app');

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  a1Token,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users */

describe('POST /users', function () {
  test('works: admin can create new admin', async function () {
    const newUser = {
      username: 'newAdminUser',
      email: 'newadminuser@email.com',
      password: 'password',
      firstName: 'New',
      lastName: 'Admin',
      isAdmin: true,
    };
    const resp = await request(app)
      .post('/users')
      .send(newUser)
      .set('authorization', `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        id: expect.any(Number),
        username: 'newAdminUser',
        email: 'newadminuser@email.com',
        firstName: 'New',
        lastName: 'Admin',
        isAdmin: true,
      },
      token: expect.any(String),
    });
  });
});

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
          isAdmin: false,
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
          isAdmin: false,
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
          isAdmin: false,
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
          isAdmin: false,
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
        isAdmin: false,
      },
    });
  });
});

/************************************** PATCH /users/:username */

describe('PATCH /users/:username', function () {
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
        isAdmin: false,
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
        isAdmin: false,
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

/************************************** DELETE /users/:username */

describe('DELETE /users/:username', function () {
  test('works', async function () {
    const resp = await request(app)
      .delete('/users/u1')
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ message: 'Deleted.' });
  });
});
