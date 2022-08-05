const express = require('express');
const router = new express.Router();
const User = require('../models/user');

/** Show all users */

router.get('/', async function (req, res, next) {
  try {
    const users = await User.getAll();
    return res.send({ users });
  } catch (err) {
    return next(err);
  }
});

/** Get student by username */

router.get('/:username', async (req, res, next) => {
  const username = req.params.username;
  try {
    const user = await User.get(username);
    return res.send({ user });
  } catch (e) {
    return next(e);
  }
});

/** Edit a user */
// Will need to add Auth middlewhere to ensure CORRECT USER ONLY access

router.put('/:username', async (req, res, next) => {
  try {
    const user = await User.update(req.body);
    return res.send({ user });
  } catch (e) {
    next(e);
  }
});

/** Delete a user */
// Will need to add Auth middlewhere to ensure ADMIN ONLY access

router.delete('/:username', async (req, res, next) => {
  try {
    const result = await User.delete(req.params.username);
    if (!result.username) {
      throw new ExpressError(
        `User with username of ${username} cannot be found.`,
        400
      );
    }
    return res.send({ message: 'Deleted.' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
