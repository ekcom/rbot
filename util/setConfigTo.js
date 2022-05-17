const fs = require("fs");
const getConfigData = require("./getConfigData");

function setConfigTo(diff) {
    try {
        getConfigData((err, json) => {
            if (err) throw new Error(err);
            fs.writeFile("./config.json", JSON.stringify({ ... json, ...diff }),()=>console.log("Config file updated."));
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