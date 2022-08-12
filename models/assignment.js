/** User  */

const db = require('../db');
const {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} = require('../expressError');

class Assignment {
  /** Create new assignment */

  static async create({
    title,
    subjectCode,
    instructions,
    studentID,
    teacherID,
    dueDate,
  }) {
    const studentRes = await db.query(`SELECT id FROM students WHERE id=$1`, [
      studentID,
    ]);
    const student = studentRes.rows[0];

    if (!student) {
      throw new NotFoundError(`No student with id: ${studentID}`);
    }

    const result = await db.query(
      `INSERT INTO assignments (
        title,
        subject_code,
        instructions,
        assigned_to,
        assigned_by,
        date_assigned,
        date_due
        ) 
      VALUES ( $1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6 ) 
      RETURNING 
        id,
        title,
        subject_code AS "subjectCode",
        instructions,
        assigned_to AS "assignedTo",
        assigned_by AS "assignedBy",
        date_assigned AS "dateAssigned",
        date_due AS "dateDue"
        `,
      [title, subjectCode, instructions, studentID, teacherID, dueDate]
    );

    const assignment = result.rows[0];

    return assignment;
  }

  /** Edit assignment
   *
   * Authorization: Teacher
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

  static async toggleSubmit(assignmentID) {
    const submitQuery = ` 
    UPDATE assignments
    SET date_submitted=CURRENT_TIMESTAMP, is_submitted=true
    WHERE id=$1
    RETURNING id, is_submitted AS "isSubmitted"
    `;

    const unsubmitQuery = ` 
    UPDATE assignments
    SET date_submitted=null, is_submitted=false
    WHERE id=$1
    RETURNING id, is_submitted AS "isSubmitted"
    `;

    const isSubmittedRes = await db.query(
      `SELECT is_submitted AS "isSubmitted" FROM assignments WHERE id=$1`,
      [assignmentID]
    );

    // check if valid assignmentID
    if (!isSubmittedRes.rows[0]) {
      throw new NotFoundError(`Assignment ${assignmentID} not found.`);
    }

    const { isSubmitted } = isSubmittedRes.rows[0];
    const result = await db.query(isSubmitted ? unsubmitQuery : submitQuery, [
      assignmentID,
    ]);
    const assignment = result.rows[0];

    return assignment;
  }
}

module.exports = Assignment;
