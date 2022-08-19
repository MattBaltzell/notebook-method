/** User  */

const db = require('../db');
const { NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

class StudentAssignment {
  /** Assign to student: Creates new studentAssignment
   *
   * Data needed: { assignmentID, studentID, dateDue }
   *
   * Returns { id, assignmentID, studentID, dateDue, dateAssigned }
   *
   * NotFoundError if bad assignment ID or bad student ID
   */

  static async assign({ assignmentID, studentID, dateDue }) {
    // Ensure valid student id
    const studentRes = await db.query(`SELECT id FROM students WHERE id=$1`, [
      studentID,
    ]);
    const student = studentRes.rows[0];

    if (!student) {
      throw new NotFoundError(`No student with id: ${studentID}`);
    }

    // Ensure valid assignment id
    const assignmentRes = await db.query(
      `SELECT id FROM assignments WHERE id=$1`,
      [assignmentID]
    );
    const assignment = assignmentRes.rows[0];

    if (!assignment) {
      throw new NotFoundError(`No assignment with id: ${assignmentID}`);
    }

    // Create assignment
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

  /** Given assignment id, get all studentAssignments for an assignment
   *
   * Returns [ { id, assignmentID, studentID, dateAssigned, dateDue, dateSubmitted, dateApproved, isSubmitted, isApproved }, ... ]
   *
   * NotFoundError if assignment not found
   */
  static async getAllForAssignment(id) {
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

    if (!assignments) throw new NotFoundError(`No assignment: ${id}`);

    return assignments;
  }

  /** Given a username, get all studentAssignments for that student
   *
   * Returns [{ id, assignmentID , studentID, dateAssigned, dateDue, dateSubmitted, dateApproved, isSubmitted, isApproved }, ... ]
   *
   * NotFoundError is user doesnt exist
   */

  static async getAllForStudent(username) {
    //  Check for valid username
    const userRes = await db.query(`SELECT id FROM users WHERE username=$1`, [
      username,
    ]);
    if (!userRes.rows[0]) throw new NotFoundError(`No student: ${username}`);

    //
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

  /** Get studentAssignment by id
   *
   *
   */
  static async get(id) {
    const result = await db.query(
      `SELECT id,
      assignment_id AS "assignmentID",
      student_id AS "studentID",
      date_assigned AS "dateAssigned",
      date_due AS "dateDue",
      date_submitted AS "dateSubmitted",
      date_approved AS "dateApproved",
      is_submitted AS "isSubmitted",
      is_approved AS "isApproved" 
      FROM students_assignments WHERE id=$1`,
      [id]
    );
    const studentAssignment = result.rows[0];
    if (!studentAssignment)
      throw new NotFoundError(`No student assignment: ${id}`);

    return studentAssignment;
  }

  /** Edit studentAssignment by id
   *
   * Data can include:
   *   { dateDue, dateSubmitted, dateApproved, isSubmitted, isApproved }
   *
   * Returns { id, assignmentID, studentID, dateAssigned, dateDue, dateSubmitted, dateApproved, isSubmitted, isApproved }
   *
   * NotFoundError if assignment not found
   */

  static async update(id, data) {
    // check if assignment id is valid
    const assignmentRes = await db.query(
      `SELECT id FROM students_assignments WHERE id=$1`,
      [id]
    );
    const assignment = assignmentRes.rows[0];

    if (!assignment) {
      throw new NotFoundError(`No student assignment: ${id}`);
    }

    // update studentAssignment
    const { setCols, values } = sqlForPartialUpdate(data, {
      teacherID: 'teacher_id',
      dateDue: 'date_due',
      dateSubmitted: 'date_submitted',
      dateApproved: 'date_approved',
      isSubmitted: 'is_submitted',
      isApproved: 'is_approved',
    });
    const assignmentIDVarIdx = '$' + (values.length + 1);
    const querySql = `UPDATE students_assignments 
    SET ${setCols} 
    WHERE id = ${assignmentIDVarIdx} 
    RETURNING id,
              assignment_id AS "assignmentID",
              student_id AS "studentID",
              date_assigned AS "dateAssigned",
              date_due AS "dateDue",
              date_submitted AS "dateSubmitted",
              date_approved AS "dateApproved",
              is_submitted AS "isSubmitted",
              is_approved AS "isApproved"`;
    const result = await db.query(querySql, [...values, assignment.id]);
    const studentAssignment = result.rows[0];

    return studentAssignment;
  }

  /** Delete studentAssignment by id
   *
   * Returns { Deleted: id }
   *
   * NotFoundError if assignment not found
   */

  static async delete(id) {
    const result = await db.query(
      `DELETE FROM students_assignments WHERE id=$1
      RETURNING id`,
      [id]
    );

    if (!result.rows[0])
      throw new NotFoundError(`No student assignment: ${id}`);

    return { deleted: id };
  }

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
   *
   * THIS MAY NOT BE NECESSARY ANY LONGER BECAUSE THE UPDATE METHOD WILL ACCOMPLISH THIS
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
