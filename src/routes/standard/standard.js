const express = require("express");
const standard = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

const db = require("../../lib/db.js");
const { validateRegister, isLoggedIn } = require("../../middleware/users.js");
const { auth } = require("../../middleware/auth.js");

let refreshTokens = [];

module.exports = standard;

/**
 * A protected route that requires authentication.
 * @name POST /protected
 * @function
 * @memberof module:standard
 * @inner
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} - The HTTP response object containing a message indicating that the user is inside the protected route.
 */
standard.post("/protected", auth, (req, res) => {
  res.send("Inside protected route");
});

/**
 * Renews the access token using the refresh token.
 * @name POST /renewAccessToken
 * @function
 * @memberof module:standard
 * @inner
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body object containing the refresh token.
 * @param {string} req.body.token - The refresh token.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} - The HTTP response object containing the renewed access token.
 */
standard.post("/renewAccessToken", (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res.status(403).send({
      message: "User not authenticated!",
    });
  }

  jwt.verify(refreshToken, "refresh", (err, user) => {
    if (!err) {
      const accessToken = jwt.sign({ user }, "access", { expiresIn: "40s" });
      return res.status(201).send({
        accessToken,
      });
    } else {
      return res.status(403).send({
        message: "User not authorized!",
      });
    }
  });
});

/**
 * Registers a new user.
 * @name POST /sing-up
 * @function
 * @memberof module:standard
 * @inner
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body object containing the user's information.
 * @param {string} req.body.username - The user's username.
 * @param {string} req.body.email - The user's email.
 * @param {string} req.body.password - The user's password.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} - The HTTP response object containing a message indicating that the user has been registered.
 */
standard.post("/sing-up", validateRegister, (req, res, next) => {
  let sql = `SELECT * FROM users WHERE UCASE(username) = UCASE('${req.body.username}')`;
  db.query(sql, (err, result) => {
    console.log(result);
    if (result.length > 0) {
      return res.status(409).send({
        message: "Username already registered!",
      });
    } else {
      let sql = `SELECT * FROM users WHERE UCASE(email) = UCASE('${req.body.email}')`;
      db.query(sql, (err, result) => {
        if (result.length > 0) {
          return res.status(409).send({
            message: "Email already registered!",
          });
        } else {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              throw err;
              return res.status(500).send({
                message: err,
              });
            } else {
              let sql = `INSERT INTO users (id, username, email, password, registered) VALUES ('${uuid.v4()}','${
                req.body.username
              }', '${req.body.email}', '${hash}', now());`;
              db.query(sql, (err, result) => {
                console.log(result);
                if (err) {
                  throw err;
                  return res.status(400).send({
                    message: err,
                  });
                }
                return res.status(201).send({
                  message: "Registered!",
                });
              });
            }
          });
        }
      });
    }
  });
});

/**
 * Logs in a user.
 * @name POST /login
 * @function
 * @memberof module:standard
 * @inner
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.body - The request body object containing the user's email and password.
 * @param {string} req.body.email - The user's email.
 * @param {string} req.body.password - The user's password.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} - The HTTP response object containing a message indicating that the user has been logged in, the access token, and the refresh token.
 */
standard.post("/login", (req, res, next) => {
  let sql = `SELECT * FROM users WHERE UCASE(email) = UCASE('${req.body.email}');`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
      return res.status(400).send({
        message: err,
      });
    }
    if (!result.length) {
      return res.status(400).send({
        message: "Email is incorrect!",
      });
    }

    bcrypt.compare(
      req.body.password,
      result[0]["password"],
      (bErr, bresult) => {
        if (bErr) {
          throw bErr;
          return res.status(400).send({
            message: "Password is incorrect!",
          });
        }
        if (bresult) {
          let accessToken = jwt.sign(
            {
              userId: result[0].id,
              userName: result[0].username,
              userEmail: result[0].email,
            },
            "access",
            { expiresIn: "40s" }
          );

          /**
           * Generates a refresh token using the user's ID, username, and email.
           *
           * @param {Object} result - The result object containing the user's information.
           * @param {number} result.id - The user's ID.
           * @param {string} result.username - The user's username.
           * @param {string} result.email - The user's email.
           * @returns {string} - The generated refresh token.
           */
          let refreshToken = jwt.sign(
            {
              userId: result[0].id,
              userName: result[0].username,
              userEmail: result[0].email,
            },
            "refresh",
            { expiresIn: "1d" }
          );
          let sql = `UPDATE users SET last_login = now() WHERE id = '${result[0].id}';`;
          db.query(sql);

          refreshTokens.push(refreshToken);

          return res.status(200).send({
            message: "Logged in!",
            accessToken,
            refreshToken,
          });
        }
        return res.status(400).send({
          message: "Email or password is incorrect!",
        });
      }
    );
  });
});

/**
 * A secret route that requires the user to be logged in.
 * @name GET /secret-route
 * @function
 * @memberof module:standard
 * @inner
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.userData - The user data object containing the user's ID, username, and email.
 * @param {number} req.userData.userId - The user's ID.
 * @param {string} req.userData.userName - The user's username.
 * @param {string} req.userData.userEmail - The user's email.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} - The HTTP response object containing the user data.
 */
standard.get("/secret-route", isLoggedIn, (req, res, next) => {
  res.send(req.userData);
});
