const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

/** return signed JWT from user data. */

function createToken(user) {
  console.assert(
    user.userTypeID !== undefined,
    'createToken passed user without userTypeID property'
  );

  let payload = {
    username: user.username,
    userTypeID: user.userTypeID || 1,
    isAdmin: user.isAdmin,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
