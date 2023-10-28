const jwt = require("jsonwebtoken");

module.exports = {

    auth: (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];

        jwt.verify(token, "access", (err, user) => {
            if(!err)
            {
                req.user = user;
                next();
            } else {
                return res.status(403).send({
                    message: "User not authorized!"
                });
            }
        })
    }
}