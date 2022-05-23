const { handleMessage } = require("./receiveMessage");
const { getClient } = require("./util/pgConnect");


let stringToSend = "";
for (let i = 0; i < process.argv.length; i++) {
    if (i > 1) { // skip "node" "test-message"
        stringToSend += process.argv[i] + " ";
    }
}
stringToSend = stringToSend.trim(); // remove trailing space

getClient().then(pgClient => {
    handleMessage(pgClient, { text: stringToSend, sender_type: "user", isFake: true });
    pgClient.release(); // takes a few seconds
}, (e) => console.error("Could not connect to pg database", e));
