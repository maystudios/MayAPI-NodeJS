const jwt = require("jsonwebtoken");

function parseJwt (token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

module.exports = {

    isValidReport: (req, res, next) => {
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

            if(req.body.user_id && req.body.reported_id && req.body.Type && req.body.Message && req.body.Timestamp)
            {
                const decoded = parseJwt(token);
                let sql = `SELECT COUNT(user_id) FROM users WHERE user_id = ${req.body.user_id};`;
                    db.query(sql, (err, result) => {
                        if(err){
                            throw err;
                            return res.status(400).send({
                            message: err,
                        });
                    }
                    if(!result.length){
                        return res.status(400).send({
                        message: "Email is incorrect!",
                    });
            } else {
                return res.status(400).send({
                    message: "Invalid content!"
                })
            }
        })
    }
}



















/*
const decoded = jwt.decode(authHeader, 'access');
                if(!decoded)
                {
                    
                } else {
                    return res.status(403){
                        message: "Cannot decode accesstoken!"
                    }
                }
*/