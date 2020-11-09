module.exports = function(guild, user) {
	this.InitializeGuildData(guild);
	var Bot = this.Bot;
	if (Bot.Config.GlobalAccessLevels[user.id]) return Bot.Config.GlobalAccessLevels[user.id];
	if (Bot.Data.Guild[guild.id].AccessLevels[user.id]) return Bot.Data.Guild[guild.id].AccessLevels[user.id];
	var member = guild.members.resolve(user);
	if (!member) return 0;
	var hn = 0;
	member.roles.cache.each((role) => {
		if (Bot.Data.Guild[guild.id].AccessLevels["&" + role.id]) {
			if (Bot.Data.Guild[guild.id].AccessLevels["&" + role.id] > hn) hn = Bot.Data.Guild[guild.id].AccessLevels["&" + role.id];
		}
	});
	return hn;
};