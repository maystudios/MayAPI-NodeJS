const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

const db = require("../lib/db.js");
const { validateRegister, isLoggedIn } = require("../middleware/users.js");

module.exports = router;

router.get("/secret-route", isLoggedIn, (req, res, next) => {
    res.send(req.userData);

})