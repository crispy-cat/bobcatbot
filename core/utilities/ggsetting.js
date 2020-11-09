module.exports = function(guild, key) {
	this.InitializeGuildData(guild);
	return this.Bot.Data.Guild[guild.id].Settings[key];
};