const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');

/** return signed JWT from user data. */

function createToken(user) {
  console.assert(
    user.isTeacher !== undefined,
    'createToken passed user without isTeacher property'
  );

  let payload = {
    username: user.username,
    isTeacher: user.isTeacher || false,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
