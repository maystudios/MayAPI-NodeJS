const express = require('express');
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

const db = require("../../../lib/db/db.js");

const { validateRegister, isLoggedIn } = require("../../../middleware/users.js");
const { auth } = require("../../../middleware/auth.js");
const { createInventory, getInventory } = require("../../../lib/inventory/inventory.js")

let refreshTokens = [];

router.post("/protected", auth, (req, res) => {
    res.send("Inside protected route");
})


//This function can refresh the Access Token if its unvalid!
router.post("/renewAccessToken", (req, res) => {
    const refreshToken = req.body.token;
    if(!refreshToken || !refreshTokens.includes(refreshToken))
    {
        return res.status(403).send({
            message: "User not authenticated!",
        });
    }

    jwt.verify(refreshToken, "refresh", (err, user) => {
        if (!err)
        {
            const accessToken = jwt.sign({user}, "access", { expiresIn: "40s" });
            return res.status(201).send({
                accessToken,
            });
        } else {
            return res.status(403).send({
                message: "User not authorized!",
            });
        }
    })
})

//This function creates a new user ans store it in the Database!
router.post("/sing-up", validateRegister, (req, res, next) => {
    let sql = `SELECT * FROM users WHERE UCASE(username) = UCASE('${req.body.username}')`;
    db.query(sql, (err, result) => {
        console.log(result);
        if(result.length > 0) {
            return res.status(409).send({
                message: "Username already registered!",
            });
        }else{
            let sql = `SELECT * FROM users WHERE UCASE(email) = UCASE('${req.body.email}')`;
            db.query(sql, (err, result) => {
                if(result.length > 0) {
                    return res.status(409).send({
                        message: "Email already registered!",
                    });
                }else{
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if(err){
                            throw err;
                            return res.status(500).send({
                                message: err,
                            });
                        }else{
                            const id = uuid.v4();
                            let sql = `INSERT INTO users (id, username, email, password, registered) VALUES ('${id}','${req.body.username}', '${req.body.email}', '${hash}', now());`;
                            db.query(sql, (err, result) => {
                                console.log(result);
                                    if(err){
                                        throw err;
                                        return res.status(400).send({
                                            message: err,
                                        });
                                    }
                                    createInventory(id);
                                    return res.status(201).send({
                                        message: "Registered!",
                                    });
                                 }
                            );
                        }
                    })
                }
            });
        }
    })
})

router.post("/login", (req, res, next) => {
    let sql = `SELECT * FROM users WHERE UCASE(email) = UCASE('${req.body.email}');`;
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
        }

        bcrypt.compare(req.body.password, result[0]["password"], (bErr, bresult) => {
            if(bErr){
                throw bErr;
                return res.status(400).send({
                    message: "Password is incorrect!",
                });
            }
            if(bresult){
                let accessToken = jwt.sign(
                    {
                        userId: result[0].id,
                        userName: result[0].username,
                        userEmail: result[0].email
                    },
                    "access",
                    { expiresIn: "40s"}
                );

                let refreshToken = jwt.sign(
                    {
                        userId: result[0].id,
                        userName: result[0].username,
                        userEmail: result[0].email
                    },
                    "refresh",
                    { expiresIn: "1d"}
                );
                let sql = `UPDATE users SET last_login = now() WHERE id = '${result[0].id}';`;
                db.query(sql);

                refreshTokens.push(refreshToken);

                const inv = getInventory(result[0].id);
                console.log(inv);

                return res.status(200).send({
                    message: "Logged in!",
                    accessToken,
                    refreshToken,
                    inv
                });
            }
            return res.status(400).send({
                message: "Email or password is incorrect!",
            });
        })
    })
})

module.exports = router;
