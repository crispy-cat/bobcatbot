module.exports = function(guild, user, level) {
	this.InitializeGuildData(guild);
	this.Bot.Data.Guild[guild.id].AccessLevels[user.id] = level;
	return true;
};