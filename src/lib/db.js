const mysql = require('mysql');

// Establish connection with the database
const connection = mysql.createConnection({
    host: process.env.dbHost,
    user: process.env.dbUser,
    database: process.env.dbName,
    password: process.env.dbPass,
    port: 3306,
    multipleStatements: true
});

connection.connect();
module.exports = connection;
