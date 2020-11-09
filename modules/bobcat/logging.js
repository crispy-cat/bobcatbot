module.exports = function(Bot) {
	Bot.Utilities.GuildLog = function(guild, data) {
		if (!guild) return;
		var channel = this.GetGuildSetting(guild, "logchannel");
		if (channel.Disabled) return;
		channel = guild.channels.resolve(channel.Value);
		if (!channel) return;

		var emb = {
			title: data.title || "Server log",
			description: data.description || "Server log",
			color: data.color || this.Bot.Config.Colors.Primary,
			author: {
				name: `${this.Bot.Config.BotName} Logs`,
				icon_url: this.Bot.Config.IconUrl
			},
			footer: {
				text: this.FormatDate()
			}
		};
		if (data.image) {
			emb.thumbnail = {};
			emb.thumbnail.url = data.image;
		}

		channel.send({ embed: emb });
	}

	Bot.GuildSettings.logchannel = {
		Type: "channel",
		Description: "If enabled, logs user actions to this channel.",
		CanDisable: true
	};

	Bot.Hooks.When("MemberJoined", function(bot, member) {
		bot.Utilities.GuildLog(member.guild, {
			title: "Member joined",
			description: `${member.user.tag} (<@${member.id}>)`,
			color: bot.Config.Colors.Success,
			image: member.user.avatarURL()
		});
	});

	Bot.Hooks.When("MemberLeft", function(bot, member) {
		bot.Utilities.GuildLog(member.guild, {
			title: "Member left",
			description: `${member.user.tag} (ID: ${member.id})`,
			color: bot.Config.Colors.Error,
			image: member.user.avatarURL()
		});
	});

	Bot.Hooks.When("MemberUpdated", function(bot, oldmember, newmember) {
		if (oldmember.nickname != newmember.nickname) {
			bot.Utilities.GuildLog(newmember.guild, {
				title: "Nickname change",
				description: `${newmember.user.tag} (<@${newmember.id}>)\n`
					+ `${(oldmember.nickname) ? "`" + oldmember.nickname + "`" : "*(none)*"} =>`
					+ `${(newmember.nickname) ? "`" + newmember.nickname + "`" : "*(none)*"}`,
				image: newmember.user.avatarURL()
			});
		}
	});

	Bot.Hooks.When("UserBanned", function(bot, user) {
		bot.Utilities.GuildLog(user.guild, {
			title: "User banned",
			description: `${user.tag} (ID: ${user.id})`,
			color: bot.Config.Colors.Error,
			image: user.avatarURL
		});
	});

	Bot.Hooks.When("UserUnbanned", function(bot, user) {
		bot.Utilities.GuildLog(user.guild, {
			title: "User unbanned",
			description: `${user.tag} (ID: ${user.id})`,
			color: bot.Config.Colors.Success,
			image: user.avatarURL
		});
	});

	Bot.Hooks.When("RoleCreated", function(bot, role) {
		bot.Utilities.GuildLog(role.guild, {
			title: "Role created",
			description: `${role.name} (<@&${role.id}>)`,
			color: role.color
		});
	});

	Bot.Hooks.When("RoleDeleted", function(bot, role) {
		bot.Utilities.GuildLog(role.guild, {
			title: "Role deleted",
			description: `${role.name} (ID: ${role.id})`,
			color: role.color
		});
	});

	Bot.Hooks.When("RoleUpdated", function(bot, oldrole, newrole) {
		if (oldrole.name == newrole.name && oldrole.color == newrole.color) return;
		bot.Utilities.GuildLog(newrole.guild, {
			title: "Role updated",
			description: `${newrole.name} (<@&${newrole.id}>)\n`
				+ `**Name:** \`${oldrole.name}\` => \`${newrole.name}\`\n`
				+ `**Color:** ${oldrole.color} => ${newrole.color}\n`,
			color: newrole.color,
		});
	});

	Bot.Hooks.When("ChannelCreated", function(bot, channel) {
		bot.Utilities.GuildLog(channel.guild, {
			title: "Channel created",
			description: `<#${channel.id}>`,
			color: bot.Config.Colors.Success
		});
	});

	Bot.Hooks.When("ChannelDeleted", function(bot, channel) {
		bot.Utilities.GuildLog(channel.guild, {
			title: "Channel deleted",
			description: `${channel.name} (ID: ${channel.id})`,
			color: bot.Config.Colors.Error
		});
	});

	Bot.Hooks.When("ChannelUpdated", function(bot, oldchannel, newchannel) {
		if (oldchannel.name != newchannel.name) {
			bot.Utilities.GuildLog(newchannel.guild, {
				title: "Channel name changed",
				description: `<#${newchannel.id}>\n`
					+ `\`${oldchannel.name}\` => \`${newchannel.name}\`\n`
			});
		}
	});

	Bot.Hooks.When("InviteCreated", function(bot, invite) {
		bot.Utilities.GuildLog(invite.guild, {
			title: "Invite created",
			description: `${invite.url}`,
			color: bot.Config.Colors.Success
		});
	});

	Bot.Hooks.When("MessageUpdated", function(bot, oldmessage, newmessage) {
		if (oldmessage.content == newmessage.content || newmessage.author.id == Bot.Client.id) return;
		bot.Utilities.GuildLog(newmessage.guild, {
			title: "Message edited",
			description: `from <@${newmessage.author.id}> in channel <#${newmessage.channel.id}>, Message ID: ${newmessage.id}\n`
				+ `>>> **Old:**\n${oldmessage.content}\n\n**New:**\n${newmessage.content}`
		});
	});

	Bot.Hooks.When("MessageDeleted", function(bot, message) {
		if (message.author.id == Bot.Client.id) return;
		bot.Utilities.GuildLog(message.guild, {
			title: "Message deleted",
			description: `from <@${message.author.id}> in channel <#${message.channel.id}>, Message ID: ${message.id}\n`
				+ ((message.content) ? ">>> " + message.content : "*(no content)*"),
			color: bot.Config.Colors.Error
		});
	});

	Bot.Hooks.When("MessagesDeleted", function(bot, messages) {
		bot.Utilities.GuildLog(messages.first().guild, {
			title: "Messages deleted",
			description: `${messages.array().length} messages deleted in <#${messages.first().channel.id}>`,
			color: bot.Config.Colors.Error
		});
	});

	return "Loaded";
};
