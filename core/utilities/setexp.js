module.exports = function(guild, user, exp, add = true) {
	var experience = this.GetExp(guild, user);
	if (add) experience.Experience += exp; else experience.Experience = exp;
	if (experience.Experience >= this.Bot.Config.LevelExp[experience.Level + 1]) experience.Level++;
	this.Bot.Data.Guild[guild.id].Experience[user.id] = experience;
	return experience;
};