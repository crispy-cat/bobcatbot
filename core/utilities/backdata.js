module.exports = function() {
	this.FS.writeFileSync(`${this.Bot.Root}/backup/${this.FormatDate(
			Date.now(),
			this.Bot.Config.TimeFormat.replace(" ", "_").replace(/[^\w]/g, "-") || "yyyy-mm-dd_HH-MM-ss"
	)}.json`, JSON.stringify(this.Bot.Data));
};