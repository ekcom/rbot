# Available Commands
## Syntax
Brackets are optional words
Parenthesis are available words
Example: `(activate/enable) [[the] reminder]` leads to the following options:
- activate
- activate reminder
- activate the reminder
- enable
- enable reminder
- enable the reminder

## Trigger word
All commands start with one of the following trigger phrases (case insensitive):
- Hey Rbot
- Hey R Bot
- Hey Reminder Bot
- Hey ReminderBot
- RBot
- Reminder Bot
- ReminderBot

## Commands
### Setup
- `Hey Rbot,` (set/change) name to `X`
 * Not yet implemented
- `Hey Rbot,` set ([the] reminder/message) to `X`
 * Updates the reminder text
### Configuration
- `Hey Rbot,` set (reminder/remind/message) (day/days) to `X`
 * `X` can be every day, weekdays, weekends, or the format of R/Th/Thurs/Thursday/Thursdays
 * `X` can include multiple days and formats. For example: `Hey RBot, set reminder days to weekends, Mondays, wed, and f.`
- `Hey Rbot,` set (reminder/remind/message) time to `X`
 * `X` includes time, day, or both. Example: `Hey RBot, set reminder time to 6:30 pm on weekdays.`
 * For times, `X` can be in the format of military time or `h:mm (am/pm)`
### Activate/Deactivate
- (activate/enable) [[the] reminder]
- (dectivate/disable) [[the] reminder]
### Presets
- [what are the] available presets
 * Default avilable: running log
- save this preset [as `X`]
 * Not yet implemented 
- use the `X` preset
 * `X` is the preset name
### Test the bot
- [what is the] status
 * Gives details about current settings: message, time, day, active
- (wake up/are you awake/ping)
 * Used to start the server if asleep and to test if everything is working properly.

## Punctuation
Any characters after the command are ignored, meaning that "Hey RBot, status report please!" will be accepted as "Hey RBot, status"