module.exports = {
	Commands: {
		SaveData: {
			Commands: ["d:save", "d:sd"],
			Access: 4,
			Description: "Saves bot data.",
			Function: function(Bot, message) {
				Bot.Utilities.Log("Saving bot data...");
				Bot.Utilities.SaveData();
				Bot.Utilities.Log("DONE!");
				message.channel.send("DONE!");
			}
		},

		ReloadData: {
			Commands: ["d:reload", "d:rld"],
			Access: 5,
			Description: "Reloads bot data.",
			Function: function(Bot, message) {
				Bot.Utilities.Log("Reloading bot data...");
				Bot.Utilities.LoadData();
				Bot.Utilities.Log("DONE!");
				message.channel.send("DONE!");
			}
		},

		BackupData: {
			Commands: ["d:backup", "d:bd"],
			Access: 4,
			Description: "Backs up bot data.",
			Function: function(Bot, message) {
				Bot.Utilities.Log("Backing up data...");
				Bot.Utilities.BackupData();
				Bot.Utilities.Log("DONE!");
				message.channel.send("DONE!");
			}
		}
	}
};
