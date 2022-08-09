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
  /** register new user */

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

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
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

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users SET last_login_at=NOW() WHERE username=$1
      RETURNING username, last_login_at AS "lastLoginAt"`,
      [username]
    );
    const user = result.rows[0];
    if (!user) throw new NotFoundError(`No user with username of ${username}`);
  }

  static async updateUserType(userTypeID, userID) {
    const result = await db.query(
      `UPDATE users
        SET user_type_id=$1
        WHERE id=$2
        RETURNING id, user_type_id AS "userTypeID"`,
      [userTypeID, userID]
    );

    const user = result.rows[0];
    if (!user) throw new NotFoundError(`No user with userID of ${userID}`);
  }

  /** get all users */
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

  /** get user by username */
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
   *   { firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
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

  /** delete a user */
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
