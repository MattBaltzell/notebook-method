const jsonschema = require('jsonschema');

const express = require('express');
const { ensureAdmin, ensureCorrectUser } = require('../middleware/auth');
const { NotFoundError, BadRequestError } = require('../expressError');
const { createToken } = require('../helpers/tokens');
const userUpdateSchema = require('../schemas/userUpdate.json');
const userNewSchema = require('../schemas/userNew.json');
const User = require('../models/user');

const router = new express.Router();

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post('/', ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

/** Show all users */

router.get('/', ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.getAll();
    return res.send({ users });
  } catch (err) {
    return next(err);
  }
});

/** Get user by username */
/** GET /[username] { user } => { user }
 *
 * Returns { id, username, email, firstName, lastName, userTypeID, avatarURL,joinAt, lastLoginAt, isAdmin }
 *
 * Authorization required: login
 **/

router.get('/:username', ensureCorrectUser, async (req, res, next) => {
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

router.delete('/:username', ensureCorrectUser, async (req, res, next) => {
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
