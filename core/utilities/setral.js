module.exports = function(guild, role, level) {
	this.InitializeGuildData(guild);
	this.Bot.Data.Guild[guild.id].AccessLevels["&" + role.id] = level;
	return true;
};