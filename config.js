/** Common config for message.ly */

// read .env files and make environmental variables

require('dotenv').config();

const DB_URI =
  process.env.NODE_ENV === 'test'
    ? 'postgresql:///homeschool-helper_test'
    : 'postgresql:///homeschool-helper';

const SECRET_KEY =
  process.env.SECRET_KEY ||
  '_72,[n@l1N{zXGnnmpot~k>JgIjZz96TrJG*T`a0lxVej"-G2}6N/"~Jz)mMcnY';

const BCRYPT_WORK_FACTOR = 12;

module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};
