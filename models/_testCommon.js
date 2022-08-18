const bcrypt = require('bcrypt');

const db = require('../db.js');
const { BCRYPT_WORK_FACTOR } = require('../config');

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query('DELETE FROM assignments');
  // noinspection SqlWithoutWhere
  await db.query('DELETE FROM students');
  // noinspection SqlWithoutWhere
  await db.query('DELETE FROM teachers');
  // noinspection SqlWithoutWhere
  await db.query('DELETE FROM users');

  await db.query(
    `
        INSERT INTO users (
                username,
                user_type_id, 
                email,
                password,
                first_name,
                last_name,
                join_at)

        VALUES ('u1', 1, 'u1@email.com', $1, 'U1F', 'U1L',  CURRENT_TIMESTAMP),
               ('u2', 1, 'u2@email.com', $2, 'U2F', 'U2L',  CURRENT_TIMESTAMP),
               ('u3', 1, 'u3@email.com', $3, 'U3F', 'U3L',  CURRENT_TIMESTAMP),
               ('u4', 2, 'u4@email.com', $4, 'U4F', 'U4L',  CURRENT_TIMESTAMP),
               ('u5', 3, 'u5@email.com', $5, 'U5F', 'U5L',  CURRENT_TIMESTAMP)
        RETURNING username`,
    [
      await bcrypt.hash('password1', BCRYPT_WORK_FACTOR),
      await bcrypt.hash('password2', BCRYPT_WORK_FACTOR),
      await bcrypt.hash('password3', BCRYPT_WORK_FACTOR),
      await bcrypt.hash('password4', BCRYPT_WORK_FACTOR),
      await bcrypt.hash('password5', BCRYPT_WORK_FACTOR),
    ]
  );

  const found1 = await db.query(`SELECT id FROM users WHERE username='u4'`);
  const found2 = await db.query(`SELECT id FROM users WHERE username='u5'`);
  const user4 = found1.rows[0];
  const user5 = found2.rows[0];

  const teacherRes = await db.query(
    `
      INSERT INTO teachers 
      (user_id) 
      VALUES ($1)
      RETURNING id
    `,
    [user4.id]
  );
  const teacher = teacherRes.rows[0];

  const studentRes = await db.query(
    `
      INSERT INTO students 
      (user_id) 
      VALUES ($1)
      RETURNING id 
      `,
    [user5.id]
  );
  const student = studentRes.rows[0];

  const assignmentRes = await db.query(
    `
      INSERT into assignments(
        title,
        subject_code,
        instructions,
        teacher_id
      )
      VALUES ('Assignment1','HIST1','Instructions for Assignment 1', $1)
      RETURNING id
      `,
    [teacher.id]
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
