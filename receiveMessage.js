require("dotenv").config();
const setConfigTo = require("./util/setConfigTo");
const reply = require("./util/sendMessage");
const getConfigData = require("./util/getConfigData");
const fs = require("fs");


function checkMessageToUs(message) {
    if (message.sender_type !== "user") return false; // ignore bots (including self)
    if (message.system === true) return false;
    const phrases = ["hey rbot", "hey r bot", "hey reminder bot", "hey reminderbot", "rbot", "reminder bot"]; // comma after is irrelavent
    for (const phrase of phrases) {
        if (message.text.trim().toLowerCase().substring(0, phrase.length) === phrase) {
            if (message.text.trim().substring(phrase.length, phrase.length+1) !== " ") {
                return message.text.trim().substring(phrase.length+2).toLowerCase(); // remove comma/character + space after
            } else {
                return message.text.trim().substring(phrase.length+1).toLowerCase(); // remove space after
            }
        }
    }
    return false;
}

function handleMessage(message) {
    const query = checkMessageToUs(message);
    if (query === false) return;
    // there is probably a better way to do this
    if (query.substring(0, 12) === "set name to") {
        setName(query.substring(13)); // account for space
        // errors are caught in the function above
    } else if (query.substring(0, 14) === "change name to") {
        setName(query.substring(15));
    } else if (query.substring(0, 15) === "set reminder to") {
        setMessage(query.substring(16));
    } else if (query.substring(0, 14) === "set message to") {
        setMessage(query.substring(15));
    } else if (query.substring(0, 20) === "set reminder time to") {
        setTimeOrDay(query.substring(21));
    } else if (query.substring(0, 18) === "set remind time to") {
        setTimeOrDay(query.substring(19).trim());
    } else if (query.substring(0, 19) === "set message time to") {
        setTimeOrDay(query.substring(20));
    } else if (query.substring(0, 19) === "set reminder day to") {
        setDay(query.substring(20));
    } else if (query.substring(0, 20) === "set reminder days to") {
        setDay(query.substring(21));
    } else if (query.substring(0, 8) === "activate" || query.substring(0, 17) === "activate reminder" || query.substring(0, 21) === "activate the reminder"
        || query.substring(0, 6) === "enable" || query.substring(0, 15) === "enable reminder" || query.substring(0, 19) === "enable the reminder") {
        enableReminder();
    } else if (query.substring(0, 10) === "deactivate" || query.substring(0, 19) === "deactivate reminder" || query.substring(0, 23) === "deactivate the reminder"
        || query.substring(0, 7) === "disable" || query.substring(0, 16) === "disable reminder" || query.substring(0, 20) === "disable the reminder") {
        disableReminder();
    } else if (query.substring(0, 7) === "use the" && query.substring(query.length-6) === "preset") {
        const presetName = (query.substring(8, query.length-7));
        if (presetName === "running" || presetName === "log" || presetName === "running log" || presetName === "running log reminder") {
            const truePresetName = "running log";
            if (setConfigTo({
                message: "Don't forget to log.",
                active: true,
                hourToSend: 6,
                minuteToSend: 30,
                daysToSend: "mtwrf",
            })) {
                reply(`Loaded the ${truePresetName} preset.`);
            } else {
                reply(`There was an error loading the ${truePresetName} preset.`);
            }
        } else {
            // todo enable user-defined preset lookup
            reply("I can't find the preset you are looking for.");
        }
    } else if (query.substring(0, 13) === "save this preset") {
        reply("Could not save this preset: Not yet implemented."); return;
        if (query.substring(14, 15) === "as") {
            // save with query.substring(16) as the name
        } else {
            // save with `preset-${new Date()}` <- formatted as the name
        }
    } else if (query.substring(0, 17) === "available presets" || query.substring(0, 30) === "what are the available presets") {
        // todo iterate through user saved presets
        let msg = "The current presets are:\n";
        msg += "- " + "running log";
        msg += "\n\nAt this time, adding new user-defined is not implemented.";
        reply(msg);
    } else if (query.substring(0, 13) === "are you awake") {
        reply(`Yes sir, ${message.name}!`);
    } else if (query.substring(0, 7) === "wake up" || query.substring(0, 4) === "ping") {
        reply(`At your service, ${message.name}.`); // @${message.name} ?
    } else if (query.substring(0, 5) === "reset" || query.substring(0, 9) === "overwrite") {
        fs.copyFile("./default.config.json", "./config.json", null, err2 => {
            if (err2) {
                reply("Error: Unable to copy config.json file.");
            } else {
                reply("Successfully imported default config.json.");
            }
        });
    } else if (query.substring(0, 6) === "status" || query.substring(0, 18) === "what is the status") {
        getConfigData((err, json) => {
            if (err) {
                reply("There was an error checking the config file.");
                return;
            }
            // todo make the time and days more human readable
            reply(`STATUS REPORT:\nactive: ${json.active}\nmessage: '${json.message}'\ntime to send: ${json.hourToSend}:${json.minuteToSend}\ndays to send: ${json.daysToSend}`);
        });
    } else if (query.substring(0, 4) === "help" || query.substring(0, 8) === "commands"
        || query.substring(0, 18) === "available commands" || query.substring(0, 31) === "what are the available commands"
        || query.substring(0, 27) === "what commands are available") {
        let msg = "Available commands:\
            -   set name to\
            - etc \
            for more info, visit https://google.com !";
        reply(msg);
    } else {
        reply("Sorry, I don't recongize that command.");
    }
}

