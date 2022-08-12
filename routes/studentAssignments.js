const express = require('express');

const router = new express.Router();
const Teacher = require('../models/teacher');
const Assignment = require('../models/assignment');
const {
  ensureLoggedIn,
  ensureTeacher,
  ensureCorrectUser,
} = require('../middleware/auth');

/** Get list of all student assignments. */

router.get('/', async (req, res, next) => {
  try {
    const studentAssignments = await Assignment.getAllStudentAssignments();
    return res.send({ studentAssignments });
  } catch (err) {
    return next(err);
  }
});

/** Get student assignment based on id. */

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentAssignment = await Assignment.getStudentAssignment(id);
    return res.send({ studentAssignment });
  } catch (err) {
    return next(err);
  }
});

/** Assign to Student */

router.post('/:assignmentID', async (req, res, next) => {
  try {
    const { assignmentID } = req.params;
    const { studentID, dateDue } = req.body;
    const studentAssignment = await Assignment.assign(
      assignmentID,
      studentID,
      dateDue
    );
    return res.send({ studentAssignment });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
