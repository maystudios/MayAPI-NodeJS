const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "mayapi",
    password: ""
})
connection.connect();

module.exports = connection;