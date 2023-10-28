const express = require('express');
const router = express.Router();

const { isLoggedIn } = require("../../../middleware/users.js");

router.get("/secret-route", isLoggedIn, (req, res, next) => {
    res.send(req.userData);
})

module.exports = router;