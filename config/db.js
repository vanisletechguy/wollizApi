/*const mysql = require('mysql');
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

const con = mysql.createConnection(dbConfig);
con.connect(err => {
    if (err) {
        console.error('Error connecting to the database', err);
        process.exit(1);
    }
});

module.exports = con;
*/


const mysql = require('mysql');
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3306, // Default MySQL port
  ssl: {
    rejectUnauthorized: false
  }
};

const con = mysql.createConnection(dbConfig);
con.connect(err => {
    if (err) {
        console.error('Error connecting to the database', err);
        process.exit(1);
    }
});

module.exports = con;

