const fetch = require("node-fetch");
const { parseGroupmeError } = require("./parseGroupmeResponse");

function reply(message, attachments=[]) {
    if (message.trim() === "") throw new Error("Message cannot be blank.");
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
    }, 50);
}

module.exports = reply;