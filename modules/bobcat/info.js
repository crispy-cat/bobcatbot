module.exports = {
	Commands: {
		BotInfo: {
			Commands: ["info", "about"],
			Access: 0,
			Description: "Shows info about the bot.",
			Function: function(Bot, message) {
				var prefix = Bot.Utilities.GetGuildSetting(message.guild, "prefix").Value;
				message.channel.send({
					embed: {
						author: {
							name: Bot.Config.BotName,
							icon_url: Bot.Config.IconUrl
						},
						footer: {
							text: `${Bot.Config.BotName} v${Bot.Version} \u2022 Requested by ${message.author.tag}`
						},
						color: Bot.Config.Colors.Primary,
						description: `My prefix for ${message.guild.name} is \`${prefix}\`. Say \`${prefix}help\` for a list of commands.`,
						fields: [
							{
								name: "Development",
								value: "<@681153017281904670>",
								inline: true
							},
							{
								name: "Logo Design",
								value: "<@375019675228045332>",
								inline: true
							},
							{
								name: "Built with",
								value: "[node.js](https://nodejs.org)\n[discord.js](https://discord.js.org)",
								inline: true
							},
							{
								name: "Invite",
								value: `[Add to your server](https://discordapp.com/oauth2/authorize?client_id=${Bot.Client.user.id}&permissions=8&scope=bot)\n` +
									`[Minimal permissions](https://discordapp.com/oauth2/authorize?client_id=${Bot.Client.user.id}&permissions=406907911&scope=bot)`,
								inline: true
							},
							{
								name: "Source code",
								value: "[Bobcat on GitHub](https://github.com/crispy-cat/bobcatbot)",
								inline: true
							},
							{
								name: "Website",
								value: "[https://crispy.cat/bobcatbot](https://crispy.cat/bobcat)",
								inline: true
							},
							{
								name: "Support",
								value: "[Bobcat Headquarters](https://discord.gg/qNcfdSS)",
								inline: true
							}
						],

					}
				});
			}
		},

		CommandList: {
			Commands: ["help", "commands", "cmds", "?"],
			Access: 0,
			Arguments: ["module"],
			Description: "Shows you a list of commands.",
			Function: function(Bot, message, args) {
				var module = args.module;
				if (module) {
					module = module.toLowerCase();
					if (!Bot.Commands._Modules.includes(module)) return message.channel.send(`${Bot.Config.Emoji.X} That module doesn't exist!`);

					var commands = [];
					for (var c in Bot.Commands) {
						var com = Bot.Commands[c]
						var allow = false;
						if (typeof com.Access == "number") allow = Bot.Utilities.GetUserAccessLevel(message.guild, message.author) >= com.Access;
						else if (typeof com.Access == "function") allow = com.Access(Bot, message.guild, message.author);
						if (com._Module == module && allow && !com.Hidden)
							commands.push(Bot.Utilities.FormatCommand(com, Bot.Utilities.GetGuildSetting(message.guild, "prefix").Value));
					}

					message.channel.send({
						embed: {
							title: `Commands in module \`${module}\``,
							description: (commands.length > 0) ? commands.join("\n\n") : "You do not have access to any commands in this module or they are hidden.",
							color: Bot.Config.Colors.Primary,
							author: {
								name: Bot.Config.BotName,
								icon_url: Bot.Config.IconUrl
							},
							footer: {
								text: `${Bot.Config.BotName} v${Bot.Version} \u2022 Requested by ${message.author.tag}`
							}
						}
					});
				} else {
					message.channel.send({
						embed: {
							title: `Commands`,
							description: `My prefix for ${message.guild.name} is \`${Bot.Utilities.GetGuildSetting(message.guild, "prefix").Value}\`.\n` +
								`Please say \`${Bot.Utilities.GetGuildSetting(message.guild, "prefix").Value}help [module]\` to view commands for that module.\n` +
								`Available modules: \`${Bot.Commands._Modules.join("`, `")}\``,
							color: Bot.Config.Colors.Primary,
							author: {
								name: Bot.Config.BotName,
								icon_url: Bot.Config.IconUrl
							},
							footer: {
								text: `${Bot.Config.BotName} v${Bot.Version} \u2022 Requested by ${message.author.tag}`
							}
						}
					});
				}
			}
		},

		CommandSyntax: {
			Commands: ["syntax", "usage"],
			Access: 0,
			Arguments: ["*command"],
			Description: "Shows the syntax and description of the specified command.",
			Function: function(Bot, message, args) {
				var com = args.command;
				if (!com) return message.channel.send(`${Bot.Config.Emoji.X} You didn't specify a command!`);
				com = com.toLowerCase();

				var command;
				for (var c in Bot.Commands) {
					for (var n in Bot.Commands[c].Commands) {
						if (Bot.Commands[c].Commands[n] == com) {
							command = Bot.Commands[c];
							break;
						}
					}
					if (command) break;
				}

				if (!command) return message.channel.send(`${Bot.Config.Emoji.X} That command doesn't exist!`);

				message.channel.send({
					embed: {
						title: "Syntax",
						description: Bot.Utilities.FormatCommand(command, Bot.Utilities.GetGuildSetting(message.guild, "prefix").Value),
						color: Bot.Config.Colors.Primary,
						author: {
							name: Bot.Config.BotName,
							icon_url: Bot.Config.IconUrl
						},
						footer: {
							text: `${Bot.Config.BotName} v${Bot.Version} \u2022 Requested by ${message.author.tag}`
						}
					}
				});
			}
		}
	},

	Utilities: {
		FormatCommand: function(command, prefix) {
			var str = `\`${prefix}${command.Commands[0]}`;
			for (var arg in command.Arguments) {
				var req = command.Arguments[arg].indexOf("*") >= 0;
				str += ` ${(req) ? "<" : "["}${command.Arguments[arg].replace("*", "")}${(req) ? ">" : "]"}`;
			}

			return `${str}\`: *${command.Description || "No description provided."}*`;
		}
	}
};
