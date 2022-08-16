const express = require('express');

const router = new express.Router();
const StudentAssignment = require('../models/studentAssignment');
const {
  ensureLoggedIn,
  ensureTeacher,
  ensureCorrectUser,
} = require('../middleware/auth');

/** Get list of all assignments for a student */

router.get('/:username', ensureCorrectUser, async (req, res, next) => {
  try {
    const studentAssignments = await StudentAssignment.getAll(
      req.params.username
    );
    return res.send({ studentAssignments });
  } catch (err) {
    return next(err);
  }
});

/** Get student assignment based on id. */

router.get('/:username/:id', ensureCorrectUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentAssignment = await StudentAssignment.get(id);
    return res.send({ studentAssignment });
  } catch (err) {
    return next(err);
  }
});

router.patch('/:username/:id', ensureCorrectUser, async (req, res, next) => {
  try {
    const data = req.body;
    const studentAssignment = await StudentAssignment.update(
      req.params.id,
      data
    );
    return res.send({ studentAssignment });
  } catch (err) {
    return next(err);
  }
});

/** Assign to Student */

router.post('/:id', ensureTeacher, async (req, res, next) => {
  try {
    const user = req.currentUser;
    console.log(user);
    const assignmentID = req.params.id;
    const { studentID, dateDue } = req.body;
    const studentAssignment = await StudentAssignment.assign({
      assignmentID,
      studentID,
      dateDue,
    });
    return res.send({ studentAssignment });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
