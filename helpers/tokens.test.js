const jwt = require('jsonwebtoken');
const { createToken } = require('./tokens');
const { SECRET_KEY } = require('../config');

describe('createToken', function () {
  test('works: teacher', function () {
    const token = createToken({ username: 'test', userTypeID: 2 });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: 'test',
      userTypeID: 2,
    });
  });

  test('works: student', function () {
    const token = createToken({ username: 'test', userTypeID: 3 });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: 'test',
      userTypeID: 3,
    });
  });

  test('works: default unassigned user type', function () {
    const token = createToken({ username: 'test' });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: 'test',
      userTypeID: 1,
    });
  });
});
