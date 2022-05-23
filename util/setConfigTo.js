const { setCronAlarm } = require("../setCronAlarm");
const getConfigData = require("./getConfigData");


function setConfigTo(client, diff) {
    return new Promise(async (res, rej) => {

        getConfigData(client).then(async json => {
            // do not sanitize data. we trust it because it's not from the user
            for (const k of Object.keys(diff)) {
                json[k] = diff[k];
            }
            // sanitize ' and other characters from json
            await client.query(`UPDATE reminders SET data = $1 WHERE id=(SELECT MAX(id) FROM reminders);`, [JSON.stringify(json)]);
            if (diff.hasOwnProperty("hourToSend") || diff.hasOwnProperty("minuteToSend") || diff.hasOwnProperty("daysToSend") || (diff.hasOwnProperty("active") && diff.active === true)) {
                console.log("Resetting cron alarm...");
                // reset cron: new data/time will be pulled from the database
                await setCronAlarm(client);
            }
            res(json);
        }, err => {
            const ks = Object.keys(diff);
            let things = "";
            ks.forEach(k => things += k+", ");
            things = things.substring(0, things.length-2);
            console.warn(`Failed to update ${things} for reminder.`, err);
            rej();
        });
    });
}

module.exports = setConfigTo;