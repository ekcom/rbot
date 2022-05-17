const setCronAlarm = require("./setCronAlarm");


async function check() {
    const result = await setCronAlarm();
    
    // console.log(result);
    if (result.close === false) {
        // get it on the next pass
        console.log("Shutting down due to time being far off...");
        process.kill(process.pid, "SIGTERM"); // "SIGHUP"
    } else {
        console.log("Keeping server awake because it is almost time...");
        // it will be past time. wait
    }
}

check();