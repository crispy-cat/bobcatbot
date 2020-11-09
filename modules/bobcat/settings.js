module.exports = {
	Commands: {
		ListSettings: {
			Commands: ["settings", "listsettings", "lsettings"],
			Access: 3,
			Arguments: [],
			Description: "Lists settings which can be changed for this server.",
			Function: function(Bot, message) {
				var pages = [];
				var cpage = 0;
				var cnt = 0;

				pages[cpage] = "";

				for (var s in Bot.GuildSettings) {
					var set = Bot.GuildSettings[s];
					pages[cpage] += `\n> ${s}\n${set.Description || "No description provided."}\n**Current value:** `;
					var val = Bot.Utilities.GetGuildSetting(message.guild, s);
					if (!val) continue;
					if (val.Disabled) pages[cpage] += "*Disabled*\n"; else pages[cpage] += `${val.Value}\n`;
					pages[cpage] += `**Type:** \`${set.Type}\`\n`;
					if (set.Default && val.Value != set.Default) pages[cpage] += `**Default value:** ${set.Default}\n`;
					if (!set.CanDisable) pages[cpage] += "*Cannot be disabled.*\n";
					if (++cnt >= 5) {
						cnt = 0;
						pages[++cpage] = "";
					}
				}

				for (var page in pages) {
					if (pages[page] == "") continue;
					message.author.send({
						embed: {
							title: `${Bot.Config.BotName} Server settings (${parseInt(page) + 1}/${pages.length})`,
							description: pages[page],
							color: Bot.Config.Colors.Primary,
							author: {
								name: Bot.Config.BotName,
								icon_url: Bot.Config.IconUrl
							},
							footer: {
								text: `${Bot.Config.BotName} v${Bot.Version}`
							},
						}
					});
				}

				message.channel.send(`${Bot.Config.Emoji.Check} Check your DMs!`);
			}
		},

		Set: {
			Commands: ["changesetting", "set"],
			Access: 3,
			Arguments: ["*key", "*value"],
			Description: "Changes a server setting.",
			Function: function(Bot, message, args) {
				var key = args.key;
				var value = args.value;
				if (!key || !value) return message.channel.send(`${Bot.Config.Emoji.X} You did not specify a key and value!`);
				var set = Bot.GuildSettings[key];
				if (!set) return message.channel.send(`${Bot.Config.Emoji.X} Setting does not exist!`);

				if (value.toLowerCase() == "default") {
					if (!set.DefaultValue) return message.channel.send(`${Bot.Config.Emoji.X} This setting has no default!`);
					Bot.Utilities.SetGuildSetting(message.guild, key, {
						Value: set.DefaultValue,
						Disabled: false
					});
					return message.channel.send(`${Bot.Config.Emoji.Check} Setting updated!`);
				}

				if (value.toLowerCase() == "disabled") {
					if (!set.CanDisable) return message.channel.send(`${Bot.Config.Emoji.X} This setting cannot be disabled!`);
					Bot.Utilities.SetGuildSetting(message.guild, key, {
						Value: Bot.Utilities.GetGuildSetting(message.guild, key).Value || set.DefaultValue,
						Disabled: true
					});
					return message.channel.send(`${Bot.Config.Emoji.Check} Setting updated!`);
				}

				switch (set.Type) {
					case "boolean":
						switch (value.toLowerCase()) {
							case "true":
							case "1":
							case "yes":
								value = true;
								break;
							case "false":
							case "0":
							case "no":
								value = false;
								break;
							default:
								return message.channel.send(`${Bot.Config.Emoji.X} This setting expects a boolean value!`);
						}
						break;
					case "integer":
						value = parseInt(value);
						if (!value) return message.channel.send(`${Bot.Config.Emoji.X} This setting expects an integer value!`);
						break;
					case "float":
						value = parseFloat(value);
						if (!value) return message.channel.send(`${Bot.Config.Emoji.X} This setting expects a float value!`);
						break;
					case "user":
					case "channel":
					case "role":
						value = Bot.Parser.ParseId(value);
						if (!value) return message.channel.send(`${Bot.Config.Emoji.X} This setting expects a ${set.Type} value!`);
						value = value.Id;
						break;
				}

				Bot.Utilities.SetGuildSetting(message.guild, key, {
					Value: value,
					Disabled: false
				});

				return message.channel.send(`${Bot.Config.Emoji.Check} Setting updated!`);
			}
		}
	}
};
