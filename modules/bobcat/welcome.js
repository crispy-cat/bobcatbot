module.exports = function(Bot) {
	Bot.GuildSettings.welcomechannel = {
		Type: "channel",
		Description: "If enabled, sends a welcome message (see `welcomemessage`) to this channel.",
		CanDisable: true
	};

	Bot.GuildSettings.welcomemessage = {
		Type: "string",
		DefaultValue: ":wave: Welcome to {server}, {name}!",
		Description: "If `welcomechannel` is enabled and a valid channel, this message is sent there.",
	};

	Bot.Hooks.When("MemberJoined", function(bot, member) {
		var channel = bot.Utilities.GetGuildSetting(member.guild, "welcomechannel");
		if (channel.Disabled) return;
		channel = member.guild.channels.resolve(channel.Value);
		if (!channel) return;
		var message = bot.Utilities.GetGuildSetting(member.guild, "welcomemessage");

		channel.send(message.Value.replace("{mention}", `<@${member.id}>`)
			.replace("{name}", member.user.tag).replace("{server}", member.guild.name));
	});

	return "Loaded";
}
