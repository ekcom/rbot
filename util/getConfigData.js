/*function getConfigData(cb) {
    fs.readFile("./config.json", "utf8", (err, data) => {
        let json;
        if (err) {
            if (err.code === "ENOENT") {
                return cb("Failed to read config file. The file doesn't exist or we don't have sufficient priveledges.", null); // pass error
            }
            return cb("Failed to read config file.", null);
        }
        try {
            json = JSON.parse(data);
        } catch (err) {
            return cb("Failed to parse JSON in config file.", null); // json is null anyways
        }
        cb(null, json); // yay!
    });
}*/
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