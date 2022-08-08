/** Teacher  */

const db = require('../db');
const { NotFoundError } = require('../expressError');

class Teacher {
  /** get all teachers */
  static async getAll() {
    const results = await db.query(
      `SELECT 
        u.id AS userID,
        t.id AS teacherID, 
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

  /** find teacher by username. */

  static async get(username) {
    const results = await db.query(
      `SELECT 
        u.id AS "userID",
        t.id AS "teacherID",
        u.username, 
        u.first_name AS "firstName", 
        u.last_name AS "lastName",
        u.email, 
        u.password,
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
    if (!results.rows[0]) {
      throw new NotFoundError(`Teacher not found`);
    }
    return results.rows[0];
  }

  /** add new teacher. */

  static async add(userID) {
    const results = await db.query(
      `INSERT INTO teachers (user_id) 
        VALUES ($1) 
        RETURNING id, user_id AS "userID"`,
      [userID]
    );

    return results.rows[0];
  }

  /** delete teacher. */

  static async delete(id) {
    const results = await db.query(
      `DELETE
        FROM teachers
        WHERE id=$1
        RETURNING id
      `,
      [id]
    );
    return results.rows[0];
  }
}

module.exports = Teacher;
