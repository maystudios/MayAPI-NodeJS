const express = require('express');
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

const db = require("../../../lib/db/db.js");


const { auth } = require("../../../middleware/auth.js");

router.post("/report", auth, (req, res) => {
    res.send("Inside protected route");
})

module.exports = router;
