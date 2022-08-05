/** Express app. */

const express = require('express');
const cors = require('cors');
const { authenticateJWT } = require('./middleware/auth');

const app = express();
app.use(express.json());

// allow connections to all routes from any browser
app.use(cors());

// get auth token for all routes
app.use(authenticateJWT);

/** routes */
const authRoutes = require('./routes/auth');
const teacherRoutes = require('./routes/teachers');
const studentRoutes = require('./routes/students');
const userRoutes = require('./routes/users');

app.use('/auth', authRoutes);
app.use('/teachers', teacherRoutes);
app.use('/students', studentRoutes);
app.use('/users', userRoutes);

/** 404 handler */

app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.send({ err });
});

module.exports = app;
