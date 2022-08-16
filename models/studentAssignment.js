/** User  */

const db = require('../db');
const {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} = require('../expressError');

class StudentAssignment {
  /** Assign to student: Creates new studentAssignment */

  static async assign({ assignmentID, studentID, dateDue }) {
    const studentRes = await db.query(`SELECT id FROM students WHERE id=$1`, [
      studentID,
    ]);
    const student = studentRes.rows[0];

    if (!student) {
      throw new NotFoundError(`No student with id: ${studentID}`);
    }

    const result = await db.query(
      `INSERT INTO students_assignments (
          assignment_id,
          student_id,
          date_due,
          date_assigned
          ) 
        VALUES ( $1, $2, $3, CURRENT_TIMESTAMP ) 
        RETURNING 
          id,
          assignment_id AS "assignmentID",
          student_id AS "studentID",
          date_due AS "dateDue",
          date_assigned AS "dateAssigned"
          `,
      [assignmentID, studentID, new Date(dateDue)]
    );

    const studentAssignment = result.rows[0];

    return studentAssignment;
  }

  /** Get all studentAssignments for a student
   *
   *
   */
  static async getAll(username) {
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
      
      WHERE student_id = 
      (SELECT students.id from students 
        JOIN users 
        ON students.user_id=users.id 
        WHERE username=$1)
        ORDER BY date_due`,
      [username]
    );
    const studentAssignments = result.rows;

    return studentAssignments;
  }

  /** Get studentAssignment based on id
   *
   *
   */
  static async get(id) {
    const result = await db.query(
      `SELECT * FROM students_assignments WHERE id=$1`,
      [id]
    );
    const studentAssignment = result.rows[0];

    return studentAssignment;
  }

  /** Edit studentAssignment
   *
   *
   */

  //////////////////////////////////////////////////////////////

  /** Submit assignment
   *
   *
   * Adds date to dateSubmitted
   * Sets isSubmitted to true
   * Returns { id }
   *
   * (Future) Notifies Teacher of submission
   *
   * notFoundError if assignmentID invalid
   *
   * Authorization: Logged In
   * ( User's studentID must equal assignedTo )
   *
   */

  static async toggleSubmit(id) {
    const submitQuery = ` 
    UPDATE students_assignments
    SET date_submitted=CURRENT_TIMESTAMP, is_submitted=true
    WHERE id=$1
    RETURNING id, is_submitted AS "isSubmitted"
    `;

    const unsubmitQuery = ` 
    UPDATE students_assignments
    SET date_submitted=null, is_submitted=false
    WHERE id=$1
    RETURNING id, is_submitted AS "isSubmitted"
    `;

    const isSubmittedRes = await db.query(
      `SELECT is_submitted AS "isSubmitted" FROM students_assignments WHERE id=$1`,
      [id]
    );

    // check if valid assignmentID
    if (isSubmittedRes.rows.length === 0) {
      throw new NotFoundError(`Student Assignment ${id} not found.`);
    }

    const { isSubmitted } = isSubmittedRes.rows[0];
    const result = await db.query(isSubmitted ? unsubmitQuery : submitQuery, [
      id,
    ]);
    const assignment = result.rows[0];

    return assignment;
  }
}

module.exports = StudentAssignment;
