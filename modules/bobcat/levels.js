module.exports = function(Bot) {
	Bot.Commands.ViewLevel = {
		_Module: "levels",
		Commands: ["level", "exp", "xp", "experience"],
		Access: 0,
		Description: "Shows you your guild level and experience.",
		Function: function(Bot, message) {
			var exp = Bot.Utilities.GetExp(message.guild, message.author);
			message.channel.send({
				embed: {
					title: "Experience",
					color: Bot.Config.Colors.Primary,
					fields: [
						{
							name: "Experience",
							value: `${exp.Experience}/${Bot.Config.LevelExp[exp.Level + 1]}`,
							inline: true
						},
						{
							name: "Level",
							value: `${exp.Level}`,
							inline: true
						}
					]
				}
			});
		}
	};

	Bot.Commands.ResetLevel = {
		_Module: "levels",
		Commands: ["resetlevel", "clearlevel", "resetexp", "clearexp"],
		Access: 3,
		Arguments: ["*user"],
		Description: "Clears a user's guild experience.",
		Function: function(Bot, message, args) {
			var user = message.guild.members.resolve(message.author);
			var target = Bot.Parser.ParseId(args.user);
			if (target) target = message.guild.members.resolve(target.Id);
			else target = user;
			if (!target) return message.channel.send(`${Bot.Config.Emoji.Confused} Sorry, I can't find that user!`);
			if (Bot.Utilities.CompareAccessLevels(message.guild, user, target) < 1)
				return message.channel.send(`${Bot.Config.Emoji.Nerd} You can't reset this user's experience!`);

			Bot.Data.Guild[message.guild.id].Experience[target.id] = { Experience: 0, Level: 0 };
			message.channel.send(`${Bot.Config.Emoji.Check} ${user.nickname}'s experience was reset.`);
		}
	};

	Bot.GuildSettings.levelmessage = {
		Type: "string",
		DefaultValue: ":100: Congratulations {name}, you reached level {level}!",
		Description: "If enabled, sends this message whenever someone levels up.",
		CanDisable: true
	};

	Bot.Hooks.When("Message", function(Bot, iscmd, message) {
		if (iscmd) return;
		var pl = Bot.Utilities.GetExp(message.guild, message.author).Level;
		Bot.Utilities.SetExp(message.guild, message.author, Bot.Config.ExpPerMessage);
		if (Bot.Utilities.GetExp(message.guild, message.author).Level > pl) {
			var lmsg = Bot.Utilities.GetGuildSetting(message.guild, "levelmessage");
			if (lmsg.Disabled) return;
			message.channel.send(lmsg.Value.replace("{mention}", `<@${message.author.id}>`)
				.replace("{name}", message.author.tag).replace("{level}", pl + 1));
		}
	});

	Bot.Commands._Modules.push("levels");
	return "Loaded";
};
