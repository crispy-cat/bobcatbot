module.exports = function(guild, user) {
	this.InitializeGuildData(guild);
	return this.Bot.Data.Guild[guild.id].Experience[user.id] || { Level: 0, Experience: 0 };
};