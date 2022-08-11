const jsonschema = require('jsonschema');

const express = require('express');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} = require('../expressError');
4;
const userUpdateSchema = require('../schemas/userUpdate.json');
const User = require('../models/user');

const router = new express.Router();

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

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email, avatarURL }
 *
 * Returns { username, firstName, lastName, email, avatarURL }
 *
 * Authorization required: login
 **/

router.patch('/:username', ensureCorrectUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** Delete a user */
// Will need to add Auth middlewhere to ensure ADMIN ONLY access

router.delete('/:username', async (req, res, next) => {
  try {
    const result = await User.delete(req.params.username);
    if (!result.username) {
      throw new NotFoundError(
        `User with username of ${username} cannot be found.`
      );
    }
    return res.send({ message: 'Deleted.' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
