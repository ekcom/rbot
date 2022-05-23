# Reminder Bot / RBot
_A daily reminder bot for GroupMe_

Set a reminder for your whole group every day at a specific time.

<img src="/screenshots/rbot-demo-1.png" alt="Reminder bot helpfully reminds the group: Don't forget, meeting is TONIGHT at 6:00!" height="100">
<img src="/screenshots/rbot-demo-2.png" alt="Reminder bot playfully reminds the group: It's tea time!" height="100">
<img src="/screenshots/rbot-demo-3.png" alt="Reminder bot respectfully reminds the group: Don't forget to log." height="50">

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
_Confused? Check out [these instructions](#getting-started-for-people-who-have-no-clue-what-they-are-doing)._
1. Create Heroku App and configure [Heroku Scheduler](https://devcenter.heroku.com/articles/scheduler) (if running free dyno)
 * Heroku auto-kills your free dynos, so we need to add the Heroku Scheduler add-on
 * Create a new job to run `node cron-check.js` every 10 minutes
 * If you have a paid dyno that does not shut down, you can skip this step
2. Create a new [GroupMe bot](https://dev.groupme.com/bots)
 * Enter `Reminder Bot` as the name
 * Enter `https://i.groupme.com/1000x1000.png.46ad37818d924567985aa2e7f138f791` as the avatar URL
 * Enter the callback URL. This will be the `/hook` route of wherever you are deploying.
   For Heroku, it will be `YOUR-APP-NAME.herokuapp.com/hook`
3. Add `BOT_ID`, `GROUP_ID`, and `DATABASE_URL` to the environment variables
 * Include your `BOT_ID` and `GROUP_ID` from the [GroupMe API bots page](https://dev.groupme.com/bots)
 * Database must be a postgres database. If you are using free Heroku Postgres, the `DATABASE_URL` env var will already be configured.
4. Deploy and start chatting with Reminder Bot
 * Say "Hey RBot, status" in the group that you added the bot to

## Getting Started for people who have no clue what they are doing
1. Fork this repo
 * Click fork
2. Create a free [Heroku](https://heroku.com) account and navigate to the [dashboard](https://dashboard.heroku.com/apps)
 * Click new -> create new app and name it whatever you want (`reminder-bot-6000`). Remember this name.
 * Click create app
 * Scroll down to Connect to GitHub
 * Select the repository you just forked (RBot)
3. Go to the [GroupMe Bots page](https://dev.groupme.com/bots) (you may need to create an account) and click [Create Bot](https://dev.groupme.com/bots/new).
 * Enter `Reminder Bot` as the Name
 * Enter `https://i.groupme.com/1000x1000.png.46ad37818d924567985aa2e7f138f791` as the Avatar URL
 * If using Heroku, enter in the Callback URL as `YOUR-APP-NAME.herokuapp.com/hook`, replacing `YOUR-APP-NAME` with the name of the Heroku app you created in step 2 (`reminder-bot-6000` for example).
  * If you are hosting somewhere other than Heroku, set the callback URL to the `/hook` route of your hosted site.
    For example, if your hosted domain is `https://my-cool-bot.example.com`, the callback URL would be `https://my-cool-bot.example.com/hook`
4. In your Heroku app dashboard, navigate to Settings and click Reveal Config Vars
 * Enter `BOT_ID` as KEY and your GroupMe Bot ID (found on the [GroupMe Bots page](https://dev.groupme.com/bots)) in the VALUE section. Then click "Add."
 * Enter `GROUP_ID` with the Group Id associated with your bot
5. Add-on Heroku Postgres Heroku Scheduler
 * For Heroku Postgres, go to the Resources tab of the app dashboard. Then, simply search for "Heroku Postgres" and select the `Hobby Dev - Free` option (no further configuration required)
 * For Heroku Scheduler, go back to the Resources tab and search for Heroku Scheduler. Click Submit Order Form.
    * __Note:__ Heroku may require you to add a credit card to verify your identity. The card added should not be charged for the purposes of this app, but it unfortunately is a required step if you are hosting with heroku.
 * Click on the Heroku Scheduler in the list and it will open a new tab
 * Click Add Job and select Every 10 minutes. This will wake up our bot to check if it is time to send a message every 10 minutes.
 * In Run Command, type `node cron-check.js` and then press Save Job
6. Start chatting with the Reminder Bot
 * In the group you added the bot to, try typing "Hey Reminder Bot, what is the status"
 * Ask the reminder bot "Hey RBot, what are the available commands?" for more

## How it works
- Each message sent in GroupMe is also sent to the bot
- The bot has code written to parse the message and tell if you are talking to him
- If you are talking to him, he will listen to you and update the database when you configure settings or enable the daily reminder
 - Heroku automatically puts the server to sleep when you haven't interacted with the bot for 30 minutes
- Heroku will wake the bot up temporarily every 10 minutes to check if it is close to reminder time, and stay awake if it is close to time
 - The bot sends the message to GroupMe at the scheduled time

## License
This code is licensed under GNU General Public License v3.0
