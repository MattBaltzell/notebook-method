'use strict';

/** Express app. */

const express = require('express');
const cors = require('cors');

const { NotFoundError } = require('./expressError');

const { authenticateJWT } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const teacherRoutes = require('./routes/teachers');
const studentRoutes = require('./routes/students');
const userRoutes = require('./routes/users');

const app = express();

app.use(express.json());
app.use(cors());
app.use(authenticateJWT);

app.use('/auth', authRoutes);
app.use('/teachers', teacherRoutes);
app.use('/students', studentRoutes);
app.use('/users', userRoutes);

/** Handle 404 errors */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== 'test') console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
