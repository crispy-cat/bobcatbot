module.exports = function(message, format = true) {
	if (format) {
		message = `[${this.FormatDate()} | T${this.Bot.Tick}] ${message}`;
		console.log(message);
		try {
			this.FS.appendFileSync(`${this.Bot.Root}/bot.log`, `${message}\n`);
		} catch (e) {
			console.log(`[!] Logfile failed! Logs are not being saved!\n\t${e}`);
		}
	} else {
		console.log(message);
	}
};
