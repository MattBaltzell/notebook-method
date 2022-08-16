/** Middleware for handling req authorization for routes. */

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const { UnauthorizedError } = require('../expressError');
const User = require('../models/user');

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, '').trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
      req.currentUser = res.locals.user;
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be logged in as an Admin.
 *
 * If not, raises Unauthorized.
 */

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || res.locals.user.isAdmin === false)
      throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware: Requires correct username.
 *
 * If not, raises Unauthorized.
 */

function ensureCorrectUser(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError('Not logged In');
    if (
      res.locals.user.username !== req.params.username &&
      res.locals.user.isAdmin === false
    ) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware: Requires correct username or teacher of user with correct username
 *
 * If not, raises Unauthorized.
 */

async function ensureCorrectUserOrTeacher(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    let teacher;
    let student;

    const user = await User.get(req.params.username);

    if (res.locals.user.userTypeID === 2) {
      teacher = await Teacher.get(res.locals.user.username);
    }
    if (user.userTypeID === 3) {
      student = await Student.get(req.params.username);
    }
    if (
      res.locals.user.username !== req.params.username &&
      res.locals.user.isAdmin === false &&
      teacher.teacherID !== student.teacherID
    ) {
      throw new UnauthorizedError();
    }

    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware: Requires user's userTypeId to be 2 for teacher.
 *
 * If not, raises Unauthorized.
 */

function ensureTeacher(req, res, next) {
  try {
    if (res.locals.user.userTypeID !== 2) {
      throw new UnauthorizedError('You are not logged into a Teacher account.');
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUser,
  ensureCorrectUserOrTeacher,
  ensureTeacher,
};
