const express = require('express');
const { UnauthorizedError } = require('../expressError');
const { ensureTeacher } = require('../middleware/auth');
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const router = new express.Router();

/** Show all students for a given teacher*/

router.get('/', ensureTeacher, async function (req, res, next) {
  try {
    const { teacherID } = await Teacher.get(req.currentUser.username);
    const students = await Student.getAll(teacherID);
    return res.send({ students });
  } catch (err) {
    return next(err);
  }
});

/** Get student by username */

router.get('/:username', async (req, res, next) => {
  const username = req.params.username;
  try {
    const student = await Student.get(username);
    return res.send({ student });
  } catch (e) {
    return next(e);
  }
});

/** Create a student
 *
 * * Authorization required: Teacher
 */

router.post('/', ensureTeacher, async (req, res, next) => {
  try {
    const { teacherID } = await Teacher.get(req.currentUser.username);
    const { username, grade } = req.body;
    const student = await Student.add(username, teacherID, grade);
    return res.send({ student });
  } catch (err) {
    return next(err);
  }
});

/** Edit a student
 *
 * * Authorization required: Teacher
 */

router.patch('/:username', ensureTeacher, async (req, res, next) => {
  try {
    const data = req.body;
    const student = await Student.update(req.params.username, data);
    return res.send({ student });
  } catch (e) {
    next(e);
  }
});

/** Delete a student
 *
 * Authorization required: Teacher
 *
 * Student.teacherID must equal currentUser.teacherID and currentUser must be a teacher.
 */

router.delete('/:username', ensureTeacher, async (req, res, next) => {
  try {
    const { username } = req.params;
    const student = await Student.get(username);
    const teacher = await Teacher.get(req.currentUser.username);

    if (teacher.teacherID === student.teacherID) {
      await Student.delete(username);
      return res.send({ message: 'Deleted.' });
    } else {
      return next(
        new UnauthorizedError('You are not authorized to delete this student')
      );
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
