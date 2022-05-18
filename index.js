// Yessir, I will say "X(message)" [every day/weekdays/weekends] at Y(time)
// +- 10 minutes

const getConfigData = require("./util/getConfigData");
const fs = require("fs");
const express = require("express");
const setCronAlarm = require("./setCronAlarm");
const reply = require("./util/sendMessage");
const { handleMessage } = require("./receiveMessage");
const app = express();
const port = process.env.PORT || 9876;

getConfigData((err, json) => {
    if (err) {
        // could not get data. Overwrite the file!
        console.log("Overwriting config.json due to malformality or nonexistance...");
        fs.copyFile("./default.config.json", "./config.json", null, err2 => {
            if (err2) {
                throw new Error("Unable to create config.json file. Do we have sufficient priveledges?", err2); // crash app
            }
            console.log("Successfully imported default config.json.");
        });
    } else {
        // json ok. proceed as normal...
    }
});

app.use(express.json());

app.post("/hook", (req, res) => {
    // verify from groupme
    // todo verify via random query parameter agreed upon in setup
    if (process.env.GROUP_ID && req.body.group_id !== process.env.GROUP_ID) {
        res.end("go away"); // unconfirmed.
    }
    try {
        //const json = JSON.parse(req.body);
        handleMessage(req.body);
    } catch (err) {
        // do not handle message
        console.error("Could not parse the incoming hook request:", req.body, err);
    }
    // don't worry. be happy
    res.end("hi group me !");
});

app.listen(port, () => console.log(`Webserver ready on port ${port}`));


setCronAlarm() // check/set up cron
    .catch(err => {
        console.error("Error starting cron:", err);
        reply("On startup, we could not properly schedule the reminder. It may or may not work today.");
    });

