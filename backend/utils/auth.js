const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

//generate a JWT token and save it in the cookie when the user is logged in or signed in
const setTokenCookie = (res, user) => {
  // Create the token.
  const safeUser = {
    id: user.id,
    email: user.email,
    username: user.username,
  };
  const token = jwt.sign(
    {data: safeUser},
    secret,
    {expiresIn: parseInt(expiresIn)}
  );

  const isProduction = process.env.NODE_ENV === "production";

  // Set the token cookie
  res.cookie('token', token, {
    maxAge: expiresIn * 1000,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction && "Lax"
  });

  return token;
};

// verify the identity of user using the JWT token stored in the cookie
// if the token is valid and the user is found in the database, store the user information in the req object
const restoreUser = (req, res, next) => {
  // token parsed from cookies
  const {token} = req.cookies;
  req.user = null;

  return jwt.verify(token, secret, null, async (error, jwtPayload) => {
    if (error) {
      return next();
    }

    try {
      const {id} = jwtPayload.data;
      req.user = await User.findByPk(id, {
        attributes: {
          include: ['email', 'createdAt', 'updatedAt']
        }
      });
    } catch (err) {
      res.clearCookie('token');
      return next();
    }

    if (!req.user) res.clearCookie('token');

    return next();
  });
};


// disallow the user to accessing a route if the user information is not stored in the req object
// which means that the user identity is not verified
const requireAuth = function (req, res, next) {
  if (req.user) {
    return next();
  }

  const err = new Error('Authentication required');
  err.title = 'Authentication required';
  err.errors = {message: 'Authentication required'};
  err.status = 401;
  return next(err);
}

module.exports = {
  setTokenCookie,
  restoreUser,
  requireAuth
};
