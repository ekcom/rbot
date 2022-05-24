const fetch = require("node-fetch");
const { parseGroupmeError } = require("./parseGroupmeResponse");

function reply(message, attachments=[]) {
    if (message.trim() === "") throw new Error("Message cannot be blank.");
    if (message.length > 1000) {
        if (message.length > 1988) throw new Error("Message is too long"); // not going to implement that
        reply(`[1/2] ${message.substring(0, 994)}`); // 6 prefix chars
        reply(`[2/2] ${message.substring(994, 1988)}`);
        return;
    }
    const body = {
        bot_id: process.env.BOT_ID,
        text: message,
    };
    if (attachments.length > 0) {
        body.attachments = attachments; // trust this is formatted properly
        /*{
            type: "image",
            url: "https://i.groupme.com"
        }*/
    }
    if (process.env.NODE_ENV !== "production") console.log("[dev] REPLY:", message);
    setTimeout(() => { // slow down the POST: we are too fast
    fetch("https://api.groupme.com/v3/bots/post", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })
        .then(res => res.text())
        .then(text => {
            if (text !== "") {
                // failed to send, but there's no way of telling anyone... (nodemailer?)
                console.log(parseGroupmeError(text));
                // don't throw an error because there's no backup and I don't want this to bubble
            } else {
                // success! yay!
            }
        }, err => {
            console.log("There was an error replying to a message:", err);
        });
    }, 250);
}

module.exports = reply;