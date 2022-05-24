// Yessir, I will say "X(message)" [every day/weekdays/weekends] at Y(time)
// +- 10 minutes

const getConfigData = require("./util/getConfigData");
const fs = require("fs");
const express = require("express");
const { setCronAlarm } = require("./setCronAlarm");
const reply = require("./util/sendMessage");
const { handleMessage } = require("./receiveMessage");
const app = express();
const port = process.env.PORT || 9876;
const { getClient } = require("./util/pgConnect");
const { setupDb, addDefaultRow } = require("./util/pgSetup");

async function setUpDbWithClient() {
    const client = await getClient();
    await setupDb(client); // set up database


    getConfigData(client).then(json => {
        // json ok. proceed as normal...
        if (json.active) {
            setCronAlarm(client).then(a => console.log(`Cron alarm set for ${a.time}.`));
        }
    }, async err => {
        // could not get data. Crash and burn!
        console.log("Could not find a preset to load from the database. Adding default row...");
        await addDefaultRow(client);
    });

    process.on("exit", () => client.release()); // probably won't have time to run


    // Now that we have a client
    app.use(express.json());
    
    app.post("/hook", (req, res) => {
        // verify from groupme
        // todo verify via random query parameter agreed upon in setup
        if (process.env.GROUP_ID && req.body.group_id !== process.env.GROUP_ID) {
            return res.end("go away"); // unconfirmed.
        }
        try {
            //const json = JSON.parse(req.body);
            handleMessage(client, req.body);
        } catch (err) {
            // do not handle message
            console.error("Could not parse the incoming hook request:", req.body, err);
        }
        // don't worry. be happy
        res.end("hi group me !");
    });
    
    app.listen(port, () => console.log(`Webserver ready on port ${port}.`));
}
setUpDbWithClient();





