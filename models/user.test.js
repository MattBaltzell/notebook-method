'use strict';

const {
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
} = require('../expressError');
const db = require('../db.js');
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

/************************************** authenticate */

describe('authenticate', function () {
  test('works', async function () {
    const user = await User.authenticate('u1', 'password1');
    expect(user).toEqual({
      username: 'u1',
      firstName: 'U1F',
      lastName: 'U1L',
      email: 'u1@email.com',
      userTypeID: 1,
    });
  });

  test('unauth if no such user', async function () {
    try {
      await User.authenticate('nope', 'password');
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test('unauth if wrong password', async function () {
    try {
      await User.authenticate('c1', 'wrong');
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/************************************** register */

describe('register', function () {
  const newUser = {
    username: 'new',
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'Tester',
  };

  test('works', async function () {
    let user = await User.register({
      ...newUser,
      password: 'password',
    });
    expect(user).toEqual({ ...newUser, id: expect.any(Number) });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].id).toEqual(expect.any(Number));
    expect(found.rows[0].user_type_id).toEqual(1);
    expect(found.rows[0].join_at).toEqual(expect.any(Date));
    expect(found.rows[0].password.startsWith('$2b$')).toEqual(true);
  });

  test('bad request with dup data', async function () {
    try {
      await User.register({
        ...newUser,
        password: 'password',
      });
      await User.register({
        ...newUser,
        password: 'password',
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** update login timestamp */

describe('updateLoginTimestamp', function () {
  const newUser = {
    username: 'new',
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'Tester',
  };
  test('works', async function () {
    let user = await User.register({
      ...newUser,
      password: 'password',
    });
    // Test that last_login_at is null before executing updateLoginTimestamp()
    const found1 = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found1.rows[0].last_login_at).toBeNull();

    // Test that last_login_at is a valid date after executing updateLoginTimestamp()
    User.updateLoginTimestamp(found1.rows[0].username);
    const found2 = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found2.rows[0].last_login_at).not.toBeNull();
    expect(found2.rows[0].last_login_at).toEqual(expect.any(Date));
  });
});

/************************************** update user type */

describe('updateUserType', function () {
  const newUser = {
    username: 'new',
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'Tester',
  };
  test('works', async function () {
    let user = await User.register({
      ...newUser,
      password: 'password',
    });
    // Test that user_type_id is 1 by default before executing updateUserType()
    const found1 = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found1.rows[0].user_type_id).toEqual(1);

    // Test that user_type_id changes when updateUserType is called
    User.updateUserType('new', 2);
    const found2 = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found2.rows[0].user_type_id).toEqual(2);
  });
});

/************************************** getAll() */

describe('getAll', function () {
  test('works', async function () {
    const users = await User.getAll();
    expect(users).toEqual([
      {
        id: expect.any(Number),
        username: 'u1',
        firstName: 'U1F',
        lastName: 'U1L',
        email: 'u1@email.com',
        avatarURL: null,
        userTypeID: 1,
        joinAt: expect.any(Date),
        lastLoginAt: null,
      },
      {
        id: expect.any(Number),
        username: 'u2',
        firstName: 'U2F',
        lastName: 'U2L',
        email: 'u2@email.com',
        avatarURL: null,
        userTypeID: 1,
        joinAt: expect.any(Date),
        lastLoginAt: null,
      },
    ]);
  });
});

/************************************** get() */

describe('get', function () {
  test('works', async function () {
    const user = await User.get('u1');
    expect(user).toEqual({
      id: expect.any(Number),
      username: 'u1',
      firstName: 'U1F',
      lastName: 'U1L',
      email: 'u1@email.com',
      avatarURL: null,
      userTypeID: 1,
      joinAt: expect.any(Date),
      lastLoginAt: null,
    });
  });

  test('not found if no such user', async function () {
    try {
      await User.get('nope');
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update() */

describe('update', function () {
  test('works', async function () {
    await User.update('u1', {
      email: 'new1@test.com',
      firstName: 'newF',
      lastName: 'newL',
      avatarURL: 'test',
    });
    const result = await db.query("SELECT * FROM users WHERE username='u1'");
    const user = result.rows[0];
    expect(result.rows.length).toEqual(1);
    expect(user.email).toEqual('new1@test.com');
    expect(user.first_name).toEqual('newF');
    expect(user.last_name).toEqual('newL');
    expect(user.avatar_url).toEqual('test');
  });

  test('not found if no such user', async function () {
    try {
      await User.update('nope', {
        email: 'new1@test.com',
        firstName: 'newF',
        lastName: 'newL',
        avatarURL: 'test',
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
    await User.delete('u1');
    const result = await db.query("SELECT * FROM users WHERE username='u1'");
    expect(result.rows.length).toEqual(0);
  });

  test('not found if no such user', async function () {
    try {
      await User.delete('nope');
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
