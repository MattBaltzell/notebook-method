/** Student  */

const db = require('../db');
const { NotFoundError } = require('../expressError');
const User = require('./user');
const { sqlForPartialUpdate } = require('../helpers/sql');

class Student {
  /** Get all students
   *
   * Returns [{ userID, studentID, username, firstName, lastName, email, userTypeID, grade }]
   *
   */
  static async getAll() {
    const results = await db.query(
      `SELECT 
          u.id AS "userID",
          s.id AS "studentID", 
          u.username,
          u.first_name AS "firstName", 
          u.last_name AS "lastName",
          u.email,
          u.user_type_id as "userTypeID",
          s.grade
        FROM users AS u
        JOIN students AS s
          ON s.user_id = u.id
        ORDER BY grade;
  `
    );

    return results.rows;
  }

  /** Get student by username.
   *
   * Returns {
   *        userID,
   *        studentID,
   *        username,
   *        firstName,
   *        lastName,
   *        email,
   *        userTypeID,
   *        grade,
   *        teacherID,
   *        avatarURL,
   *        joinAt,
   *        lastLoginAt
   * }
   *
   * Throws NotFoundError if username not valid
   */
  static async get(username) {
    const results = await db.query(
      `SELECT 
          u.id AS "userID",
          s.id AS "studentID", 
          u.username,
          u.first_name AS "firstName", 
          u.last_name AS "lastName",
          u.email,
          u.user_type_id AS "userTypeID",
          s.grade,
          s.teacher_id AS "teacherID",
          u.avatar_url AS "avatarURL",
          u.join_at AS "joinAt", 
          u.last_login_at AS "lastLoginAt"
        FROM users AS u
        JOIN students AS s
          ON s.user_id = u.id
        WHERE u.username=$1
        `,
      [username]
    );

    if (!results.rows[0]) {
      throw new NotFoundError(`Student not found`);
    }
    return results.rows[0];
  }

  /** Add new student with username.
   *
   * Updates user_type_id to 2
   *
   * Returns { userID, studentID, grade, teacherID }
   *
   * Throws NotFoundError if username not valid
   */

  static async add(username, teacherID, grade) {
    const userRes = await db.query(`SELECT id FROM users WHERE username=$1`, [
      username,
    ]);
    const user = userRes.rows[0];

    if (!user) {
      throw new NotFoundError(`No user: ${username}`);
    }

    const teacherRes = await db.query('SELECT * FROM teachers WHERE id=$1', [
      teacherID,
    ]);

    const teacher = teacherRes.rows[0];

    if (!teacher) {
      throw new NotFoundError(`No teacher with id: ${teacherID}`);
    }

    const studentRes = await db.query(
      `INSERT INTO students (
        user_id, 
        teacher_id,  
        grade) 
        VALUES ($1, $2, $3) 
        RETURNING user_id AS "userID", id AS "studentID", grade, teacher_id AS "teacherID"`,
      [user.id, teacherID, grade]
    );

    const student = studentRes.rows[0];

    User.updateUserType(username, 3);

    if (!student) {
      throw new NotFoundError(`Student not found`);
    }

    return student;
  }

  /** Update student by username.
   *
   * Returns { userID, studentID, grade, teacherID }
   *
   * Throws NotFoundError if username not valid
   */

  static async update(username, data) {
    // check if username is valid
    const userRes = await db.query(`SELECT id FROM users WHERE username=$1`, [
      username,
    ]);
    const user = userRes.rows[0];

    if (!user) {
      throw new NotFoundError(`No user: ${username}`);
    }

    // update student
    const { setCols, values } = sqlForPartialUpdate(data, {
      teacherID: 'teacher_id',
    });
    const userIDVarIdx = '$' + (values.length + 1);
    const querySql = `UPDATE students 
    SET ${setCols} 
    WHERE user_id = ${userIDVarIdx} 
    RETURNING user_id AS "userID",
              id AS "studentID",
              grade,
              teacher_id AS "teacherID"`;
    const result = await db.query(querySql, [...values, user.id]);
    const student = result.rows[0];

    if (!student) throw new NotFoundError(`No user: ${username}`);

    return student;
  }

  /** Delete student by username.
   *
   * * Updates user_type_id to 1
   *
   * Returns { username }
   *
   * Throws NotFoundError if username is not valid
   */
  static async delete(username) {
    const userRes = await db.query(
      `SELECT id 
        FROM users 
        WHERE username=$1
      `,
      [username]
    );
    const user = userRes.rows[0];

    if (!user) {
      throw new NotFoundError(`No user: ${username}`);
    }

    const studentRes = await db.query(
      `DELETE
          FROM students
          WHERE user_id=$1
          RETURNING user_id AS "userID"
          `,
      [user.id]
    );
    const student = studentRes.rows[0];

    User.updateUserType(username, 1);

    return student;
  }
}

module.exports = Student;
