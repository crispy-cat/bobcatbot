module.exports = function(user, force) {
	if (force || !this.Bot.Data.User[user.id]) {
		this.Bot.Data.User[user.id] = this.Bot.Config.DefaultUserData;
		return true;
	}
};