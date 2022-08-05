/** Student  */

const db = require('../db');
const ExpressError = require('../expressError');

class Student {
  /** get all students */
  static async getAll() {
    const results = await db.query(
      `SELECT 
          u.id AS user_id,
          s.id AS student_id, 
          u.username,
          u.email,
          u.first_name,
          u.last_name,
          u.user_type_id,
          s.teacher_id,
          s.grade
        FROM users AS u
        JOIN students AS s
          ON s.user_id = u.id
        ORDER BY grade;
  `
    );

    return results.rows;
  }

  /** get student by username */
  static async get(username) {
    const results = await db.query(
      `SELECT 
          u.id AS user_id,
          s.id AS student_id, 
          u.password,
          u.username,
          u.email,
          u.first_name,
          u.last_name,
          u.user_type_id,
          u.avatar_url,
          s.teacher_id,
          s.grade
        FROM users AS u
        JOIN students AS s
          ON s.user_id = u.id
        WHERE u.username=$1
        `,
      [username]
    );

    if (!results.rows[0]) {
      throw new ExpressError(`Student not found`, 404);
    }
    return results.rows[0];
  }

  static async add({ user_id, teacher_id, grade }) {
    const results = await db.query(
      `INSERT INTO students (
        user_id, 
        teacher_id,  
        grade) 
        VALUES ($1, $2, $3) 
        RETURNING id, user_id, teacher_id, grade`,
      [user_id, teacher_id, grade]
    );

    // Need to add error handling for when student already exists

    return results.rows[0];
  }

  /** update a student */
  static async update({ id, teacher_id, grade }) {
    const results = await db.query(
      `UPDATE students 
        SET
          teacher_id = $1,  
          grade = $2 
        WHERE id = $3
        RETURNING id, teacher_id, grade`,
      [teacher_id, grade, id]
    );

    return results.rows[0];
  }

  /** delete a student */
  static async delete(id) {
    const results = await db.query(
      `DELETE
          FROM students
          WHERE id = $1
          RETURNING id
          `,
      [id]
    );

    return results.rows[0];
  }
}

module.exports = Student;
