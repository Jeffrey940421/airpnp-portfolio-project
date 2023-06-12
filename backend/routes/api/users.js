const express = require('express');
const bcrypt = require('bcryptjs');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const router = express.Router();

const checkUserExistence = async (req, res, next) => {
  const {username, email} = req.body;

  const userByUsername = await User.findOne({
    where: {username}
  });

  const userByEmail = await User.findOne({
    where: {email}
  });

  if (userByUsername || userByEmail) {
    const err = Error("User already exists.");
    const errors = {};
    errors.username = userByUsername ? "User with that username already exists" : undefined;
    errors.email = userByEmail ? "User with that email already exists" : undefined;
    err.errors = errors;
    err.title = "Bad Request";
    next(err);
  }

  next();
}

const validateSignup = [
  check('firstName')
    .exists({checkFalsy: true})
    .isLength({min: 1, max: 30})
    .withMessage('Please provide a first name with at least 1 character and no more than 30 characters'),
  check('firstName')
    .isAlpha()
    .withMessage('First name must be alphabetic'),
  check('firstName')
    .custom(value => {
      if (value[0].toUpperCase() + value.slice(1).toLowerCase() !== value) {
        return false;
      }
      return true;
    })
    .withMessage('Please provide a capitalized first name'),
  check('lastName')
    .exists({checkFalsy: true})
    .isLength({min: 1, max: 30})
    .withMessage('Please provide a last name with at least 1 character and no more than 30 characters'),
  check('lastName')
    .isAlpha()
    .withMessage('Last name must be alphabetic'),
  check('lastName')
    .custom(value => {
      if (value[0].toUpperCase() + value.slice(1).toLowerCase() !== value) {
        return false;
      }
      return true;
    })
    .withMessage('Please provide a capitalized last name'),
  check('email')
    .exists({checkFalsy: true})
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('email')
    .isLength({min: 3, max: 256})
    .withMessage('Please provide an email with at least 3 characters and no more than 256 characters'),
  check('username')
    .exists({checkFalsy: true})
    .isLength({min: 4, max: 30})
    .withMessage('Please provide a username with at least 4 characters and no more than 30 characters'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email'),
  check('password')
    .exists({checkFalsy: true})
    .isLength({min: 6})
    .withMessage('Password must be 6 characters or more'),
  handleValidationErrors,
  checkUserExistence
];


// sign up
router.post('/', validateSignup, async (req, res) => {
    const {email, firstName, lastName, password, username} = req.body;
    const hashedPassword = bcrypt.hashSync(password);
    const user = await User.create({email, firstName, lastName, username, hashedPassword});

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };

    setTokenCookie(res, safeUser);

    return res.json({
      user: safeUser
    });
  }
);

module.exports = router;
