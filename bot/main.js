var Discord = require("discord.js");
var client = new Discord.Client();
var config = require("./config.json");

client.login(config.token);

client.on("ready", () => {
    console.log(`Connected as ${client.user.tag}`);

    client.user.setPresence({
        status: "online",
        game: {
            type: "PLAYING",
            name: "Idiots"
        }
    });
});

client.on("message", async message => {
    if(message.author.bot) return;
    if(!message.guild) return;

    if(!message.content.startsWith(config.prefix)) return;

    var content = message.content.split(" ");
    var command = content[0].slice(config.prefix.length).toLowerCase();
    var args = content.slice(1);

    const auditlog = client.channels.find('name', config.log);

    if (command == "config-log")
    {
        var newlog = args[0];
        if (!newlog) return respond(message.channel, `Log channel name was not provided.`)
        if (!message.guild.channels.exists('name', newlog)) return respond(message.channel, `Log channel with name ${newlog} does not exist.`)
        config.log = newlog;
    }

    if (!auditlog) return respond(message.channel, `I cannot find an audit-log channel with name ${config.log}, please change the name of the audit log with !config-log command.`);

    if(command == "kick")
    {
        var member = message.mentions.members.first();
        const reason = args.slice(1).join(' ');

        if (!hasPermission(message.guild.me, "KICK_MEMBERS")) return respond(message.channel, `I do not have permission to kick users.`);

        if (!hasPermission(message.member, "KICK_MEMBERS")) return respond(message.channel, `You do not have permission to kick users.`);

        if (!member) return respond(message.channel, `You must mention a user to kick.`);

        if (!member.kickable) return respond(message.channel, `I am unable to kick ${member.user.username}.`);

        if (!reason) return respond(message.channel, `You must supply a reason for the kick.`);

        const embed = new Discord.RichEmbed()
            .setColor(0x00AE86)
            .addField(`Action:`,`${title(command)} ${member.user.username}`)
            .addField(`Reason:`,`${reason}`)
            .addField(`Issued by:`,`${message.author.username}`)
            .setTimestamp()
        client.channels.get(auditlog.id).send({embed});

        member.kick(reason).then(member => {
            respond(message.channel, `${member} has been kicked.`);
        });
    }
    else if(command == "ban")
    {
        const reason = args.slice(1).join(' ');
        var member = message.mentions.members.first();

        if (!hasPermission(message.guild.me, "BAN_MEMBERS")) return respond(message.channel, `I do not have permission to ban users.`);

        if (!hasPermission(message.member, "BAN_MEMBERS")) return respond(message.channel, `You do not have permission to ban users.`);

        if (!member) return respond(message.channel, `You must mention a user to ban.`);

        if (!member.bannable) return respond(message.channel, `I am unable to ban ${member.user.username}.`);

        if (!reason) return respond(message.channel, `You must supply a reason for the ban.`);

        const embed = new Discord.RichEmbed()
            .setColor(0x00AE86)
            .addField(`Action:`,`${title(command)} ${member.user.username} -- (${member.user.id})`)
            .addField(`Reason:`,`${reason}`)
            .addField(`Issued by:`,`${message.author.username}`)
            .setTimestamp()
        client.channels.get(auditlog.id).send({embed});

        member.ban(reason).then(member => {
            respond(message.channel, `${member} has been banned.`);
        });
    }
    else if(command == "unban")
    {
        const reason = args.slice(1).join(' ');
        const bannedUser = await client.fetchUser(args[0])
        client.unbanReason = reason;
        client.unbanAuth = message.author;

        if (!hasPermission(message.guild.me, "BAN_MEMBERS")) return respond(message.channel, `I do not have permission to ban users.`);

        if (!hasPermission(message.member, "BAN_MEMBERS")) return respond(message.channel, `You do not have permission to ban users.`);

        if (!reason) return respond(message.channel,`You must supply a reason for the unban.`);

        if (!bannedUser) return respond(message.channel,`You must supply a User Resolvable to identify the user to unban.`)

        message.guild.unban(bannedUser);

        const embed = new Discord.RichEmbed()
            .setColor(0x00AE86)
            .addField(`Action:`,`${title(command)} ${bannedUser.username}`)
            .addField(`Reason:`,`${reason}`)
            .addField(`Issued by:`,`${message.author.username}`)
            .setTimestamp()
        client.channels.get(auditlog.id).send({embed});

        return respond(message.channel, `Unbanned ${bannedUser}.`)
    }
    else if (command == "mute")
    {
        var member = message.mentions.members.first();
        const reason = args.slice(1).join(' ');

        if(!hasPermission(message.guild.me, "MANAGE_CHANNELS")) return respond(message.channel, `I require the Manage Channels permission to mute users.`);

        if(!hasPermission(message.member, "MANAGE_MESSAGES")) return respond(message.channel, `You do not have permission to mute users.`);

        if (!reason) return respond(message.channel, `You must supply a reason for the mute.`);

        if (!member) return respond(message.channel, `You must mention a user to mute.`);

        await message.guild.channels.forEach(channel => {
            if (channel.manageable) {
                channel.overwritePermissions(member, {
                    SEND_MESSAGES: false,
                    SEND_TTS_MESSAGES: false,
                    ADD_REACTIONS: false
                });
            }
        });

        const embed = new Discord.RichEmbed()
            .setColor(0x00AE86)
            .addField(`Action:`,`${title(command)} ${member.user.username}`)
            .addField(`Reason:`,`${reason}`)
            .addField(`Issued by:`,`${message.author.username}`)
            .setTimestamp()
        client.channels.get(auditlog.id).send({embed});

        return respond(message.channel, `Muted ${member.user.username}.`);
    }
    else if (command == "unmute")
    {
        const reason = args.slice(1).join(' ');
        var member = message.mentions.members.first();

        if (!hasPermission(message.guild.me, "MANAGE_CHANNELS")) return respond(message.channel, `I require the Manage Channels permission to unmute users.`);

        if(!hasPermission(message.member, "MANAGE_MESSAGES")) return respond(message.channel, `You do not have permission to unmute users.`);

        if (!member) return respond(message.channel, `You must mention a user to unmute.`);

        if (member.id == client.user.id) return respond(message.channel, `I am not able to mute myself.`);

        if (!reason) return respond(message.channel, `You must supply a reason for the ban.`);

        await message.guild.channels.forEach(channel => {
            if (channel.manageable) {
                channel.overwritePermissions(member, {
                    SEND_MESSAGES: null,
                    SEND_TTS_MESSAGES: null,
                    ADD_REACTIONS: null
                });
            }
        });

        const embed = new Discord.RichEmbed()
            .setColor(0x00AE86)
            .addField(`Action:`,`${title(command)} ${member.user.username}`)
            .addField(`Reason:`,`${reason}`)
            .addField(`Issued by:`,`${message.author.username}`)
            .setTimestamp()
        client.channels.get(auditlog.id).send({embed});

        return respond(message.channel, `Unmuted ${member.user.username}.`);
    }
    else if (command == "vckick")
    {
        const reason = args.slice(1).join(' ');
        var member = message.mentions.members.first();

        if(!hasPermission(message.guild.me, "MOVE_MEMBERS")) return respond(message.channel, `I require the Move Members permission to vckick users.`);

        if(!hasPermission(message.member, "MOVE_MEMBERS")) return respond(message.channel, `You do not have permission to vckick users.`);

        if (!member) return respond(message.channel, `You must mention a user to vckick.`);

        if (!reason) return respond(message.channel, `You must supply a reason for the VC kick.`);

        if (!member.voiceChannel) return respond(message.channel, `${member.user.username} is not connected to a voice channel.`);

        member.setVoiceChannel(null);
        const embed = new Discord.RichEmbed()
            .setColor(0x00AE86)
            .addField(`Action:`,`${title(command)} ${member.user.username}`)
            .addField(`Reason:`,`${reason}`)
            .addField(`Issued by:`,`${message.author.username}`)
            .setTimestamp()
        client.channels.get(auditlog.id).send({embed});

        return respond(message.channel, `Successfully kicked ${member.user.username} from ${member.voiceChannel.name}.`);
    }
    else if (command == "status")
    {
        var members = "";

        var statuses = {
            online: ":large_blue_circle:",
            idle: ":red_circle:",
            dnd: ":red_circle:",
            offline: ":black_circle:"
        };

        message.guild.members.forEach(member => {
            var line = `${statuses[member.presence.status]} **${member.user.username}** ${member.user.presence.status}\n`;

            if (line.length + members.length < 2000)
            {
                members += line;
            }
        });

        message.channel.send(members);
    }
    else if (command == "purge")
    {
        const reason = args.slice(2).join(' ');
        const targetChannel = client.channels.find("name",args[0]);
        var amount = args[1];

        if(!message.guild.channels.exists('name', args[0])) return respond(message.channel, `You must supply a valid channel name.`)

        if (!hasPermission(message.guild.me, "MANAGE_MESSAGES")) return respond(message.channel, `I require the Manage Channels permission to purge channels.`);

        if (!hasPermission(message.member, "MANAGE_MESSAGES")) return respond(message.channel, `You do not have permission to purge channels.`);

        if (!amount) return respond(message.channel, `Enter the amount of messages to be purged.`);

        if (amount > config.maxPurge) return respond(message.channel, `The requested message amount is larger than the maximum allowed (${config.maxPurge}).`);

        if (!reason) return respond(message.channel, `You must supply a reason for the purge.`);

        var messages = await targetChannel.fetchMessages({limit: amount});

        targetChannel.bulkDelete(messages);

        const embed = new Discord.RichEmbed()
            .setColor(0x00AE86)
            .addField(`Action:`,`${title(command)} ${amount} messages from ${targetChannel.name}.`)
            .addField(`Reason:`,`${reason}`)
            .addField(`Issued by:`,`${message.author.username}`)
            .setTimestamp()
        client.channels.get(auditlog.id).send({embed});
    }
    else if (command == "clear")
    {
        var member = message.mentions.members.first();
        const reason = args.slice(2).join(' ');
        const targetChannel = client.channels.find("name",args[1]);

        if(!message.guild.channels.exists('name', args[1])) return respond(message.channel, `You must supply a valid channel name.`)

        if (!hasPermission(message.guild.me, "MANAGE_MESSAGES")) return respond(message.channel, `I require the Manage Messages permission to clear user messages.`);

        if (!hasPermission(message.member, "MANAGE_MESSAGES")) return respond(message.channel, `You do not have permission to clear user messages.`);

        if (!reason) return respond(message.channel, `You must supply a reason for the clearing.`);

        if (!member) return respond(message.channel, `You must mention a user to clear.`);

        var messages = await targetChannel.fetchMessages({limit: config.maxPurge});
        var targetMessages = messages.filter(msg => msg.author.id == member.id);
        targetChannel.bulkDelete(targetMessages);

        const embed = new Discord.RichEmbed()
            .setColor(0x00AE86)
            .addField(`Action:`,`${title(command)} ${member.user.username}`)
            .addField(`Reason:`,`${reason}`)
            .addField(`Issued by:`,`${message.author.username}`)
            .setTimestamp();
        client.channels.get(auditlog.id).send({embed});
    }
    else if (command == "nuke")
    {
        const reason = args.slice(1).join(' ');
        const targetChannel = client.channels.find("name",args[0]);

        if(!message.guild.channels.exists('name', args[0])) return respond(message.channel, `You must supply a valid channel name.`)

        if (!hasPermission(message.guild.me, "MANAGE_CHANNELS")) return respond(message.channel, `I require the Manage Channels permission to nuke channels.`);

        if (!hasPermission(message.member, "MANAGE_CHANNELS")) return respond(message.channel, `You do not have permission to nuke channels.`);

        if (!reason) return respond(message.channel, `You must supply a reason for the nuke.`);

        console.log(message.guild.targetChannel);

        if (!targetChannel.deletable) return respond(message.channel, `I can not nuke this channel.`);
        
        const embed = new Discord.RichEmbed()
            .setColor(0x00AE86)
            .addField(`Action:`,`${title(command)} channel #${targetChannel.name}.`)
            .addField(`Reason:`,`${reason}`)
            .addField(`Issued by:`,`${message.author.username}`)
            .setTimestamp()
        client.channels.get(auditlog.id).send({embed});

        targetChannel.delete();

        message.guild.createChannel(targetChannel.name, {
            type: "text",
            position: targetChannel.position,
            topic: targetChannel.topic,
            nsfw: targetChannel.nsfw,
            parent: targetChannel.parentID,
            permissionOverwrites: targetChannel.permissionOverwrites
        });
    }
});

function respond(channel, response)
{
    channel.send(response).catch(error => {});
}

function hasPermission(member, permission)
{
    return member.hasPermission(permission, false, true, true);
}
function title(str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}
