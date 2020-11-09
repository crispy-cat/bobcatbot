module.exports = function(guild, force) {
	if (force || !this.Bot.Data.Guild[guild.id]) {
		this.Bot.Data.Guild[guild.id] = {
			Settings: {},
			Warns: {},
			Mutes: {},
			TempBans: {},
			Experience: {},
			AccessLevels: {
				[guild.ownerID]: 3
			}
		};
		for (var s in this.Bot.GuildSettings) {
			var t = this.Bot.GuildSettings[s];
			this.Bot.Data.Guild[guild.id].Settings[s] = {
				Value: t.DefaultValue,
				Disabled: t.Disabled && t.CanDisable
			}
		}
		return true;
	}
};