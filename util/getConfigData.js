async function getConfigData(client, cb) {
    return new Promise(async (res, rej) => {
        try {
            const result = await client.query("SELECT * FROM reminders ORDER BY id DESC LIMIT 1");
            if (result === undefined) {
                throw new Error("No columns to choose from in the database.");
            }
            res(result.rows[0].data); // already JSON.parse'd
        } catch (err) {
            return rej(err);
        }
    });
}

module.exports = getConfigData;