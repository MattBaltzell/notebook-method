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
      isAdmin: false,
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
    isAdmin: false,
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

  test('works: adds admin', async function () {
    let user = await User.register({
      ...newUser,
      password: 'password',
      isAdmin: true,
    });
    expect(user).toEqual({ ...newUser, id: expect.any(Number), isAdmin: true });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(true);
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
    isAdmin: false,
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

  test('not found if no such user', async function () {
    try {
      await User.updateLoginTimestamp('nope');
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update user type */

describe('updateUserType', function () {
  const newUser = {
    username: 'new',
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'Tester',
    isAdmin: false,
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
    await User.updateUserType('new', 2);
    const found2 = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found2.rows[0].user_type_id).toEqual(2);
  });

  test('not found if no such user', async function () {
    try {
      await User.updateUserType('nope', 2);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test('not found if no such userTypeID', async function () {
    try {
      let user = await User.register({
        ...newUser,
        password: 'password',
      });
      await User.updateUserType('new', 0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
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
        isAdmin: false,
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
        isAdmin: false,
      },
      {
        id: expect.any(Number),
        username: 'u3',
        firstName: 'U3F',
        lastName: 'U3L',
        email: 'u3@email.com',
        avatarURL: null,
        userTypeID: 1,
        joinAt: expect.any(Date),
        lastLoginAt: null,
        isAdmin: false,
      },
      {
        id: expect.any(Number),
        username: 'u4',
        firstName: 'U4F',
        lastName: 'U4L',
        email: 'u4@email.com',
        avatarURL: null,
        userTypeID: 2,
        joinAt: expect.any(Date),
        lastLoginAt: null,
        isAdmin: false,
      },
      {
        id: expect.any(Number),
        username: 'u5',
        firstName: 'U5F',
        lastName: 'U5L',
        email: 'u5@email.com',
        avatarURL: null,
        userTypeID: 3,
        joinAt: expect.any(Date),
        lastLoginAt: null,
        isAdmin: false,
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
      isAdmin: false,
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
  const updateData = {
    email: 'new1@test.com',
    firstName: 'newF',
    lastName: 'newL',
    avatarURL: 'test',
  };

  test('works', async function () {
    const user = await User.update('u1', updateData);

    expect(user).toEqual({ ...updateData, isAdmin: false, username: 'u1' });
  });

  test('works: set password', async function () {
    let user = await User.update('u1', {
      password: 'new',
    });
    expect(user).toEqual({
      username: 'u1',
      firstName: 'U1F',
      lastName: 'U1L',
      email: 'u1@email.com',
      isAdmin: false,
      avatarURL: null,
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'u1'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith('$2b$')).toEqual(true);
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

  test('bad request if no data', async function () {
    expect.assertions(1);
    try {
      await User.update('u1', {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
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
