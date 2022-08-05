/** User  */

const db = require('../db');
const ExpressError = require('../expressError');
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config.js');

class User {
  /** register new user */

  static async register({ username, email, password, first_name, last_name }) {
    const hashed_pw = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const results = await db.query(
      `INSERT INTO users (
        username, 
        user_type_id, 
        email, 
        password,
        first_name,
        last_name,
        join_at ) 
        VALUES ($1, 1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
        RETURNING id, username, user_type_id, email, first_name, last_name, join_at`,
      [username, email, hashed_pw, first_name, last_name]
    );

    return results.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const results = await db.query(
      'SELECT password FROM users WHERE username=$1',
      [username]
    );
    const user = results.rows[0];

    if (user) {
      return await bcrypt.compare(password, user.password);
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const results = await db.query(
      'UPDATE users SET last_login_at=NOW() WHERE username=$1',
      [username]
    );
  }

  static async updateUserType(user_type_id, user_id) {
    await db.query(
      `UPDATE users
        SET user_type_id=$1
        WHERE id=$2`,
      [user_type_id, user_id]
    );
  }

  /** get all users */
  static async getAll() {
    const results = await db.query(
      `SELECT 
          id,
          username,
          email,
          first_name,
          last_name,
          user_type_id,
          avatar_url,
          join_at,
          last_login_at
        FROM users
        ORDER BY id`
    );

    return results.rows;
  }

  /** get user by username */
  static async get(username) {
    const results = await db.query(
      `SELECT 
        id,
        username,
        email,
        first_name,
        last_name,
        user_type_id,
        avatar_url,
        join_at,
        last_login_at
      FROM users
      WHERE username=$1`,
      [username]
    );

    if (!results.rows[0]) {
      throw new ExpressError(`User not found`, 404);
    }
    return results.rows[0];
  }

  /** update a user */
  static async update({ username, email, first_name, last_name, avatar_url }) {
    const results = await db.query(
      `UPDATE users 
        SET
          username = $1, 
          email = $2, 
          first_name = $3,
          last_name = $4,
          avatar_url = $5
        WHERE username = $1
        RETURNING id, username, email, password, first_name, last_name, user_type_id, avatar_url`,
      [username, email, first_name, last_name, avatar_url]
    );

    return results.rows[0];
  }

  /** delete a user */
  static async delete(username) {
    const results = await db.query(
      `DELETE
        FROM users 
        WHERE username ILIKE $1
        RETURNING username`,
      [username]
    );
    return results.rows[0];
  }
}

module.exports = User;
