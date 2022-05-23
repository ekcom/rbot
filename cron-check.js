// Need to keep operations under 90 seconds to keep things free

const { setCronAlarm } = require("./setCronAlarm");
const { getClient } = require("./util/pgConnect");
const msg = require("./util/sendMessage");

async function check() {
    try {
        const client2 = await getClient();
        const result = await setCronAlarm(client2);
        
        // console.log(result);
        if (result.close === false) {
            // get it on the next pass
            console.log("Shutting down due to time being far off...");
            client2.release();
            process.exit(); //process.kill(process.pid, "SIGTERM"); // "SIGHUP"
        } else {
            // it will be past time. wait
            console.log("Keeping server awake because it is almost time...");
        }
    } catch (err) {
        console.error("[cron-check] Error starting cron:", err);
        msg("When waking up to check the time, we could not properly schedule the reminder. It may or may not work today.");
    }
}

check();