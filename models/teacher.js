/** Teacher  */

const db = require('../db');
const { NotFoundError } = require('../expressError');
const User = require('./user');

class Teacher {
  /** Get all teachers
   *
   * Returns [{ userID, teacherID, username, firstName, lastName, email, userTypeID }]
   *
   */

  static async getAll() {
    const results = await db.query(
      `SELECT 
        u.id AS "userID",
        t.id AS "teacherID", 
        u.username,
        u.first_name AS "firstName", 
        u.last_name AS "lastName",
        u.email,
        u.user_type_id AS "userTypeID"
      FROM users AS u
      JOIN teachers AS t
      ON t.user_id = u.id`
    );
    return results.rows;
  }

  /** Get teacher by username.
   *
   * Returns { userID, teacherID, username, firstName, lastName, email, userTypeID, avatarURL, joinAt, lastLoginAt }
   *
   * Throws NotFoundError if username not valid
   */

  static async get(username) {
    const results = await db.query(
      `SELECT 
        u.id AS "userID",
        t.id AS "teacherID",
        u.username, 
        u.first_name AS "firstName", 
        u.last_name AS "lastName",
        u.email, 
        u.user_type_id AS "userTypeID",
        u.avatar_url AS "avatarURL", 
        u.join_at AS "joinAt", 
        u.last_login_at AS "lastLoginAt"
      FROM users AS u
      JOIN teachers AS t
      ON u.id = t.user_id
      WHERE username ILIKE $1`,
      [username]
    );
    const user = results.rows[0];

    if (!user) {
      throw new NotFoundError(`No teacher: ${username}`);
    }

    return user;
  }

  /** Add new teacher with username.
   *
   * Updates user_type_id to 2
   *
   * Returns { userID, teacherID }
   *
   * Throws NotFoundError if username not valid
   */

  static async add(username) {
    const userRes = await db.query(
      `SELECT id, username FROM users WHERE username=$1`,
      [username]
    );
    const user = userRes.rows[0];

    if (!user) {
      throw new NotFoundError(`No user: ${username}`);
    }

    const teacherRes = await db.query(
      `INSERT INTO teachers (user_id) 
      VALUES ($1) 
      RETURNING user_id AS "userID", id AS "teacherID"`,
      [user.id]
    );

    const teacher = teacherRes.rows[0];

    User.updateUserType(username, 2);

    if (!teacher) {
      throw new NotFoundError(`Teacher not found`);
    }

    return teacher;
  }

  /** Delete teacher by username.
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

    const teacherRes = await db.query(
      `DELETE
        FROM teachers
        WHERE user_id=$1
        RETURNING user_id AS "userID"
      `,
      [user.id]
    );
    const teacher = teacherRes.rows[0];

    User.updateUserType(username, 1);

    return teacher;
  }
}

module.exports = Teacher;
