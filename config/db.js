require("dotenv").config();

const {Pool} = require("pg");


// what is pool?
// pool is a connection pool that can be used to get connections from the database
const pool  = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:{
        rejectUnauthorized: false
    }
});


pool.on('connect', (client, done) => {
    console.log("Connected to PostgreSQL Database");
});
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;