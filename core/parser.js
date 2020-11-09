module.exports = {
	ParseCommand: function(text, prefix) {
		if (!text || !prefix) return {};
		var args = text.slice(prefix.length).split(/ +/g);

		return {
			Command: args.shift(),
			Arguments: args
		}
	},

	ParseArguments: function(args, argtable) {
		if (!args || !argtable) return {};
		var argf = {};
		for (var arg in argtable)
			argf[argtable[arg].replace("*", "")] = (arg == argtable.length - 1) ? args.join(" ") : args.shift();
		return argf;
	},

	ParseId: function(text) {
		if (!text) return;
		var match = text.match(/<?([@!?|#|&])?(\d+)>?/);
		if (!match) return false;
		return {
			Id: match[2] || "0",
			Type: { "@": "user", "#": "channel", "&": "role" }[match[1]]
		};
	}
};
