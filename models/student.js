/** Student  */

const db = require('../db');
const { NotFoundError } = require('../expressError');

class Student {
  /** get all students */
  static async getAll() {
    const results = await db.query(
      `SELECT 
          u.id AS "userID",
          s.id AS "studentID", 
          u.username,
          u.email,
          u.first_name AS "firstName", 
          u.last_name AS "lastName",
          u.user_type_id as "userTypeID",
          s.teacher_id AS "teacherID",
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
          u.id AS "userID",
          s.id AS "studentID", 
          u.username,
          u.email,
          u.first_name AS "firstName", 
          u.last_name AS "lastName",
          u.user_type_id AS "userTypeID",
          u.avatar_url AS "avatarURL",
          s.teacher_id AS "teacherID",
          s.grade
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

  static async add({ userID, teacherID, grade }) {
    const results = await db.query(
      `INSERT INTO students (
        user_id, 
        teacher_id,  
        grade) 
        VALUES ($1, $2, $3) 
        RETURNING id, user_id AS "userID", teacher_id AS "teacherID", grade`,
      [userID, teacherID, grade]
    );

    // Need to add error handling for when student already exists

    return results.rows[0];
  }

  /** update a student */
  static async update({ id, teacherID, grade }) {
    const results = await db.query(
      `UPDATE students 
        SET
          teacher_id = $1,  
          grade = $2 
        WHERE id = $3
        RETURNING id, teacher_id AS "teacherID", grade`,
      [teacherID, grade, id]
    );

    return results.rows[0];
  }

  /** delete a student */
  static async delete(studentID) {
    const results = await db.query(
      `DELETE
          FROM students
          WHERE id = $1
          RETURNING id
          `,
      [studentID]
    );
    if (!results.rows[0]) throw new NotFoundError('Student not found.');
    return results.rows[0];
  }
}

module.exports = Student;
