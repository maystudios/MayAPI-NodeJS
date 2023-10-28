const jwt = require("jsonwebtoken");

module.exports = {
    validateRegister: (req, res, next) => {
        if (!req.body.username || req.body.username.length < 4) {
            return res.status(400).send({
                message: "Username must be at least 4 characters",
            });
        }

        if(!req.body.password || req.body.password.length < 6) {
            return res.status(400).send({
                message: "Password must be at least 6 characters",
            });
        }

        if(!req.body.password_repeat || req.body.password != req.body.password_repeat) {
            return res.status(400).send({
                message: "Password must Match",
            });
        }

        next();
    },
    isLoggedIn: (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, 'SECRETKEY');
            req.userData = decoded;
            next();
        } catch (err) {
            throw err;
            return res.status(400).send({
                message: "Your Session is invalid!"
            })
        }
    }
};