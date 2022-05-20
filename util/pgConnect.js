require("dotenv").config();
const { Pool } = require("pg");
const sslConfig = (process.env.NODE_ENV !== "production") ? false : { rejectUnauthorized: false }; // luv u heroku <3

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig,
});
async function connect() {
    try {
        const client = await pool.connect();
        console.log("Connected to postgres pool.");
        //const result = await client.query('SELECT * FROM test_table');
        //const results = { 'results': (result) ? result.rows : null};
        //client.release();
        return client;
    } catch (err) {
        console.error(err);
        throw new Error("Could not connect to postgres pool. " + err);
    }
}
//connect();
async function getClient() {
    return await connect();
}

module.exports = { getClient };