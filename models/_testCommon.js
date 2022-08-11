const bcrypt = require('bcrypt');

const db = require('../db.js');
const { BCRYPT_WORK_FACTOR } = require('../config');

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query('DELETE FROM assignments');
  await db.query('DELETE FROM students');
  await db.query('DELETE FROM teachers');
  await db.query('DELETE FROM users');
  await db.query(
    `
        INSERT INTO users(
                          username,
                          user_type_id, 
                          email,
                          password,
                          first_name,
                          last_name,
                          join_at)

        VALUES ('u1', 1, 'u1@email.com', $1, 'U1F', 'U1L',  CURRENT_TIMESTAMP),
               ('u2', 1, 'u2@email.com', $2, 'U2F', 'U2L',  CURRENT_TIMESTAMP),
               ('u3', 1, 'u3@email.com', $3, 'U3F', 'U3L',  CURRENT_TIMESTAMP)
        RETURNING username`,
    [
      await bcrypt.hash('password1', BCRYPT_WORK_FACTOR),
      await bcrypt.hash('password2', BCRYPT_WORK_FACTOR),
      await bcrypt.hash('password3', BCRYPT_WORK_FACTOR),
    ]
  );
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

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};
