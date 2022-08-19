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
  const newUser = {
    username: 'newAdminUser',
    email: 'newadminuser@email.com',
    password: 'password',
    firstName: 'New',
    lastName: 'Admin',
    isAdmin: true,
  };
  test('works: admin can create new admin', async function () {
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

  test('bad request when missing parameters', async function () {
    const resp = await request(app)
      .post('/users')
      .send({
        username: 'newAdminUser',
        email: 'newadminuser@email.com',
        password: 'password',
      })
      .set('authorization', `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test('bad request when attempting to update invalid parameter', async function () {
    const resp = await request(app)
      .post('/users')
      .send({ ...newUser, eatsMeat: false })
      .set('authorization', `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test('unauth for non-admins', async function () {
    const resp = await request(app)
      .post('/users')
      .send(newUser)
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test('unauth for anon', async function () {
    const resp = await request(app).post('/users').send(newUser);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /users */

describe('GET /users', function () {
  test('works', async function () {
    const resp = await request(app)
      .get('/users')
      .set('authorization', `Bearer ${a1Token}`);
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
          userTypeID: 2,
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
          userTypeID: 2,
          avatarURL: null,
          joinAt: expect.any(String),
          lastLoginAt: null,
          isAdmin: false,
        },
        {
          id: expect.any(Number),
          username: 'u5',
          email: 'user5@user.com',
          firstName: 'U5F',
          lastName: 'U5L',
          userTypeID: 3,
          avatarURL: null,
          joinAt: expect.any(String),
          lastLoginAt: null,
          isAdmin: false,
        },
        {
          id: expect.any(Number),
          username: 'u6',
          email: 'user6@user.com',
          firstName: 'U6F',
          lastName: 'U6L',
          userTypeID: 3,
          avatarURL: null,
          joinAt: expect.any(String),
          lastLoginAt: null,
          isAdmin: false,
        },
        {
          id: expect.any(Number),
          username: 'a1',
          email: 'admin1@user.com',
          firstName: 'A1F',
          lastName: 'A1L',
          userTypeID: 1,
          avatarURL: null,
          joinAt: expect.any(String),
          lastLoginAt: null,
          isAdmin: true,
        },
      ],
    });
  });

  test('unauth for non-admins', async function () {
    const resp = await request(app)
      .get('/users')
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test('unauth for anon', async function () {
    const resp = await request(app).get('/users');
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /users/:username */

describe('GET /users/:username', function () {
  test('works', async function () {
    const resp = await request(app)
      .get('/users/u1')
      .set('authorization', `Bearer ${u1Token}`);
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

  test('works: as admin', async function () {
    const resp = await request(app)
      .get('/users/u1')
      .set('authorization', `Bearer ${a1Token}`);
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

  test('unauth if wrong user', async function () {
    const resp = await request(app)
      .get('/users/u2')
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test('unauth for anon', async function () {
    const resp = await request(app).get('/users/u2');
    expect(resp.statusCode).toEqual(401);
  });

  test('as admin: not found when username does not exist', async function () {
    const resp = await request(app)
      .get('/users/imposter')
      .set('authorization', `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
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

  test('works: as admin', async function () {
    const resp = await request(app)
      .patch('/users/u1')
      .send({ avatarURL: 'https://thisisatestlink.com/img' })
      .set('authorization', `Bearer ${a1Token}`);
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

  test('bad request when attempting to update invalid parameter', async function () {
    const resp = await request(app)
      .patch('/users/u2')
      .send({ lovesChickens: true })
      .set('authorization', `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test('unauth when attempting to edit another user', async function () {
    const resp = await request(app)
      .patch('/users/u2')
      .send({ avatarURL: 'https://thisisatestlink.com/img' })
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test('unauth for anon', async function () {
    const resp = await request(app)
      .patch('/users/u2')
      .send({ avatarURL: 'https://thisisatestlink.com/img' });
    expect(resp.statusCode).toEqual(401);
  });

  test('as admin: not found when username does not exist', async function () {
    const resp = await request(app)
      .patch('/users/imposter')
      .send({ avatarURL: 'https://thisisatestlink.com/img' })
      .set('authorization', `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
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

  test('works: as admin', async function () {
    const resp = await request(app)
      .delete('/users/u1')
      .set('authorization', `Bearer ${a1Token}`);
    expect(resp.body).toEqual({ message: 'Deleted.' });
  });

  test('unauth when attempting to delete another user', async function () {
    const resp = await request(app)
      .delete('/users/u2')
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test('unauth for anon', async function () {
    const resp = await request(app).delete('/users/u2');
    expect(resp.statusCode).toEqual(401);
  });

  test('admin: not found when username does not exist', async function () {
    const resp = await request(app)
      .delete('/users/imposter')
      .set('authorization', `Bearer ${a1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
