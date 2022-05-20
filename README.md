# Reminder Bot / RBot
_A daily reminder bot for GroupMe_

Set a reminder for your whole group every day at a specific time.
[todo screen shot of "don't forget to log", "it's tea time", "don't forget, meeting is TONIGHT at 6:00!"]

## Available Commands
View the [full list](./full_commands.md) of available commands. The following are the recommended variations:
### Set up the bot
- Hey Reminder Bot, set reminder to `X`
- Hey Reminder Bot, activate
### Configure the bot
- Hey Reminder Bot, set reminder time to `X`
 - Hey Reminder Bot, set reminder day to (everyday, weekdays, weekends, M/T/W/Th/F/S)
  - format for days can be `M/Mo/Monday/Mondays` etc
- Hey Reminder Bot, set reminder time to 6pm on weekdays
### Activate the bot
- Hey Reminder Bot, activate the reminder
### Preset the bot
- Hey Reminder Bot, use the running log preset
### Test the bot
- Hey Reminder Bot, are you awake?
- Hey Reminder Bot, what is the status?

## Getting Started
_Confused? Check out [these instructions](#getting-started-for-people-who-have-no-clue-what-they-are-doing)_
1. Add BOT_ID, GROUP_ID, and DATABASE_URL to the environment variables
 * Include your BOT_ID and GROUP_ID from the [GroupMe API bots page](https://dev.groupme.com/bots)
 * Database must be a postgres database. Works with free Heroku Postgres.
2. Configure [Heroku Scheduler](https://devcenter.heroku.com/articles/scheduler) (if running free dyno)
 * Heroku auto-kills your free dynos, so we need to add the Heroku Scheduler add-on
 * Create a new job to run `node cron-check.js` every 10 minutes
 * If you have a paid dyno that does not shut down, you can skip this step
3. Deploy and start chatting with Reminder Bot
 * Say "Hey RBot, status" in the group that you added the bot to

## Getting Started for people who have no clue what they are doing
1. Fork this repo
 * Click fork
2. Go to the [GroupMe Bots page](https://dev.groupme.com/bots) (you may need to create an account) and click [Create Bot](https://dev.groupme.com/bots/new). name, cb?
3. Create a free Heroku account and navigate to the [dashboard](https://dashboard.heroku.com/apps)
 * Click new -> create new app and name it whatever you want (reminder-bot-6000)
 * Click create app
 * Scroll down to Connect to GitHub
 * Select the repository you just forked (RBot)
4. In your Heroku app dashboard, navigate to Settings and click Reveal Config Vars
 * Enter BOT_ID as KEY and your GroupMe Bot ID in the VALUE section. Then click "Add."
 * Enter GROUP_ID with the Group Id from GroupMe developers
5. Add-on Heroku Scheduler and Heroku Postgres
 > Navigate to the “Resources” tab of the app’s Dashboard. Search for “Heroku Scheduler” in the Add-ons search box. Follow the prompts to provision the Add-on.
 * Click on the Heroku Scheduler in the list and it will open a new tab
 * Click Create job and select Every 10 minutes. This will wake up our bot to check if it is time to send a message every 10 minutes.
 * In Run Command, type `node cron-check.js` and then press Save Job
 * For Heroku Postgres, simply search for it and select the `Hobby Dev - Free` option (no further configuration required)
6. Start chatting with the Reminder Bot
 * In the group you added the bot to, try typing "Hey Reminder Bot, what is the status"

## How it works
- Each message sent in GroupMe is also sent to the bot
- The bot has code written to parse the message and tell if you are talking to him (his name is Bob)
- If you are talking to him, you can configure settings (which are stored in a text file instead of a database for simplicity) or enable the daily reminder
- Heroku will wake the bot up temporarily every 10 minutes to check, and stay awake if it is close to time