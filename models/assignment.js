/** User  */

const db = require('../db');
const {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} = require('../expressError');

class Assignment {
  /** Create new assignment */

  static async create({ title, subjectCode, instructions, teacherID }) {
    const teacherRes = await db.query(`SELECT id FROM teachers WHERE id=$1`, [
      teacherID,
    ]);
    const teacher = teacherRes.rows[0];

    if (!teacher) {
      throw new NotFoundError(`No teacher with id: ${teacherID}`);
    }

    const result = await db.query(
      `INSERT INTO assignments (
        title,
        subject_code,
        instructions,
        teacher_id
        ) 
      VALUES ( $1, $2, $3, $4 ) 
      RETURNING 
        id,
        title,
        subject_code AS "subjectCode",
        instructions,
        teacher_id AS "teacherID"
        `,
      [title, subjectCode, instructions, teacherID]
    );

    const assignment = result.rows[0];

    return assignment;
  }

  /** Get all assignments for a given teacher
   *
   *
   */
  static async getAll(username) {
    const result = await db.query(
      `SELECT 
        id, 
        title,  
        instructions, 
        teacher_id AS "teacherID", 
        subject_code AS "subjectCode" 
      FROM assignments
      WHERE teacher_id = 
      (SELECT t.id FROM teachers AS t
        JOIN users AS u
        ON t.user_id = u.id
        WHERE u.username ILIKE $1)`,
      [username]
    );
    const assignments = result.rows;

    return assignments;
  }

  /** Get assignments by id
   *
   *
   */
  static async get(id) {
    const result = await db.query(
      `SELECT 
        id, 
        title,  
        instructions, 
        teacher_id AS "teacherID", 
        subject_code AS "subjectCode" 
      FROM assignments 
      WHERE id=$1`,
      [id]
    );
    const assignment = result.rows[0];

    return assignment;
  }

  static async getStudentAssignments(id) {
    const result = await db.query(
      `SELECT 
        id,
        assignment_id AS "assignmentID",
        student_id AS "studentID",
        date_assigned AS "dateAssigned",
        date_due AS "dateDue",
        date_submitted AS "dateSubmitted",
        date_approved AS "dateApproved",
        is_submitted AS "isSubmitted",
        is_approved AS "isApproved"
      FROM students_assignments
      WHERE assignment_id=$1
      ORDER BY date_due`,
      [id]
    );
    const assignments = result.rows;
    return assignments;
  }

  /** Update assignments by id
   *
   *
   */

  /** Delete assignments by id
   *
   *
   */
}

module.exports = Assignment;
