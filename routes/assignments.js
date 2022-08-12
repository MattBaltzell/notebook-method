const express = require('express');

const router = new express.Router();
const Teacher = require('../models/teacher');
const Assignment = require('../models/assignment');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');

/** Get list of all assignments for a teacher. */

router.get('/', async (req, res, next) => {
  try {
    // Start: this will need to change to use ensureTeacher Middleware
    const { teacherID } = req.body;
    // End
    const assignments = await Assignment.getAll(teacherID);
    return res.send({ assignments });
  } catch (err) {
    return next(err);
  }
});

/** Get assignment by id */

router.get('/:id', async (req, res, next) => {
  try {
    const assignment = await Assignment.get(req.params.id);
    return res.send({ assignment });
  } catch (err) {
    return next(err);
  }
});

/** Create Assignment */

router.post('/', async (req, res, next) => {
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
