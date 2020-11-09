module.exports = function() {
	this.Bot.Data = JSON.parse(this.FS.readFileSync(`${this.Bot.Root}/save.json`));
};