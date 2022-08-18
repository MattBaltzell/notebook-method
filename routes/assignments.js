const express = require('express');

const router = new express.Router();
const Assignment = require('../models/assignment');
const { ensureCorrectUser, ensureTeacher } = require('../middleware/auth');

/** GET /[username] => { [assignment, assignment, assignment, ...] }
 *
 * Get list of all assignments for a teacher.
 *
 * Returns  { assignments: [ {id,title,instructions, teacherID, subjectCode }, ... ] }
 *
 * Auth = correct user
 * */

router.get('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    const assignments = await Assignment.getAllForTeacher(req.params.username);
    return res.send({ assignments });
  } catch (err) {
    return next(err);
  }
});

/** Get assignment by id
 *
 * NOT SURE IF THIS IS THE BEST PLACE FOR THIS ROUTE
 */

router.get('/:username/:id', ensureCorrectUser, async (req, res, next) => {
  try {
    const assignment = await Assignment.get(req.params.id);
    const studentAssignments = await Assignment.getStudentAssignments(
      req.params.id
    );
    assignment.studentAssignments = studentAssignments;
    return res.send({ assignment });
  } catch (err) {
    return next(err);
  }
});

/** Create Assignment */

router.post('/', ensureTeacher, async (req, res, next) => {
  try {
    const { title, subjectCode, instructions, teacherID } = req.body;
    const assignment = await Assignment.create({
      title,
      subjectCode,
      instructions,
      teacherID,
    });
    return res.send({ assignment });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
