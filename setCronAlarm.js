const cron = require("node-cron");
const sendMsgToGroup = require("./sendReminderMsg");
const getConfigData = require("./util/getConfigData");
const WAKEUP_INTERVAL = 10; // minutes

let task;

async function setCronAlarm(pgClient) {
    return new Promise((res, rej) => {
        getConfigData(pgClient).then(data => {
            let days3Letter = "";
            for (let i = 0; i < data.daysToSend.length; i++) {
                const letter = data.daysToSend.substring(i, i+1);
                let threeLetter = "";
                if (letter === "m") threeLetter = "mon";
                else if (letter === "t") threeLetter = "tue";
                else if (letter === "w") threeLetter = "wed";
                else if (letter === "r") threeLetter = "thu";
                else if (letter === "f") threeLetter = "fri";
                else if (letter === "s") threeLetter = "sat";
                else if (letter === "u") threeLetter = "sun";
                days3Letter += threeLetter+",";
            }
            days3Letter = days3Letter.substring(0, days3Letter.length-1); // trim trailing comma
            task = cron.schedule(`${data.minuteToSend} ${data.hourToSend} * * ${days3Letter}`, () => {
                sendMsgToGroup(pgClient)
                    .then(() => console.log("Scheduled message sent to group."))
                    .catch(err => {
                        //reply("Could not send the scheduled message"); // error could be message is blank
                        console.error("Failed to send message to the group at the scheduled time:", err);
                    });
            });
            //task.start();
            const now = new Date();
            const alarm = new Date();
            alarm.setHours(data.hourToSend);
            alarm.setMinutes(data.minuteToSend);
            const nextWakeup = new Date(now.getTime() + WAKEUP_INTERVAL*60*1000 + 60*1000); // 60s startup buffer
            // it may be the wrong day but this is easier (todo)
            if (now < alarm && nextWakeup > alarm) {
                //task.stop();
                //task.destroy();
                res({ task: task, time: `${data.hourToSend}:${data.minuteToSend} on ${days3Letter}`, close: true }); // close enough away
            } else {
                res({ task: task, time: `${data.hourToSend}:${data.minuteToSend} on ${days3Letter}`, close: false });
            }
        }, err => {
            console.error("Error getting config data:", err);
            rej(err);
        });
    });
}

function cancelCronAlarm() {
    task.stop();
}

module.exports = { task, setCronAlarm, cancelCronAlarm };