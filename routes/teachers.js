const express = require('express');

const router = new express.Router();
const Teacher = require('../models/teacher');
const User = require('../models/user');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const { NotFoundError } = require('../expressError');

/** Get list of all teachers. */

router.get('/', async (req, res, next) => {
  try {
    const teachers = await Teacher.getAll();
    return res.send({ teachers });
  } catch (err) {
    return next(err);
  }
});

/** Get teacher info. */

router.get('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const teacher = await Teacher.get(username);
    return res.send({ teacher });
  } catch (err) {
    return next(err);
  }
});

/** Add teacher */

router.post('/', async (req, res, next) => {
  try {
    const { username } = req.body;
    const teacher = await Teacher.add(username);
    return res.send({ teacher });
  } catch (err) {
    return next(err);
  }
});

/** Delete teacher */

router.delete('/:username', async (req, res, next) => {
  try {
    const result = await Teacher.delete(req.params.username);
    if (!result.userID) {
      throw new NotFoundError(`No teacher: ${req.params.username}.`);
    }

    return res.send({ message: 'Deleted.' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
