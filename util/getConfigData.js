const fs = require("fs");

function getConfigData(cb) {
    fs.readFile("./config.json", "utf8", (err, data) => {
        let json;
        try {
            if (err) {
                if (err.code === "ENOENT") {
                    throw new Error("Failed to read config file. The file doesn't exist or we don't have sufficient priveledges.");
                }
                throw new Error("Failed to read config file.");
            }
            try {
                json = JSON.parse(data);
            } catch (err) {
                throw new Error("Failed to parse JSON in config file.");
            }
        } catch (error) {
            return cb(error, null); // json is null anyways
        }
        cb(null, json); // yay!
    });
}

module.exports = getConfigData;