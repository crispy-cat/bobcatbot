module.exports = {
	Commands: {
		UserInfo: {
			Commands: ["userinfo", "profile", "whois"],
			Access: 0,
			Arguments: ["user"],
			Description: "Shows info about a user, or yourself if no user is supplied.",
			Function: function(Bot, message, args) {
				var target = Bot.Parser.ParseId(args.user);
				if (target) target = Bot.Client.users.resolve(target.Id);
				else target = message.author;
				if (!target) return message.channel.send(`${Bot.Config.Emoji.Confused} Sorry, I can't find that user!`);
				message.channel.send({
					embed: {
						title: target.tag,
						description: `<@${target.id}> (ID: ${target.id})`,
						color: Bot.Config.Colors.Primary,
						footer: {
							text: `Requested by ${message.author.tag}`
						},
						thumbnail: {
							url: target.avatarURL()
						},
						fields: [
							{
								name: "Bot",
								value: (target.bot) ? "Yes": "No",
								inline: true
							},
							{
								name: "Status",
								value: target.presence.status,
								inline: true
							},
							{
								name: "Joined Discord",
								value: Bot.Utilities.FormatDate(target.createdTimestamp),
								inline: true
							}
						]
					}
				});
			}
		},

		UserAvatar: {
			Commands: ["avatar", "pfp", "picture"],
			Access: 0,
			Arguments: ["user"],
			Description: "Shows a user's avatar, or your own if no user is supplied.",
			Function: function(Bot, message, args) {
				var target = Bot.Parser.ParseId(args.user);
				if (target) target = Bot.Client.users.resolve(target.Id);
				else target = message.author;
				if (!target) return message.channel.send(`${Bot.Config.Emoji.Confused} Sorry, I can't find that user!`);
				message.channel.send({
					embed: {
						title: `${target.tag}'s Avatar`,
						color: Bot.Config.Colors.Primary,
						footer: {
							text: `Requested by ${message.author.tag}`
						},
						image: {
							url: target.avatarURL()
						}
					}
				});
			}
		}
	}
};