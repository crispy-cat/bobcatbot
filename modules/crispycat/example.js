module.exports = {
	Commands: {
		Example: {
			Commands: ["example", "test"], // Command names
			Access: 0,  // 0: Normal
						// 1: Mod
						// 2: Admin
						// 3: Owner
						// 4: Bot Admin
						// 5: Bot Owner
						// Function(Bot, guild, user): Custom check; return boolean
			Arguments: ["*arg1", "arg2"], // Command arguments; "*arg" indicates required in the help command
			Description: "An example command!", // A description
			Hidden: false, // Whether the command is hidden from the help command
			Fun: false, // Whether the command is considered fun
			Function: function(Bot, message, args) { // The function to execute
				Bot.Utilities.Log([args.arg1, args.arg2].join("; "));
			}
		}
	},

	Utilities: {
		Example: (a, b) => { return a + b; }
	}
};