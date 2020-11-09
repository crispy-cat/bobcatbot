module.exports = function() {
	this.FS.writeFileSync(`${this.Bot.Root}/save.json`, JSON.stringify(this.Bot.Data));
};