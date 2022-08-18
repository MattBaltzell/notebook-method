'use strict';

const request = require('supertest');

const app = require('../app');

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u3Token,
  a1Token,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /assignments/teacher/:username */

describe('GET /assignments/:username', function () {
  test('works', async function () {
    const resp = await request(app)
      .get('/assignments/u3')
      .set('authorization', `Bearer ${u3Token}`);
    expect(resp.body).toEqual({
      assignments: [
        {
          id: expect.any(Number),
          title: 'assignment1',
          subjectCode: 'MATH1',
          instructions: 'do assignment 1',
          teacherID: expect.any(Number),
        },
        {
          id: expect.any(Number),
          title: 'assignment2',
          subjectCode: 'SCI1',
          instructions: 'do assignment 2',
          teacherID: expect.any(Number),
        },
      ],
    });
  });
});
