'use strict';

const db = require('../db.js');
const User = require('../models/user');
const { createToken } = require('../helpers/tokens');

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query('DELETE FROM users');
  // noinspection SqlWithoutWhere

  await User.register({
    username: 'u1',
    firstName: 'U1F',
    lastName: 'U1L',
    email: 'user1@user.com',
    password: 'password1',
    isAdmin: false,
  });
  await User.register({
    username: 'u2',
    firstName: 'U2F',
    lastName: 'U2L',
    email: 'user2@user.com',
    password: 'password2',
    isAdmin: false,
  });
  await User.register({
    username: 'u3',
    firstName: 'U3F',
    lastName: 'U3L',
    email: 'user3@user.com',
    password: 'password3',
    isAdmin: false,
  });
  await User.register({
    username: 'u4',
    firstName: 'U4F',
    lastName: 'U4L',
    email: 'user4@user.com',
    password: 'password4',
    isAdmin: false,
  });
}

async function commonBeforeEach() {
  await db.query('BEGIN');
}

async function commonAfterEach() {
  await db.query('ROLLBACK');
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({ username: 'u1', userTypeID: 1, isAdmin: false });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
};
