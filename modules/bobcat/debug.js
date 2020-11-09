module.exports = {
	Commands: {
		Ping: {
			Commands: ["ping", "latency"],
			Access: 0,
			Description: "Shows the bot latency.",
			Function: function(Bot, message) {
				var ts = Bot.Client.uptime / 1000;
				var td = Math.floor(ts / 86400);
				ts %= 86400;
				var th = Math.floor(ts / 3600);
				ts %= 3600;
				var tm = Math.floor(ts / 60);
				ts %= 60;

				message.channel.send({
					embed: {
						title: "Bot latency",
						description: `${Bot.Config.Emoji.PingPong} ${Bot.Client.ws.ping} ms\n`
							+ `**Uptime:** ${td}d:${th}h:${tm}m:${ts.toFixed(3)}s`,
						color: (Bot.Client.ws.ping <= 30) ? Bot.Config.Colors.Success : (Bot.Client.ws.ping >= 65) ?
							Bot.Config.Colors.Error : Bot.Config.Colors.Warning
					}
				});
			}
		},

		ReloadModules: {
			Commands: ["d:reloadmodules", "d:rlm"],
			Access: 5,
			Description: "Reloads the command modules.",
			Function: function(Bot, message) {
				Bot.Utilities.Log("Reloading command modules");
				Bot.Commands = { _Modules: [] };
				for (var m in Bot.Config.LoadModules) Bot.LoadModule(Bot.Config.LoadModules[m]);
				Bot.Utilities.Log("DONE!");
				message.channel.send("DONE!");
			}
		},

		ReloadConfig: {
			Commands: ["d:reloadconfig", "d:rlc"],
			Access: 5,
			Description: "Reloads the bot config.",
			Function: function(Bot, message) {
				Bot.Utilities.Log("Reloading config");
				Bot.Config = JSON.parse(Bot.Utilities.FS.readFileSync(`${Bot.Root}/config.json`));
				Bot.Utilities.Log("DONE!");
				message.channel.send("DONE!");
			}
		},

		ClearHooks: {
			Commands: ["d:clearhooks", "d:ch"],
			Access: 5,
			Description: "Clears bot hooks.",
			Function: function(Bot, message) {
				Bot.Utilities.Log("Clearing hooks...");
				Bot.Hooks._Hooks = [];
				Bot.Utilities.Log("DONE!");
				message.channel.send("DONE!");
			}
		},

		StopBot: {
			Commands: ["d:stop", "d:die"],
			Access: 5,
			Description: "Stops the bot.",
			Function: function(Bot) {
				Bot.Utilities.Log("Stopping bot...");
				Bot.Utilities.SaveData();
				Bot.Client.destroy().then(process.exit).catch((e) => { throw e; });
			}
		}
	}
};
