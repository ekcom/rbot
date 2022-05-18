const fs = require("fs");

function getConfigData(cb) {
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
}

module.exports = getConfigData;