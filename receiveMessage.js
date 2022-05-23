if (process.env.NODE_ENV !== "production") require("dotenv").config();
const setConfigTo = require("./util/setConfigTo");
const reply = require("./util/sendMessage");
const getConfigData = require("./util/getConfigData");
const fs = require("fs");
const { setCronAlarm, cancelCronAlarm } = require("./setCronAlarm");


function checkMessageToUs(message) {
    if (message.sender_type !== "user") return false; // ignore bots (including self)
    if (message.system === true) return false;
    const phrases = ["hey rbot", "hey r bot", "hey reminder bot", "hey reminderbot", "rbot", "reminder bot", "reminderbot"]; // comma after is irrelavent
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

function handleMessage(pgClient, message) {
    const query = checkMessageToUs(message);
    if (query === false) return;
    // there is probably a better way to do this
    if (query.substring(0, 12) === "set name to") {
        setName(query.substring(13)); // account for space
        // errors are caught in the function above
    } /*else if (query.substring(0, 15) === "set timezone to") {
        setTimeZone(query.substring(16));
    } else if (query.substring(0, 16) === "set time zone to") {
        setTimeZone(query.substring(17));
    } else if (query.substring(0, 19) === "available timezones" || query.substring(0, 20) === "available time zones") {
        reply("See this list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones");
    } */else if (query.substring(0, 14) === "change name to") {
        setName(query.substring(15));
    } else if (query.substring(0, 15) === "set reminder to") {
        setMessage(pgClient, query.substring(16));
    } else if (query.substring(0, 19) === "set the reminder to") {
        setMessage(pgClient, query.substring(20));
    } else if (query.substring(0, 14) === "set message to") {
        setMessage(pgClient, query.substring(15));
    } else if (query.substring(0, 20) === "set reminder time to") {
        setTimeOrDay(pgClient, query.substring(21));
    } else if (query.substring(0, 24) === "set the reminder time to") {
        setTimeOrDay(pgClient, query.substring(25));
    } else if (query.substring(0, 18) === "set remind time to") {
        setTimeOrDay(pgClient, query.substring(19).trim());
    } else if (query.substring(0, 19) === "set message time to") {
        setTimeOrDay(pgClient, query.substring(20));
    } else if (query.substring(0, 19) === "set reminder day to") {
        setDay(pgClient, query.substring(20));
    } else if (query.substring(0, 20) === "set reminder days to") {
        setDay(pgClient, query.substring(21));
    } else if (query.substring(0, 8) === "activate" || query.substring(0, 17) === "activate reminder" || query.substring(0, 21) === "activate the reminder"
        || query.substring(0, 6) === "enable" || query.substring(0, 15) === "enable reminder" || query.substring(0, 19) === "enable the reminder") {
        enableReminder(pgClient);
    } else if (query.substring(0, 10) === "deactivate" || query.substring(0, 19) === "deactivate reminder" || query.substring(0, 23) === "deactivate the reminder"
        || query.substring(0, 7) === "disable" || query.substring(0, 16) === "disable reminder" || query.substring(0, 20) === "disable the reminder") {
        disableReminder(pgClient);
    } else if (query.substring(0, 7) === "use the" && query.substring(query.length-6) === "preset") {
        const presetName = (query.substring(8, query.length-7));
        // todo enable user-defined preset lookup
        if (presetName === "running" || presetName === "log" || presetName === "running log" || presetName === "running log reminder") {
            const truePresetName = "running log";
            setConfigTo(pgClient, {
                message: "Don't forget to log.",
                active: true,
                hourToSend: 6,
                minuteToSend: 30,
                daysToSend: "mtwrf",
            }).then(() => {
                reply(`Loaded the ${truePresetName} preset.`);
            }, () => {
                reply(`There was an error loading the ${truePresetName} preset.`);
            });
        } else {
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
    } else if (query.substring(0, 6) === "status" || query.substring(0, 18) === "what is the status" || query.substring(0, 19) === "what is your status") {
        getConfigData(pgClient).then(json => {
            // todo make the time and days more human readable
            reply(`STATUS REPORT:\nactive: ${json.active}\nmessage: '${json.message}'\ntime to send: ${json.hourToSend}:${json.minuteToSend < 10 ? "0"+json.minuteToSend : json.minuteToSend} CST\ndays to send: ${json.daysToSend}`);
        }, err => {
            reply("There was an error checking the config file.");
        });
    } else if (query.substring(0, 4) === "help" || query.substring(0, 8) === "commands"
        || query.substring(0, 18) === "available commands" || query.substring(0, 31) === "what are the available commands"
        || query.substring(0, 27) === "what commands are available") {
        let msg = "Available commands:";
        fs.readFile("./README.md", { encoding: "utf-8" }, (err, data) => {
            if (err) {
                msg += "[ Could not read available commands ]";
                console.error("Could not read all available commands", err);
            } else {
                //msg += data.substring(data.indexOf("## Available Commands"), data.indexOf("## Getting Started"));
                msg += data.substring(data.indexOf("The following are the recommended variations:")+"The following are the recommended variations:".length, data.indexOf("## Getting Started"));
            }
            msg += "\nFor the full list, see https://github.com/92Eli/rbot/full_commands.md or say 'Hey RBot, show all commands'";
            reply(msg);
        })
    } else if (query.substring(0, 12) === "all commands" || query.substring(0, 17) === "show all commands" || query.substring(0, 25) === "what are all the commands") {
        let msg = "";
        fs.readFile("./full_commands.md", (err, data) => {
            if (err) {
                msg = "[ Could not read available commands ]";
                console.error("Could not read all available commands", err);
            } else {
                msg = data;
            }
            msg += "\nView in browser (formatted): https://github.com/92Eli/rbot/full_commands.md"; // todo here check
            reply(msg);
        });
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
function setMessage(pgClient, message) {
    if (message.trim().length === 0) {
        reply("Did you specify a message to change the reminder to?");
        return false;
    } else {
        setConfigTo(pgClient, { message: message })
            .then(() => { // res
                reply(`Updated the reminder to '${message}'`);
            }, () => { // rej
                reply("There was an error changing the reminder message.");
            });
    }
}
function setTimeOrDay(pgClient, timeOrDay) {
    if (isNaN(timeOrDay.substring(0, 1))) {
        setDay(pgClient, timeOrDay);
    } else {
        const chunks = timeOrDay.split(/([0-9])( ?[ap]?m?)( on)? /i); // regex to test if giving time AND day
        const lastChunk = chunks[chunks.length-1].trim();
        // console.log(chunks);
        if (lastChunk !== "" && lastChunk !== timeOrDay && lastChunk !== "am" && lastChunk !== "pm") {
            setDay(pgClient, lastChunk);
        }
        setTime(pgClient, timeOrDay);
    }
}
function setDay(pgClient, dayString) {
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
    setConfigTo(pgClient, { daysToSend: daysAllowedAbbreviated.reduce((prev, curr) => prev += curr, "") })
        .then(
            json => {
                reply(`Set reminder days to ${daysAllowedReadable}.`)
                //if (json.active === false) reply("Note: The reminder is not active.");
            },
            () => reply("There was an error setting the reminder days."));
}
function setTime(pgClient, timeStringPlusJunk) {
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
            const h = parseInt(c[0].substring(0, 1));
            if (h !== 12) hour += h;
            minute = parseInt(c[0].substring(1, 3));
        } else {
            // format is 1830
            const h = parseInt(c[0].substring(0, 2));
            if (h !== 12) hour += h;
            minute = parseInt(c[0].substring(2, 4));
        }
    } else {
        // format is [h, m]
        const h = parseInt(c[0]);
        if (h !== 12) hour += parseInt(c[0]); // += to maintain pm
        minute = parseInt(c[1]);
    }
    setConfigTo(pgClient, { hourToSend: hour, minuteToSend: minute })
        .then(json => {
            let amPm = "am";
            if (hour >= 12) {
                amPm = "pm";
                if (hour !== 12) hour = hour-12; // for our purposes now
            } else if (hour === 0) {
                hour = 12; // to display (12am)
            }
            if (minute < 10) {
                minute = "0"+minute; // a string now
            }
            reply(`Set reminder to ${hour}:${minute} ${amPm}`);
            if (json.active === false) reply("Note: The reminder is not active.");
        },
        () => {
            reply("There was an error setting the reminder time.");
        });
}
function enableReminder(pgClient) {
    setConfigTo(pgClient, { active: true })
        .then(() => {
            // initialize cron
            //setCronAlarm(pgClient); -- done in setConfigTo
    
            reply("Reminder enabled.");
        },
        () => {
            reply("There was an error trying to completely enable the reminder.");
        });
}
function disableReminder(pgClient) {
    setConfigTo(pgClient, { active: false })
        .then(() => {
            // cancel cron (event emitter?)
            cancelCronAlarm();
            reply("Reminder disabled.");
        },
        () => {
            reply("There was an error trying to completely disable the reminder.");
        });
}
function setTimeZone(zoneStr) {
    // todo implement this (right now in central time zone)
}

module.exports = { handleMessage };