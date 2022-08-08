const express = require('express');
const router = new express.Router();
const Student = require('../models/student');
const User = require('../models/user');

/** Show all students */

router.get('/', async function (req, res, next) {
  try {
    const students = await Student.getAll();
    return res.send({ students });
  } catch (err) {
    return next(err);
  }
});

/** Get student by username */

router.get('/:username', async (req, res, next) => {
  const username = req.params.username;
  try {
    const student = await Student.get(username);
    return res.send({ student });
  } catch (e) {
    return next(e);
  }
});

/** Create a student */
// Will need to add Auth middlewhere to ensure TEACHER ONLY access

router.post('/', async (req, res, next) => {
  try {
    const { userID, teacherID, grade } = req.body;
    const student = await Student.add({ userID, teacherID, grade });
    await User.updateUserType(3, userID);
    return res.send({ student });
  } catch (err) {
    return next(err);
  }
});

// router.post('/', ensureTeacher, async (req, res, next) => {
//   try {
//     const teacher = await Teacher.get(req.user.username);
//     const { user_id, grade } = req.body;
//     const student = await Student.add({
//       user_id,
//       teacher_id: teacher.id,
//       grade,
//     });
//     return res.send({ student });
//   } catch (err) {
//     return next(err);
//   }
// });

/** Edit a student */
// Will need to add Auth middlewhere to ensure CORRECT USER ONLY access

router.put('/:username', async (req, res, next) => {
  try {
    const { student_id } = await Student.get(req.params.username);
    const { teacher_id, grade } = req.body;
    const student = await Student.update({ id: student_id, teacher_id, grade });
    return res.send({ student });
  } catch (e) {
    next(e);
  }
});

/** Delete a student */
// Will need to add Auth middlewhere to ensure ADMIN ONLY access

router.delete('/:username', async (req, res, next) => {
  try {
    const student = await Student.get(req.params.username);
    const result = await Student.delete(student.studentID);
    if (!result.id) {
      throw new ExpressError(`Student with id of ${id} cannot be found.`, 400);
    }
    await User.updateUserType(1, student.userID);
    return res.send({ message: 'Deleted.' });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
