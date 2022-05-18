const fs = require("fs");
const getConfigData = require("./getConfigData");

function setConfigTo(diff) {
    try {
        getConfigData((err, json) => {
            if (err) throw new Error(err);
            // hope this doesn't overlap (race condition warning)
            // ... todo lockfile
            // todo: error: idk why but sometimes this will not properly overwrite config.json (even when only updating once)
            // solution: overwrite as blank first
            // fs.writeFileSync("./config.json", "{ }", { flag: "r+" }); // <- does not work
            fs.truncate("./config.json", 0, () => {
                fs.writeFileSync("./config.json", JSON.stringify({ ...json, ...diff }), { flag: "r+" });
                // thread was blocked and now:
                console.log("Config file updated.");
            });
            /*const stream = fs.createWriteStream("./config.json");
            stream.on("ready", () => {
                stream.write(JSON.stringify({ ... json, ...diff }));
                stream.end();
            });
            stream.on("close", () => {
                console.log("Config file updated.");
            });*/
            //stream.close();
        });
    } catch (err) {
        const ks = Object.keys(diff);
        let things = ""
        ks.forEach(k => things += k+", ");
        things = things.substring(0, things.length-2);
        console.warn(`Failed to update ${things} in config.json`, err);
        return false;
    }
    return true;
}

module.exports = setConfigTo;