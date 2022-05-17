require("dotenv").config();
const fetch = require("node-fetch");
const getConfigData = require("./util/getConfigData");
const { parseGroupmeError } = require("./util/parseGroupmeResponse");
const setConfigTo = require("./util/setConfigTo");

async function sendMsgToGroup() {
    return new Promise((res, rej) => {
        if (!process.env.BOT_ID) {
            return rej("No bot ID in environment variables!"); // return rej(), don't throw new Error()
        }
        let message;
        getConfigData((err, json) => {
            if (err) rej(err); // propogate!
            if (!json.message || json.message.trim() === "") {
                return rej("No message to send.");
            }
            message = json.message;
            fetch("https://api.groupme.com/v3/bots/post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bot_id: process.env.BOT_ID,
                    text: message,
                }),
            })
                .then(msg => msg.text())
                .then(text => {
                    if (text !== "") {
                        return rej(parseGroupmeError(text));
                    }
                    console.log("Message sent.", process.uptime());
                    //console.log(text);
                    setConfigTo({ lastSent: Date.now() });
                    res();
                }, error => {
                    rej("Failed to fetch.");
                });
        });
    });
}

module.exports = sendMsgToGroup;