module.exports = {
	Commands: {
		ExecuteCode: {
			Commands: ["execute", "exec", "script"],
			Access: 5, // Like your files/token? Keep this at 5.
			Arguments: ["*code"],
			Description: "Executes the given JavaScript code.",
			Function: function(Bot, message, args) {
				r = eval(args.code);
				message.channel.send(`Result: \`\`\`\n${r}\n\`\`\``);
			}
		},

		Sudo: {
			Commands: ["sudo"],
			Access: 5, // You should really keep this at 5.
			Arguments: ["*user", "*command", "arguments"],
			Description: "Executes the given command as the given user.",
			Function: function(Bot, message, args) {
				throw "todo";
			}
		}
	}
};