const express = require('express');
const router = new express.Router();
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config.js');
const ExpressError = require('../expressError.js');
const User = require('../models/user.js');

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (await User.authenticate(username, password)) {
      let token = jwt.sign({ username }, SECRET_KEY);
      User.updateLoginTimestamp(username);
      return res.json({ token });
    } else {
      throw new ExpressError('Invalid username/password', 400);
    }
  } catch (e) {
    next(e);
  }
});

/** POST /register - register User: registers, logs in, and returns token.
 *
 * {username, email, password, first_name, last_name} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
  try {
    const { username } = await User.register(req.body);
    let token = jwt.sign({ username }, SECRET_KEY);
    User.updateLoginTimestamp(username);
    return res.send({ token });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
