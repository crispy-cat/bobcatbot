module.exports = function(guild, user, target, roles = true) {
	var acc = Math.sign(this.GetUserAccessLevel(guild, user) - this.GetUserAccessLevel(guild, target));
	if (roles) {
		var user = guild.members.resolve(user.id);
		var target = guild.members.resolve(target.id);
		var roles = Math.sign(user.roles.highest.comparePositionTo(target.roles.highest));
		if (guild.owner.id == user.id || acc > 3) return acc;
		return Math.min(acc, roles);
	}
	return acc;
}