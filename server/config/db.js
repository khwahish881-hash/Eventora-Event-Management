const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "localhost",
    user: "eventora_user",
    password: "Eventora@123",
    database: "eventora",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;