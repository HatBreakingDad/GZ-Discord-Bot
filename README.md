# GZ-Discord-Bot
Discord moderation bot for Discord Hack Week
**Information**
Language: NodeJS
API Wrapper: Discord.JS

**Commands**
Syntax

| Symbol  | Meaning |
| ------------- | ------------- |
| -- | User |
| [] | Channel |
| {} | Integer Input |
| () | String Input |

| Command  | Arguments  | Functionality  |
| ------------- | ------------- | ------------- |
| kick | -target- | Kicks target from the guild |
| vckick | -target- | Kicks target out of voice chat |
| ban | -target- (reason) | Bans target |
| unban | -target- (reason) | Unbans target |
| purge | [channel] {amount} (reason) | Deletes amount of messages from channel |
| nuke | [channel] (reason) | Deletes and then creates channel with same properties as original  |
| clear | -target- [channel] (reason) | Deletes 100 messages from user in specified channel |
| mute | -target- (reason) | Mutes user in text channel |
| unmute | -target- (reason) | Unmutes user in text channel |

**Required Permissions / Roles (8 or 432221366)**
Administrator
View audit log
Manage server
Manage roles
Manage channels
Kick members
Ban members
Manage nicknames
View channels
Send messages
Manage messages
Read message history
Mention everyone
Mute members
Deafen members
Use members