function setName(name) {
    // need to use ACCESS_TOKEN to change bot's name, which we don't have right now (just BOT_ID)
    reply("Could not change my name: Not yet implemented."); return;
    if ("success") {
        // no reply here: name changes will pop up in GroupMe by default
    } else {
        reply("There was an error changing my name.");
    }
}
function setMessage(message) {
    if (message.trim().length === 0) {
        reply("Did you specify a message to change the reminder to?");
        return false;
    } else {
        if (setConfigTo({ message: message })) {
            reply(`Updated the reminder to '${message}'`);
        } else {
            reply("There was an error changing the reminder message.");
        }
    }
}
function setTimeOrDay(timeOrDay) {
    if (isNaN(timeOrDay.substring(0, 1))) {
        setDay(timeOrDay);
    } else {
        const chunks = timeOrDay.split(/([0-9])( ?[ap]?m?)( on)? /i); // regex to test if giving time AND day
        const lastChunk = chunks[chunks.length-1].trim();
        // console.log(chunks);
        if (lastChunk !== "" && lastChunk !== timeOrDay && lastChunk !== "am" && lastChunk !== "pm") {
            setTimeout(() => setDay(lastChunk), 200); // give time for first write to finish (todo fix bad code)
        }
        setTime(timeOrDay);
    }
}
function setDay(dayString) {
    // accepts m/mo/mon/monday/mondays with "," or " " separation OR weekdays/week days/everyday/every day/weekends/week ends
    // u=sun, r=thurs
    let days = { sun: false, mon: false, tues: false, wed: false, thurs: false, fri: false, sat: false }; // 0 is sunday, 1 is monday, etc
    let parsedDays = dayString.toLowerCase().split(/,| /);
    parsedDays.filter(str => (str.length === 0 || str === "day") ? false : true); // eliminate blanks and chunks due to poor regex
    parsedDays.forEach(str => {
        if (str.substring(0, 5) === "every") {
            Object.keys(days).forEach(k => days[k] = true); // all true
            // could really end here (break) but not in forEach (need regular for)
        } else if (str.substring(0, 7) === "weekend") {
            days["sat"] = true;
            days["sun"] = true;
        } else if (str.substring(0, 4) === "week") {
            // must be week days or weekdays
            days["mon"] = true;
            days["tues"] = true;
            days["wed"] = true;
            days["thurs"] = true;
            days["fri"] = true;
        } else {
            const letter = str.substring(0, 1);
            if (letter === "u" || str.substring(0, 2) === "su") {
                days["sun"] = true;
            } else if (letter === "r" || str.substring(0, 2) === "th") {
                days["thurs"] = true;
            } else if (letter === "m") {
                days["mon"] = true;
            } else if (letter === "t") { // thursday already handled
                days["tues"] = true;
            } else if (letter === "w") {
                days["wed"] = true;
            } else if (letter === "f") {
                days["fri"] = true;
            } else if (letter === "s") { // sunday already handled
                days["sat"] = true;
            } // else that isn't a recongized day so fail silently (maybe the user said "and" in there?)
        }
    });
    const daysAllowed = Object.keys(days).filter(k => days[k] === true);
    const daysAllowedAbbreviated = daysAllowed.map(day3Letter => {
        if (day3Letter === "sun") { // the weird two
            return "u";
        } else if (day3Letter === "thurs") {
            return "r";
        }
        return day3Letter.substring(0, 1);
    });
    let daysAllowedReadable = daysAllowed.reduce((prev, curr) => prev += curr[0].toUpperCase()+curr.substring(1)+", ", "");
    daysAllowedReadable = daysAllowedReadable.substring(0, daysAllowedReadable.length-2);
    if (setConfigTo({ daysToSend: daysAllowedAbbreviated.reduce((prev, curr) => prev += curr, "") })) {
        reply(`Set reminder days to ${daysAllowedReadable}.`);
    } else {
        reply("There was an error setting the reminder days.");
    }
}
function setTime(timeStringPlusJunk) {
    // accepts 6:30p, 6:30 p, 6:30pm, 6:30 pm, 18:30, 1830, 630 pm, 630pm, 630 p, 630p
    let hour = 0, minute = 0;
    const timeStringArr = timeStringPlusJunk.toLowerCase().split(" ");
    if (timeStringArr[1] === "p" || timeStringArr[1] === "pm") {
        hour += 12;
    }
    // now we just need timeStringArr[0]
    if (timeStringArr[0].indexOf("p") !== -1) {
        hour += 12; // in the pms
    }
    const c = timeStringArr[0].split(/[^0-9]/);
    if (c[0].length > 2) {
        if (c[0].length === 3) {
            // format is 630 [pm]
            hour += parseInt(c[0].substring(0, 1));
            minute = parseInt(c[0].substring(1, 3));
        } else {
            // format is 1830
            hour += parseInt(c[0].substring(0, 2));
            minute = parseInt(c[0].substring(2, 4));
        }
    } else {
        // format is [h, m]
        hour += parseInt(c[0]); // += to maintain p)m
        minute = parseInt(c[1]);
    }
    if (hour > 24) hour -= 12; // we overshot... hopefully this only runs when hour === 24
    if (setConfigTo({ hourToSend: hour, minuteToSend: minute })) {
        let amPm = "am";
        if (hour > 12) {
            amPm = "pm";
            hour = hour-12; // for our purposes now
        }
        if (minute > 10) {
            minute += "0"; // a string now
        }
        reply(`Set reminder to ${hour}:${minute} ${amPm}`);
    } else {
        reply("There was an error setting the reminder time.");
    }
}
function enableReminder() {
    if (setConfigTo({ active: true })) {
        // todo initialize cron

        reply("Reminder enabled.");
    } else {
        reply("There was an error trying to completely enable the reminder.");
    }
}
function disableReminder() {
    if (setConfigTo({ active: false })) {
        // todo cancel cron

        reply("Reminder disabled.");
    } else {
        reply("There was an error trying to completely disable the reminder.");
    }
}

module.exports = { handleMessage };