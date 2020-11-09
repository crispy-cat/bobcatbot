module.exports = function(guild, key, value) {
	this.InitializeGuildData(guild);
	this.Bot.Data.Guild[guild.id].Settings[key] = value;
};