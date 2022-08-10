/** User  */

const db = require('../db');
const {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} = require('../expressError');
const bcrypt = require('bcrypt');
const { sqlForPartialUpdate } = require('../helpers/sql');
const { BCRYPT_WORK_FACTOR } = require('../config.js');

class User {
  /** Authenticate with username/password.
   *
   * Returns { username, first_name, last_name, email, userTypeID }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   *
   */

  static async authenticate(username, password) {
    // try to find user first
    const result = await db.query(
      `SELECT username,
              password,
              first_name AS "firstName",
              last_name AS "lastName",
              email,
              user_type_id AS "userTypeID"
           FROM users
           WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError('Invalid username/password');
  }

  /** Register user with data
   *
   * Returns {id, username, email, firstName, lastName}
   *
   * Returns BadRequestError if duplicate is found.
   */

  static async register({ username, email, password, firstName, lastName }) {
    const duplicateCheck = await db.query(
      `SELECT username
         FROM users
         WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users (
      username, 
      user_type_id, 
      email, 
      password,
      first_name,
      last_name,
      join_at ) 
      VALUES ($1, 1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
      RETURNING id, username, email, first_name AS "firstName", last_name AS "lastName"`,
      [username, email, hashedPassword, firstName, lastName]
    );

    const user = result.rows[0];

    return user;
  }

  /** Update last_login_at for user
   *
   * Returns {username, lastLoginAt}
   *
   * Throws NotFoundError if username not valid
   */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users SET last_login_at=NOW() WHERE username=$1
      RETURNING username, last_login_at AS "lastLoginAt"`,
      [username]
    );
    const user = result.rows[0];
    if (!user) throw new NotFoundError(`No user with username of ${username}`);
  }

  /** Update user_type_id for user
   *
   * Returns { id, userTypeID }
   *
   * Throws NotFoundError if username not valid
   */

  static async updateUserType(username, userTypeID) {
    const result = await db.query(
      `UPDATE users
        SET user_type_id=$1
        WHERE username=$2
        RETURNING username, user_type_id AS "userTypeID"`,
      [userTypeID, username]
    );

    const user = result.rows[0];
    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  /** Get all users
   *
   * Returns { id, username, email, firstName, lastName, userTypeID, avatarURL, joinAt, lastLoginAt }
   *
   *
   */

  static async getAll() {
    const result = await db.query(
      `SELECT 
          id,
          username,
          email,
          first_name AS "firstName",
          last_name AS "lastName",
          user_type_id AS "userTypeID",
          avatar_url AS "avatarURL",
          join_at AS "joinAt",
          last_login_at AS "lastLoginAt"
        FROM users
        ORDER BY id`
    );

    return result.rows;
  }

  /** Get user by username
   *
   * Returns { id, username, email, firstName, lastName, userTypeID, avatarURL, joinAt, lastLoginAt }
   *
   * Throws NotFoundError if username not valid
   */

  static async get(username) {
    const result = await db.query(
      `SELECT 
        id,
        username,
        email,
        first_name AS "firstName",
        last_name AS "lastName",
        user_type_id AS "userTypeID",
        avatar_url AS "avatarURL",
        join_at AS "joinAt",
        last_login_at AS "lastLoginAt"
      FROM users
      WHERE username=$1`,
      [username]
    );

    const user = result.rows[0];
    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, avatarURL }
   *
   * Returns { username, firstName, lastName, email, avatarURL }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password.
   * Callers of this function must be certain they have validated inputs to this
   * or serious security risks are opened.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: 'first_name',
      lastName: 'last_name',
      avatarURL: 'avatar_url',
    });
    const usernameVarIdx = '$' + (values.length + 1);

    const querySql = `UPDATE users 
                    SET ${setCols} 
                    WHERE username = ${usernameVarIdx} 
                    RETURNING username,
                              first_name AS "firstName",
                              last_name AS "lastName",
                              email,
                              avatar_url AS "avatarURL"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete a user
   *
   * Returns { username }
   *
   * Throws NotFoundError if username not valid
   */

  static async delete(username) {
    const result = await db.query(
      `DELETE
        FROM users 
        WHERE username ILIKE $1
        RETURNING username`,
      [username]
    );

    const user = result.rows[0];
    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }
}

module.exports = User;
