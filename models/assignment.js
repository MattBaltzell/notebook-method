/** Assignment  */

const db = require('../db');
const { NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

class Assignment {
  /** Create new assignment with data
   *
   * Returns { id, title, subjectCode, instructions, teacherID }
   *
   * NotFoundError if teacher not found
   */

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
   * Returns [ { id, title, instructions, teacherID, subjectCode }, ... ]
   *
   * NotFoundError if teacher not found
   */
  static async getAllForTeacher(username) {
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

    if (!assignments) throw new NotFoundError(`No teacher: ${username}`);

    return assignments;
  }

  /** Get assignments by id
   *
   * Returns { id, title, instructions, teacherID, subjectCode }
   *
   * NotFoundError if assignment not found
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

  /** Update assignments by id
   *
   * Data can include:
   *   { title, instructions, subjectCode }
   *
   * Returns { id, title, instructions, subjectCode, teacherID }
   */
  static async update(id, data) {
    // Check if subject code exists
    if (data.subjectCode) {
      const subject = await db.query(
        `SELECT code FROM subjects WHERE code=$1`,
        [data.subjectCode]
      );
      if (!subject.rows[0])
        throw new NotFoundError(`No subject code: ${data.subjectCode}`);
    }

    // update assignment
    const { setCols, values } = sqlForPartialUpdate(data, {
      subjectCode: 'subject_code',
    });
    const assignmentIDVarIdx = '$' + (values.length + 1);
    const querySql = `UPDATE assignments 
  SET ${setCols} 
  WHERE id = ${assignmentIDVarIdx} 
  RETURNING id,
            title,
            instructions,
            subject_code AS "subjectCode",
            teacher_id AS "teacherID"
            `;
    const result = await db.query(querySql, [...values, id]);
    const updatedAssignment = result.rows[0];

    if (!updatedAssignment) throw new NotFoundError(`No assignment: ${id}`);

    return updatedAssignment;
  }

  /** Delete assignments by id
   *
   * Returns { deleted: id }
   *
   * NotFoundError if assignment doesnt exist
   */

  static async delete(id) {
    const result = await db.query(
      `DELETE FROM assignments WHERE id=$1 RETURNING id`,
      [id]
    );
    if (!result.rows[0]) throw new NotFoundError(`No assignment: ${id}`);

    return { deleted: id };
  }
}

module.exports = Assignment;
