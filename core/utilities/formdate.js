DateFormat = require("dateformat");

module.exports = function(date, format) {
	return DateFormat(date || Date.now(), format || this.Bot.Config.TimeFormat || "yyyy-mm-dd HH:MM:ss");
}
