/** Teacher  */

const db = require('../db');
const ExpressError = require('../expressError');

class Teacher {
  /** get all teachers */
  static async getAll() {
    const results = await db.query(
      `SELECT 
      u.id AS user_id,
      t.id AS teacher_id, 
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      u.user_type_id
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
      u.id AS user_id,
      t.id AS teacher_id,
      u.username, 
      u.first_name, 
      u.last_name,
      u.email, 
      u.password,
      u.user_type_id,
      u.avatar_url, 
      u.join_at, 
      u.last_login_at 
      FROM users AS u
      JOIN teachers AS t
      ON u.id = t.user_id
      WHERE username ILIKE $1`,
      [username]
    );
    if (!results.rows[0]) {
      throw new ExpressError(`Teacher not found`, 404);
    }
    return results.rows[0];
  }

  /** add new teacher. */

  static async add({ user_id }) {
    const results = await db.query(
      `INSERT INTO teachers (user_id) 
        VALUES ($1) 
        RETURNING id, user_id`,
      [user_id]
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
