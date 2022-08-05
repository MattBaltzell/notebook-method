const express = require('express');

const router = new express.Router();
const Teacher = require('../models/teacher');
const User = require('../models/user');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');

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
    const teacher = await Teacher.add(req.body);
    await Teacher.updateUserType(teacher);
    return res.send({ teacher });
  } catch (err) {
    return next(err);
  }
});

/** Delete teacher */

router.delete('/:username', async (req, res, next) => {
  try {
    const teacher = await Teacher.get(req.params.username);
    const result = await Teacher.delete(teacher.teacher_id);
    if (!result.id) {
      throw new ExpressError(`Teacher with id of ${id} cannot be found.`, 400);
    }
    await User.updateUserType(1, teacher.user_id);
    return res.send({ message: 'Deleted.' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
