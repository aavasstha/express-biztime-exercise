/** Database setup for BizTime. */
const { Client } = require("pg");

const db = new Client({
    user: "postgres",
    password: "shresthas",
    database: "biztime",
    host: "localhost",
    port: 5432
});



module.exports = db;