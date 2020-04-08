/* BobCatBot Alpha 0.11.0
 * Created by crispycat
 * Bobcat project started 2019/10/27
*/

if (process.env.NODE_ENV != "production") require("dotenv").config();

var FileSystem = require("fs");
// var Unzip = require("unzip");
var Request = require("request").defaults({ headers: { "User-Agent": "Bobcat Discord Bot 0.11.0" } });
var DateFormat = require("dateformat");
var Discord = require("discord.js");

var Log = function(object, ff = true) {
	if (ff === false) {
		console.log(object);
	} else {
		console.log(`${DateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss")} ${object}`);
		try {
			FileSystem.appendFileSync(`${BotData.GlobalData.DataPath}/bot.log`, `${DateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss")} ${object}\n`);
		} catch (e) {
			console.log(`[X] LOGFILE FAILED! MESSAGES ARE NOT BEING LOGGED!\n\t${e}`);
		}
	}
}
var Client = new Discord.Client();
var BotData = {};

// Bot settings data
BotData.GlobalData = {
	// Info
	Name: "Bobcat",
	LongName: "Bobcat Alpha",
	Version: {
		Major: 0,
		Minor: 11,
		Patch: 0,
		String: "0.11.0"
	},
	// Global access levels, only levels < 0 and >= 3 override server levels
	AccessLevels: {
		/*  < 0: Blacklisted, cannot use the bot
		 *    0: Normal
		 *    1: Server Moderator
		 *    2: Server Owner
		 *    3: Global Moderator, can use most commands regardless of permissions
		 * >= 4: Bot Owner, can use all commands and use execution features
		*/
		"681153017281904670": 4,
		"423102128328802306": 3,
		"333986101238693890": 3, // alnm
		"209351262284546048": 3 // mathis650
	},
	// Bot assets
	Assets: {
		Icons: {
			Profile: "https://i.ibb.co/z4QNfDg/icon.png",
			Transparent: "https://i.ibb.co/Xskhxk4/icon-trans.png",
			Full: "https://i.ibb.co/TTh79cG/icon-full.png",
			Legacy: "https://i.ibb.co/PW6jWHg/bot.png"
		},
		Colors: {
			Primary: 0xe8ad2c, // 0x3385ff
			Secondary: 0xb3b3b3,
			Success: 0x33cc33,
			Warning: 0xffcc00,
			Error: 0xcc0000
		},
		Emoji: {
			Check: "\u2705", // \u2714
			X: "\u274c",
			Warning: "\u26a0",
			Nerd: "\u{1f913}",
			Boot: "\u{1f97e}",
			Hammer: "\u{1f528}",
			Money: "\u{1f4b0}",
			MoneyWings: "\u{1f4b8}",
			EightBall: "\u{1f3b1}",
			Confused: "\u{1f615}",
			Overwhelmed: "\u{1f630}",
			RedFlag: "\u{1f6a9}",
			Wave: "\u{1fb44}",
			Up: "\u{1f53a}",
			Down: "\u{1f53b}",
			PingPong: "\u{1f3d3}",
			OneHundred: "\u{1f4af}",
			ZippedMouth: "\u{1f910}",
			Dad: "\u{1f468}",
			Orange: "\u{1f34a}"
		}
	},
	// Level system settings
	Levels: {
		ExpPerChat: 3,
		ExpNeeded: [
			0, 15, 30, 53, 83, 120, 165, 218, 278, 345, 420, 503, 593, 690, 795, 908,
			1028, 1155, 1290, 1433, 1583, 1740, 1905, 2078, 2258, 2445, 2640, 2843,
			3053, 3270, 3495, 3728, 3968, 4215, 4470, 4733, 5003, 5280, 5565, 5858,
			6158, 6465, 6780, 7103, 7433, 7770, 8115, 8468, 8828, 9195, 9570, 9953,
			10343, 10740, 11145, 11558, 11978, 12405, 12840, 13283, 13733, 14190,
			14655, 15128, 15608
		],
		Cooldown: 5
	},
	// Save path and token
	DataPath: "./save",
	SaveInterval: 120,
	Token: process.env.bot_token,
	// NSFW filter
	NSFWFilter: /p[e3]{,2}n(?:[i1]s)?|d[i1][ck]+|[ck][o0][ck]+|puss|vag|cl[i1]t|cbt|ba[l1]{2}s|s[e3]x|p[o0]rn|an(?:us|al)|a[s5]{2}[s\s]+|b[o0]{2}b|t[i1]t/gi,
	// Bot settings for the >settings command
	ServerSettings: [
		{
			Key: "prefix",
			Description: "The prefix the bot will use for this server.",
			Default: ">",
			CanDisable: false
		},
		{
			Key: "moderatorrole",
			Description: "A role which has access to all moderator commands regardless of role permissions. Will not work if Bobcat can't recognize the role!",
			CanDisable: true
		},
		{
			Key: "levelmessage",
			Description: "A message which is sent when a user levels up. Use placeholders `{level}`, `{name}` and `{mention}`.",
			Default: ":100: Congratulations {name}, you reached level **{level}**!",
			CanDisable: true
		},
		{
			Key: "welcomemessage",
			Description: "A message which is sent when a user joins the server. Use placeholders `{server}`, `{name}` and `{mention}`. Use setting `welcomechannel` to set the channel or disable.",
			Default: ":wave: Welcome to {server}, {name}!",
			CanDisable: false
		},
		{
			Key: "welcomechannel",
			Description: "The channel where welcome messages will be sent. Welcome messages will not be sent if Bobcat can't recognize the channel!",
			CanDisable: true
		},
		{
			Key: "logchannel",
			Description: "The channel where server logs will be sent. Logs will not be sent if Bobcat can't recognize the channel!",
			CanDisable: true
		},
		{
			Key: "allowfuncommands",
			Description: "Whether the bot will execute fun commands. Valid values: true/yes/1 and false/no/0/other",
			Default: "true",
			CanDisabled: false
		}
	]
}

BotData.ServerData = {};

// The most important part - the commands!
BotData.Commands = {
	/* Commands are defined as follows:
	 * command: {
	 *	name: [command name as string],
	 *	access: [access level as integer, 0-4],
	 *	visibility: [optional bool or function returning bool],
	 *	description: [optional description for the help command as string],
	 *	args: [optional array object of arguments for the command],
	 *	function: [function which accepts args (message, args)]
	 * }
	 */

	// Execution, debug and data commands.
	// These should be kept out of the hands of non-trusted users!
	exec: {
		name: "exec",
		access: 4, // DO NOT SET THIS TO < 4 IF YOU WANT TO KEEP YOUR COMPUTER AND TOKEN SAFE!!
		visibilty: false,
		description: "Executes the given JavaScript code.",
		arguments: ["code"],
		function: function(message, args) {
			message.channel.send(`Result: \`${eval(args.code)}\``).catch(Log);
		}
	},

	sudo: {
		name: "sudo",
		access: 3,
		visibilty: false,
		description: "Executes the given command as the given user.",
		arguments: ["user", "command", "arguments"],
		function: function(message, args) {
			var user = UserId(args.user);
			if (!user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			user = message.guild.members.get(user);
			var command = BotData.Commands[args.command];

			var arguments = []; 
			if (args.arguments) arguments = args.arguments.split(" ");

			if (typeof command == "object") {
				if (command.access > AccessLevel(message.author, message.guild) || command.name == "sudo")
					return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} Nice try!`).catch(Log);

				// Prepare the arguments for the command
				var nargs = arguments;
				if (typeof command.arguments == "object") {
					nargs = {};
					var cnt = 0;
					var argl = arguments.length;
					for (var arg in command.arguments) {
						nargs[command.arguments[arg]] = arguments.shift();
						if (++cnt == command.arguments.length && argl > command.arguments.length)
							nargs[command.arguments[arg]] += " " + arguments.join(" ");
					}
				}

				// Try to execute the command
				var nmessage = message;
				nmessage.author = user.user;

				command.function(nmessage, nargs);
			} else {
				message.channel.send("Command does not exist!");
			}
		}
	},

	data: {
		name: "data",
		access: 4,
		visibilty: false,
		description: "Save, reload and purge bot data.",
		arguments: ["save|reload|purgebackups|purgelogs"],
		function: function(message, args) {
			var mode = args["save|reload|purgebackups|purgelogs"];
			if (!mode) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} No mode specified!`).catch(Log);

			switch (mode) {
				case "save":
					message.channel.send(`${BotData.GlobalData.Assets.Emoji.Up} Saving data...`).catch(Log);
					SaveData();
					message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} Saved!`).catch(Log);
					break;
				case "reload":
					message.channel.send(`${BotData.GlobalData.Assets.Emoji.Down} Attempting to reload data...`).catch(Log);
					try {
						LoadData();
						message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} Reloaded!`).catch(Log);
					} catch (e) {
						message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Data could not be reloaded, ${e}`).catch(Log);
					}
					break;
				case "purgebackups":
					var bytes = 0;

					FileSystem.readdirSync(BotData.GlobalData.DataPath).forEach((file) => {
						if (file != "bot.log" && file != "data.json") {
							bytes += FileSystem.statSync(`${BotData.GlobalData.DataPath}/${file}`).size;
							FileSystem.unlinkSync(`${BotData.GlobalData.DataPath}/${file}`);
						}
					});

					message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} Purged ${bytes} bytes.`).catch(Log);
					break;
				case "purgelogs":
					message.channel.send("Sending log file, react any to purge...", { files: [BotData.GlobalData.DataPath + "/bot.log"] }).then((m) => {
						m.awaitReactions(() => { return true; }, { max: 1, time: 5000, errors: ["time"] }).then(() => {
							m.channel.send(`Purging ${FileSystem.statSync(`${BotData.GlobalData.DataPath}/bot.log`).size} bytes...`);
							FileSystem.writeFileSync(`${BotData.GlobalData.DataPath}/bot.log`, "");
							m.delete().catch(Log);
						});
					}).catch(Log);
					break;
				default:
					message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid mode!`).catch(Log);
			}
		}
	},

	stop: {
		name: "stop",
		access: 4,
		visibilty: false,
		description: "Safely saves the bot data, closes the connection to Discord and ends the bot process.",
		function: function(message) {
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.Hammer} Stopping bot...`).then(() => {
				SaveData();
				Client.destroy().then(process.exit).catch(Log);
			}).catch(Log);
		}
	},

	accesslevel: {
		name: "accesslevel",
		access: 3,
		visibilty: false,
		description: "Sets a user's access level.",
		arguments: ["user", "level"],
		function: function(message, args) {
			var user = UserId(args.user);
			if (!user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);

			var lvl = parseInt(args.level);
			if (typeof lvl == "number") {
				if (lvl <= 2) {
					BotData.ServerData[message.guild.id].AccessLevels[user] = lvl;
					message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} Set user level to ${BotData.ServerData[message.guild.id].AccessLevels[user]}`);
				} else {
					message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Level must be <= 2!`);
				}
			} else {
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid level!`);
			}
		}
	},

	// Settings commands
	reinitialize: {
		name: "reinitialize",
		access: 2,
		description: "Reinitializes server data in case it becomes corrupt. Irreversable.",
		function: function(message) {
			BotData.ServerData[message.guild.id] = null;
			InitializeServer(message.guild);
			message.channel.send("Done").catch(Log);
		}
	},

	levelmessages: {
		name: "levelmessages",
		access: 2,
		description: "Toggles level messages for the server.",
		function: function(message) {
			BotData.ServerData[message.guild.id].ShowLevelMessages = BotData.ServerData[message.guild.id].ShowLevelMessages === false;
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} Level messages are now ${(BotData.ServerData[message.guild.id].ShowLevelMessages) ? "en" : "dis"}abled.`).catch(Log);
		}
	},

	addmod: {
		name: "addmod",
		access: 2,
		description: "Adds a Bobcat moderator to this server. Bobcat moderators can use all moderator commands regardless of role permissions.",
		arguments: ["user"],
		function: function(message, args) {
			var user = UserId(args.user);
			if (!user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);

			if (BotData.ServerData[message.guild.id].AccessLevels[user] > 0) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} User is already a moderator!`).catch(Log);
			BotData.ServerData[message.guild.id].AccessLevels[user] = 1;
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} User is now a moderator!`).catch(Log);
		}
	},

	remmod: {
		name: "remmod",
		access: 2,
		description: "Removes a Bobcat moderator from this server.",
		arguments: ["user"],
		function: function(message, args) {
			var user = UserId(args.user);
			if (!user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);

			if (BotData.ServerData[message.guild.id].AccessLevels[user] != 1) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} User is not a moderator!`).catch(Log);
			BotData.ServerData[message.guild.id].AccessLevels[user] = 0;
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} User is no longer a moderator!`).catch(Log);
		}
	},

	settings: {
		name: "settings",
		access: 2,
		description: "Sets or disables features of the bot for this server. Try >settings list.",
		arguments: ["key|list", "value|disable|default"],
		function: function(message, args) {
			var mode = args["key|list"];
			if (!mode) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} No key specified!`).catch(Log);
			mode = mode.toLowerCase();

			var val = args["value|disable|default"];

			switch (mode) {
				case "list":
					var pages = [];
					var cpage = 0;
					var cnt = 0;

					pages[cpage] = "";
					
					for (var s in BotData.GlobalData.ServerSettings) {
						var set = BotData.GlobalData.ServerSettings[s];
						pages[cpage] += `\n> \`${set.Key}\`\n${set.Description || "No description provided."}\n\n**Current value:** `;
						var val = GetServerSetting(message.guild, set.Key);
						if (val.Disabled) pages[cpage] += "*Disabled*\n"; else pages[cpage] += `${val.Value}\n`;
						if (set.Default && val.Value != set.Default) pages[cpage] += `**Default value:** ${set.Default}\n`;
						if (!set.CanDisable) pages[cpage] += "*Cannot be disabled.*\n";
						if (++cnt > 8) {
							cnt = 0;
							pages[++cpage] = "";
						}
					}
						
					for (var page in pages) {
						message.author.send({
							embed: {
								title: `${BotData.GlobalData.LongName} Server settings (${parseInt(page) + 1}/${pages.length})`,
								description: pages[page],
								color: BotData.GlobalData.Assets.Colors.Primary,
								author: {
									name: BotData.GlobalData.LongName,
									icon_url: BotData.GlobalData.Assets.Icons.Profile
								},
								footer: {
									text: `${BotData.GlobalData.LongName} v${BotData.GlobalData.Version.String}`
								},
							}
						}).catch(Log);
					}

					message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} Check your DMs!`).catch(Log);
					break;
				default:
					for (var i in BotData.GlobalData.ServerSettings) {
						if (BotData.GlobalData.ServerSettings[i].Key != mode) continue;
						if (!val) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} No value specified!`).catch(Log);

						if (!BotData.ServerData[message.guild.id].Settings[BotData.GlobalData.ServerSettings[i].Key]) {
							BotData.ServerData[message.guild.id].Settings[BotData.GlobalData.ServerSettings[i].Key] = {
								Value: BotData.GlobalData.ServerSettings[i].Default,
								Disabled: BotData.GlobalData.ServerSettings[i].CanDisable
							}
						}
						
						switch (val.toLowerCase()) {
							case "default":
								if (!BotData.GlobalData.ServerSettings[i].Default)
									return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} This setting has no default!`).catch(Log);

								BotData.ServerData[message.guild.id].Settings[BotData.GlobalData.ServerSettings[i].Key].Val = BotData.GlobalData.ServerSettings[i].Default;
								BotData.ServerData[message.guild.id].Settings[BotData.GlobalData.ServerSettings[i].Key].Disabled = false;
								return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} \`${mode}\` set to default.`).catch(Log);
								break;
							case "disable":
								if (!BotData.GlobalData.ServerSettings[i].CanDisable)
									return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} This setting cannot be disabled!`).catch(Log);

								BotData.ServerData[message.guild.id].Settings[BotData.GlobalData.ServerSettings[i].Key].Disabled = true;
								return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} \`${mode}\` disabled.`).catch(Log);
								break;
							default:
								BotData.ServerData[message.guild.id].Settings[BotData.GlobalData.ServerSettings[i].Key].Value = val;
								BotData.ServerData[message.guild.id].Settings[BotData.GlobalData.ServerSettings[i].Key].Disabled = false;
								return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} \`${mode}\` set to \`${GetServerSetting(message.guild, mode).Value}\`.`).catch(Log);
						}
					}
					message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid key! Use \`${GetServerSetting(message.guild, "prefix")}settings list\` for a list of keys.`).catch(Log);
			}
		}
	},

	// Ping, echo and info commands
	ping: {
		name: "ping",
		access: 0,
		description: "Gets the bot latency.",
		function: function(message) {
			var ping = Math.round(Client.ping);
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.PingPong} Pong!`, {
				embed: {
					color: (ping <= 30) ? BotData.GlobalData.Assets.Colors.Success : (ping >= 65) ?
						BotData.GlobalData.Assets.Colors.Error : BotData.GlobalData.Assets.Colors.Warning,
					fields: [{
						name: "Bot ping:",
						value: ping + " ms"
					}]
				}
			});
		}
	},

	echo: {
		name: "echo",
		access: 1,
		description: "Repeats the given message.",
		arguments: ["message"],
		function: function(message, args) {
			message.channel.send(args.message);
		}
	},

	secho: {
		name: "secho",
		access: 1,
		description: "Same as echo, but deletes the command message.",
		arguments: ["message"],
		function: function(message, args) {
			message.channel.send(args.message);
			message.delete();
		}
	},

	info: {
		name: "info",
		access: 0,
		description: "Shows you some bot info.",
		function: function(message) {
			message.channel.send({
				embed: {
					title: BotData.GlobalData.LongName,
					description: `Say \`${GetServerSetting(message.guild, "prefix").Value}help\` for a list of commands.`,
					color: BotData.GlobalData.Assets.Colors.Primary,
					author: {
						name: BotData.GlobalData.LongName,
						icon_url: BotData.GlobalData.Assets.Icons.Profile
					},
					image: {
						url: BotData.GlobalData.Assets.Icons.Full
					},
					footer: {
						text: `${BotData.GlobalData.LongName} v${BotData.GlobalData.Version.String} | Requested by ${message.author.tag}`
					},
					fields: [
						{
							name: "Prefix",
							value: `My prefix for this server is \`${GetServerSetting(message.guild, "prefix").Value}\`.`,
							inline: true
						},
						{
							name: "Developer",
							value: "crispycat\nJohnSteeds#4687",
							inline: true
						},
						{
							name: "Logo design",
							value: "ep1c#6746",
							inline: true
						},
						{
							name: "Built with",
							value: [
								"https://nodejs.org",
								"https://discord.js.org",
							].join("\n"),
							inline: true
						},
						{
							name: "Testers",
							value: [
								"Inco#0713",
								"Blogworldexp#2732",
								"Mr Cone Man#4073",
								"teknowafel#6746"
							].join("\n"),
							inline: true
						},
						{
							name: "Add the bot",
							value: [
								`[Add to your server](https://discordapp.com/oauth2/authorize?client_id=${Client.user.id}&permissions=8&scope=bot)`,
								`[Minimal Permissions](https://discordapp.com/oauth2/authorize?client_id=${Client.user.id}&permissions=134278215&scope=bot)`,
								//"[Development Branch](https://discordapp.com/api/oauth2/authorize?client_id=687074853311741965&permissions=8&scope=bot)",
								"[Support server](https://discord.gg/a66StMe)"
							].join("\n"),
							inline: true
						}
					]
				}
			});
		}
	},

	help: {
		name: "help",
		access: 0,
		description: "Displays this list.",
		function: function(message) {
			var pages = [];
			var cpage = 0;
			var cnt = 0;

			// Prepare the commands
			pages[cpage] = `My prefix for ${message.guild.name} is \`${GetServerSetting(message.guild, "prefix").Value}\`!\n`;
			for (var c in BotData.Commands) {
				var cmd = BotData.Commands[c];
				if (cmd.access > AccessLevel(message.author, message.guild)) continue;
				if (typeof cmd.visibility == "function") if (cmd.visibility(message.author, message.guild) === false) continue;
				else if (cmd.visibility === false) continue;
				if (cmd.fun && !StringToBoolean(GetServerSetting(message.guild, "allowfuncommands").Value)) continue;
				pages[cpage] += `\n\`${GetServerSetting(message.guild, "prefix").Value}${cmd.name}`;
				if (cmd.arguments) cmd.arguments.forEach((argument) => pages[cpage] += ` <${argument}>`);
				pages[cpage] += `\`: *${cmd.description || "No description provided."}*`;
				if (++cnt > 16) {
					cnt = 0;
					pages[++cpage] = "";
				}
			}

			// Send the commands
			for (var page in pages) {
				message.author.send({
					embed: {
						title: `${BotData.GlobalData.LongName} Commands (${parseInt(page) + 1}/${pages.length})`,
						description: pages[page],
						author: {
							name: BotData.GlobalData.LongName,
							icon_url: BotData.GlobalData.Assets.Icons.Profile
						},
						footer: {
							text: `${BotData.GlobalData.LongName} v${BotData.GlobalData.Version.String}`
						},
					}
				}).catch(Log);
			}

			// Tell the user to check DMs
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} Check your DMs!`).catch(Log);
		}
	},

	// Invite command
	getinvite: {
		name: "getinvite",
		access: 0,
		description: "Gets an invite to this channel.",
		function: function(message) {
			if (AccessLevel(message.author, message.guild) < 1 && !message.guild.member(message.author).hasPermission("CREATE_INSTANT_INVITE", false, true, true))
				return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't create invites here!`);

			message.channel.createInvite({ temporary: false, maxAge: 0, maxUses: 1, unique: true }, `Created for ${message.author.tag}`).then((invite) => {
				message.channel.send(invite.url);
			}).catch((error) => {
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Error creating your invite: ${error}`).catch(Log);
			});
		}
	},

	// Level command
	level: {
		name: "level",
		access: 0,
		description: "Gets your level.",
		function: function(message) {
			if (typeof BotData.ServerData.AllServers.Levels[message.author.id] != "object") {
				BotData.ServerData.AllServers.Levels[message.author.id] = {
					Level: 0,
					Exp: 0
				}
			}
			var ldat = BotData.ServerData.AllServers.Levels[message.author.id];
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.OneHundred} You are at level ${ldat.Level} (Next level: ${ldat.Exp}/${BotData.GlobalData.Levels.ExpNeeded[ldat.Level + 1]} Exp).`).catch(Log);
		}
	},

	// Moderator commands
	// Access level for moderation commands is set to 0; each command has separate checks
	warn: {
		name: "warn",
		access: 0,
		visibility: function(user, guild) {
			var allow = false;
			user = guild.member(user);
			if (AccessLevel(user, guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true) || user.hasPermission("KICK_MEMBERS", false, true, true) || user.hasPermission("BAN_MEMBERS", false, true, true)) allow = true;
			return allow;
		},
		description: "Warns a user.",
		arguments: ["user", "reason"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author, message.guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true) || user.hasPermission("KICK_MEMBERS", false, true, true) || user.hasPermission("BAN_MEMBERS", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			var target = UserId(args.user);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			target = message.guild.members.get(target);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} I can't find this user!`).catch(Log);

			if ((user.highestRole.comparePositionTo(target.highestRole) < 1 && AccessLevel(user, message.guild) < 3) || AccessLevel(user, message.guild) <= AccessLevel(target, message.guild))
				return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot warn this user.`);

			if (typeof BotData.ServerData[message.guild.id].Warns[target.id] != "object") BotData.ServerData[message.guild.id].Warns[target.id] = [];
			BotData.ServerData[message.guild.id].Warns[target.id][BotData.ServerData[message.guild.id].Warns[target.id].length] = { time: Date.now(), reason: args.reason || "No reason specified." };

			target.send(`${BotData.GlobalData.Assets.Emoji.RedFlag} You have been warned in ${message.guild.name}: **${args.reason || "No reason specified."}**`);

			message.react(BotData.GlobalData.Assets.Emoji.Check);
			setTimeout(() => message.delete().catch(Log), 2000);
		}
	},

	warnings: {
		name: "warnings",
		access: 0,
		visibility: function(user, guild) {
			var allow = false;
			user = guild.member(user);
			if (AccessLevel(user, guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true) || user.hasPermission("KICK_MEMBERS", false, true, true) || user.hasPermission("BAN_MEMBERS", false, true, true)) allow = true;
			return allow;
		},
		description: "Displays a user's warnings.",
		arguments: ["user"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author, message.guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true) || user.hasPermission("KICK_MEMBERS", false, true, true) || user.hasPermission("BAN_MEMBERS", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			var target = UserId(args.user);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			target = message.guild.members.get(target);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} I can't find this user!`).catch(Log);

			if (typeof BotData.ServerData[message.guild.id].Warns[target.id] != "object") BotData.ServerData[message.guild.id].Warns[target.id] = [];

			if (BotData.ServerData[message.guild.id].Warns[target.id].length < 1) return message.channel.send("User has no warnings.");

			BotData.ServerData[message.guild.id].Warns[target.id].forEach((warning) => {
				message.channel.send({
					embed: {
						title: DateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss"),
						color: BotData.GlobalData.Assets.Colors.Warning,
						description: warning.reason
					}
				});
			});
		}
	},

	clearwarnings: {
		name: "clearwarnings",
		access: 0,
		visibility: function(user, guild) {
			var allow = false;
			user = guild.member(user);
			if (AccessLevel(user, guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true) || user.hasPermission("KICK_MEMBERS", false, true, true) || user.hasPermission("BAN_MEMBERS", false, true, true)) allow = true;
			return allow;
		},
		description: "Clears a user's warnings.",
		arguments: ["user"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author, message.guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true) || user.hasPermission("KICK_MEMBERS", false, true, true) || user.hasPermission("BAN_MEMBERS", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			var target = UserId(args.user);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			target = message.guild.members.get(target);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} I can't find this user!`).catch(Log);

			if ((user.highestRole.comparePositionTo(target.highestRole) < 1 && AccessLevel(user, message.guild) < 3) || AccessLevel(user, message.guild) <= AccessLevel(target, message.guild))
				return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot clear warnings for this user.`);

			BotData.ServerData[message.guild.id].Warns[target.id] = [];

			message.react(BotData.GlobalData.Assets.Emoji.Check);
			setTimeout(() => message.delete().catch(Log), 2000);
		}
	},

	nickname: {
		name: "nickname",
		access: 0,
		visibility: function(user, guild) {
			var allow = false;
			user = guild.member(user);
			if (AccessLevel(user, guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_NICKNAMES", false, true, true)) allow = true;
			return allow;
		},
		description: "Sets a user's nickname.",
		arguments: ["user", "nickname"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author, message.guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_NICKNAMES", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			var target = UserId(args.user);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			target = message.guild.members.get(target);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} I can't find this user!`).catch(Log);

			if (user != target && ((user.highestRole.comparePositionTo(target.highestRole) < 1 && AccessLevel(user, message.guild) < 3) || AccessLevel(user, message.guild) <= AccessLevel(target, message.guild)))
				return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot change this user's nickname.`);

			if (!args.nickname) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} No nickname specified.`).catch(Log);
			if (args.nickname.length > 32)
				return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Nicknames must be less than 32 characters!`).catch(Log);

			target.setNickname(args.nickname).then(() => {
				message.react(BotData.GlobalData.Assets.Emoji.Check);
				setTimeout(() => message.delete().catch(Log), 2000);
			}).catch((error) => {
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Error setting nickname: ${error}`).catch(Log);
			});
		}
	},

	mute: {
		name: "mute",
		access: 0,
		visibility: function(user, guild) {
			var allow = false;
			user = guild.member(user);
			if (AccessLevel(user, guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true) || user.hasPermission("MUTE_MEMBERS", false, true, true)) allow = true;
			return allow;
		},
		description: "Mutes a user.",
		arguments: ["user", "minutes", "reason"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author, message.guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true) || user.hasPermission("MUTE_MEMBERS", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			var target = UserId(args.user);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			target = message.guild.members.get(target);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} I can't find this user!`).catch(Log);

			if ((user.highestRole.comparePositionTo(target.highestRole) < 1 && AccessLevel(user, message.guild) < 3) || AccessLevel(user, message.guild) <= AccessLevel(target, message.guild))
				return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot mute this user.`);

			var time = parseInt(args.minutes);
			if (!time) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid time!`).catch(Log);
			time *= 60000;

			BotData.ServerData[message.guild.id].Muted[target.id] = Date.now() + time;

			target.send(`${BotData.GlobalData.Assets.Emoji.ZippedMouth} You have been muted for ${args.minutes} minutes in ${message.guild.name}: **${args.reason || "No reason specified."}**`);

			message.react(BotData.GlobalData.Assets.Emoji.Check);
			setTimeout(() => message.delete().catch(Log), 2000);
		}
	},

	unmute: {
		name: "unmute",
		access: 0,
		visibility: function(user, guild) {
			var allow = false;
			user = guild.member(user);
			if (AccessLevel(user, guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true) || user.hasPermission("MUTE_MEMBERS", false, true, true)) allow = true;
			return allow;
		},
		description: "Unmutes a user.",
		arguments: ["user"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author, message.guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true) || user.hasPermission("MUTE_MEMBERS", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			var target = UserId(args.user);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			target = message.guild.members.get(target);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} I can't find this user!`).catch(Log);

			if ((user.highestRole.comparePositionTo(target.highestRole) < 1 && AccessLevel(user, message.guild) < 3) || AccessLevel(user, message.guild) <= AccessLevel(target, message.guild))
				return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot unmute this user.`);

			BotData.ServerData[message.guild.id].Muted[target.id] = 0;

			target.send(`${BotData.GlobalData.Assets.Emoji.Check} You have been unmuted in ${message.guild.name}.`);

			message.react(BotData.GlobalData.Assets.Emoji.Check);
			setTimeout(() => message.delete().catch(Log), 2000);
		}
	},

	purge: {
		name: "purge",
		access: 0,
		visibility: function(user, guild) {
			var allow = false;
			user = guild.member(user);
			if (AccessLevel(user, guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true)) allow = true;
			return allow;
		},
		description: "Purges messages in a channel.",
		arguments: ["amount"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author, message.guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			var amount = parseInt(args.amount);
			if (!amount) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid amount!`).catch(Log);

			if (amount++ > 99) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Overwhelmed} I can only purge 99 messages at a time!`).catch(Log);

			message.channel.bulkDelete(amount, true).then((messages) => {
				var count = messages.size;
				if (count < amount) {
					message.channel.fetchMessages({ limit: amount - count }).then((messages) => {
						var z = 0;
						messages.forEach((msg) => setTimeout(() => msg.delete().catch(Log), z++ * 500));
						count += z;
						message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} Deleted ${count - 1} messages!`).then((message) => setTimeout(() => message.delete().catch(Log), 2000));
					});
				} else {
					message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} Deleted ${count - 1} messages!`).then((message) => setTimeout(() => message.delete().catch(Log), 2000));
				}
			});
		}
	},

	kick: {
		name: "kick",
		access: 0,
		visibility: function(user, guild) {
			var allow = false;
			user = guild.member(user);
			if (AccessLevel(user, guild) >= 1) allow = true;
			else if (user.hasPermission("KICK_MEMBERS", false, true, true)) allow = true;
			return allow;
		},
		description: "Kicks a user.",
		arguments: ["user", "reason"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author, message.guild) >= 1) allow = true;
			else if (user.hasPermission("KICK_MEMBERS", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			var target = UserId(args.user);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			target = message.guild.members.get(target);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} I can't find this user!`).catch(Log);

			if ((user.highestRole.comparePositionTo(target.highestRole) < 1 && AccessLevel(user, message.guild) < 3) || AccessLevel(user, message.guild) <= AccessLevel(target, message.guild))
				return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot kick this user.`);

			target.send(`${BotData.GlobalData.Assets.Emoji.Boot} You have been kicked from ${message.guild.name}: **${args.reason || "No reason specified."}**`);

			target.kick(args.reason || "No reason specified.").then(() => {
				message.react(BotData.GlobalData.Assets.Emoji.Check);
				setTimeout(() => message.delete().catch(Log), 2000);
			}).catch((error) => {
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Could not kick user: \`${error}\`!`).catch(Log);
				Log(error);
			});
		}
	},

	ban: {
		name: "ban",
		access: 0,
		visibility: function(user, guild) {
			var allow = false;
			user = guild.member(user);
			if (AccessLevel(user, guild) >= 1) allow = true;
			else if (user.hasPermission("BAN_MEMBERS", false, true, true)) allow = true;
			return allow;
		},
		description: "Bans a user.",
		arguments: ["user", "reason"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author, message.guild) >= 1) allow = true;
			else if (user.hasPermission("BAN_MEMBERS", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			var target = UserId(args.user);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);

			var mtarget = message.guild.members.get(target);
			if (mtarget) {
				if ((user.highestRole.comparePositionTo(mtarget.highestRole) < 1 && AccessLevel(user, message.guild) < 3) || AccessLevel(user, message.guild) <= AccessLevel(target, message.guild))
					return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot ban this user.`);

				mtarget.send(`${BotData.GlobalData.Assets.Emoji.Hammer} You have been banned from ${message.guild.name}: **${args.reason || "No reason specified."}**`);
			}

			message.guild.ban(target, { reason: args.reason || "No reason specified." }).then(() => {
				message.react(BotData.GlobalData.Assets.Emoji.Check);
				setTimeout(() => message.delete().catch(Log), 2000);
			}).catch((error) => {
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Could not ban user: \`${error}\`!`).catch(Log);
				Log(error);
			});
		}
	},

	unban: {
		name: "unban",
		access: 0,
		visibility: function(user, guild) {
			var allow = false;
			user = guild.member(user);
			if (AccessLevel(user, guild) >= 1) allow = true;
			else if (user.hasPermission("BAN_MEMBERS", false, true, true)) allow = true;
			return allow;
		},
		description: "Unbans a user.",
		arguments: ["user", "reason"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author, message.guild) >= 1) allow = true;
			else if (user.hasPermission("BAN_MEMBERS", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			var target = UserId(args.user);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);

			message.guild.unban(target, args.reason || "No reason specified.").then(() => {
				message.react(BotData.GlobalData.Assets.Emoji.Check);
				setTimeout(() => message.delete().catch(Log), 2000);
			}).catch((error) => {
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Could not ban user: \`${error}\`!`).catch(Log);
				Log(error);
			});
		}
	},

	softban: {
		name: "softban",
		access: 0,
		visibility: function(user, guild) {
			var allow = false;
			user = guild.member(user);
			if (AccessLevel(user, guild) >= 1) allow = true;
			else if (user.hasPermission("BAN_MEMBERS", false, true, true)) allow = true;
			return allow;
		},
		description: "Bans and immediately unbans a user to clear messages.",
		arguments: ["user", "days", "reason"],
		function: function(message, args) {
			var user = message.guild.member(message.author);
			var days = parseInt(args.days) || 7;

			var allow = false;
			if (AccessLevel(message.author, message.guild) >= 1) allow = true;
			else if (user.hasPermission("BAN_MEMBERS", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			var target = UserId(args.user);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);

			var mtarget = message.guild.members.get(target);
			if (mtarget) {
				if ((user.highestRole.comparePositionTo(mtarget.highestRole) < 1 && AccessLevel(user, message.guild) < 3) || AccessLevel(user, message.guild) <= AccessLevel(target, message.guild))
					return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot softban this user.`);

				mtarget.send(`${BotData.GlobalData.Assets.Emoji.Hammer} You have been softbanned from ${message.guild.name}: **${args.reason || "No reason specified."}**. You may rejoin with a new invite link.`);
			}

			message.guild.ban(target, { days: days, reason: args.reason || "No reason specified." }).then(() => {
				message.guild.unban(target, { reason: `Softban - ${args.reason || "No reason specified."}`}).then(() => {
					message.react(BotData.GlobalData.Assets.Emoji.Check);
					setTimeout(() => message.delete().catch(Log), 2000);
				}).catch((error) => {
					message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Could not unban user: \`${error}\`!`).catch(Log);
					Log(error);
				});
			}).catch((error) => {
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Could not ban user: \`${error}\`!`).catch(Log);
				Log(error);
			});
		}
	},

	role: {
		name: "role",
		access: 0,
		visibility: function(user, guild) {
			var allow = false;
			user = guild.member(user);
			if (AccessLevel(user, guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_ROLES", false, true, true)) allow = true;
			return allow;
		},
		description: "Command for managing users' roles.",
		arguments: ["add/remove", "user", "role"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author, message.guild) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_ROLES", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			var target = UserId(args.user);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			target = message.guild.members.get(target);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} I can't find this user!`).catch(Log);

			if ((user.highestRole.comparePositionTo(target.highestRole) < 1 && AccessLevel(user, message.guild) < 3) || AccessLevel(user, message.guild) <= AccessLevel(target, message.guild))
				return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot manage this user's roles.`);

			if (!args.role) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} No role specified!`).catch(Log);
			var role = message.guild.roles.find((role) => role.name.toLowerCase() == args.role.toLowerCase());
			if (!role) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid role!`).catch(Log);

			if ((user.highestRole.comparePositionTo(role) < 1 && AccessLevel(user, message.guild) < 3) || AccessLevel(user, message.guild) <= AccessLevel(target, message.guild))
				return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot add or remove this role.`);


			var mode = args["add/remove"];
			if (mode) mode = mode.toLowerCase();

			switch (mode) {
				case "add":
					target.addRole(role).then(() => {
						message.react(BotData.GlobalData.Assets.Emoji.Check);
						setTimeout(() => message.delete().catch(Log), 2000);
					}).catch((error) => {
						message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Could not add role: \`${error}\`!`).catch(Log);
						Log(error);
					});
					break;
				case "remove":
					target.removeRole(role).then(() => {
						message.react(BotData.GlobalData.Assets.Emoji.Check);
						setTimeout(() => message.delete().catch(Log), 2000);
					}).catch((error) => {
						message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Could not remote role: \`${error}\`!`).catch(Log);
						Log(error);
					});
					break;
				default:
					message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid mode!`).catch(Log);
			}
		}
	},

	// Utility and fun commands
	avatar: {
		name: "avatar",
		access: 0,
		description: "Gets a user's avatar.",
		arguments: ["user"],
		function: function(message, args) {
			var target;
			if (args.user) target = UserId(args.user);
			else target = message.author.id;

			Client.fetchUser(target).then((user) => {
				message.channel.send({
					embed: {
						title: `${user.tag}'s avatar`,
						color: BotData.GlobalData.Assets.Colors.Primary,
						image: {
							url: user.avatarURL
						}
					}
				});
			}).catch((error) => {
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Could not find that user!`).catch(Log);
				Log(error);
			});
		}
	},

	emote: {
		name: "emote",
		access: 0,
		description: "Gets the image of an emote.",
		arguments: ["emote"],
		function: function(message, args) {
			if (!args.emote) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} No emote specified!`).catch(Log);
			var emote = args.emote.match(/<(a?):([a-z0-9\-_]+):(\d+)>/i);

			if (emote != null) {
				var anim = emote[1];
				var name = emote[2];
				emote = emote[3];

				message.channel.send({
					embed: {
						title: `Emote :${name}:`,
						color: BotData.GlobalData.Assets.Colors.Primary,
						image: {
							url: `https://cdn.discordapp.com/emojis/${emote}.${(anim) ? "gif" : "png"}`
						}
					}
				});
			} else {
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid emote!`).catch(Log);
			}
		}
	},

	dice: {
		name: "dice",
		access: 0,
		description: "Rolls some dice.",
		arguments: ["dice"],
		fun: true,
		function: function(message, args) {
			var num = parseInt(args.dice);
			if (!num) num = 2;
			if (num < 1) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Nothing to roll.`);
			if (num > 100) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Overwhelmed} That's too many!!`);

			var total = 0;
			var rolls = [];
			for (var i = 0; i < num; i++) {
				var roll = Random(1, 6);
				rolls[i] = roll;
				total += roll;
			}

			message.channel.send(`You rolled: **${rolls.join("**, **")}** (Total: **${total}**)`);
		}
	},

	"8ball": {
		name: "8ball",
		access: 0,
		description: "Gets an answer from the 8 ball.",
		fun: true,
		function: function(message) {
			var responses = [
				"It is certain.", "It is decidedly so.", "Without a doubt.", "Yes - definitely.", "You may rely on it.",
				"As I see it, yes.", "Most likely.", "Outlook good.", "Yes.", "Signs point to yes.",
				"Reply hazy, try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.",
				"Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful."
			];
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.EightBall} **${responses[Random(0, responses.length - 1)]}**`);
		}
	},

	random: {
		name: "random",
		access: 0,
		description: "Gets a random number.",
		arguments: ["min", "max"],
		fun: true,
		function: function(message, args) {
			var min = parseInt(args.min);
			var max = parseInt(args.max);
			if (isNaN(min) || isNaN(max)) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Please pick a minimum and maximum value!`);
			message.channel.send(`The number is ${Random(min, max)}!`);
		}
	},

	match: {
		name: "match",
		access: 0,
		description: "Tests how compatible two people are.",
		arguments: ["person 1", "person 2"],
		fun: true,
		function: function(message, args) {
			var p1 = args["person 1"];
			var p2 = args["person 2"];
			if (!p1 || !p2) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Please specify two people!`);
			p1 = p1.toLowerCase();
			p2 = p2.toLowerCase().split(" ")[0];

			function n(str) {
				var i = 0;
				for (var j = 0; j < str.length; j++) i += str.charCodeAt(j);
				return i;
			}

			var s = Math.round((n(p1) + n(p2)) / (p1.length % p2.length + 1)) % 100;

			var m = "Perfect!";
			if (s < 100) m = "Excellent!";
			if (s < 90) m = "Great!";
			if (s < 75) m = "Good!";
			if (s < 65) m = "Not bad!";
			if (s < 60) m = "Fair";
			if (s < 50) m = "Not great";
			if (s < 40) m = "Bad";
			if (s < 25) m = "Awful";
			if (s < 10) m = "Horrible";

			var l = "";
			for (var i = 0.5; i < s / 10; i++) l += "\u2588";
			while (l.length < 10) l += "\u2591";

			var c = BotData.GlobalData.Assets.Colors.Warning;
			if (s >= 67) c = BotData.GlobalData.Assets.Colors.Success;
			if (s <= 33) c = BotData.GlobalData.Assets.Colors.Error;

			message.channel.send({
				embed: {
					title: `${m}        ${l}`,
					description: `Compatibility: **${s}%**`,
					color: c
				}
			}).catch(Log);
		}
	},

	kitten: {
		name: "kitten",
		access: 0,
		description: "Gets an image of a kitten.",
		fun: true,
		function: function(message) {
			var r = Random(300, 854);
			message.channel.send("Nyew!", {
				files: [
					new Discord.Attachment(`https://placekitten.com/g/${r}/${Math.round(r * 9 / 16)}`, "placekitten.jpeg")
				]
			}).catch(Log);
		}
	},

	dadjoke: {
		name: "dadjoke",
		access: 0,
		description: "Gets a dad joke.",
		fun: true,
		function: function(message) {
			Request("https://icanhazdadjoke.com/", { json: true }, (error, _response, body) => {
				if (error) {
					Log(error);
					message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} There was an error: ${error}`).catch();
				}

				message.channel.send(`> ${BotData.GlobalData.Assets.Emoji.Dad} ${body.joke || "error"}`).catch(Log);
			});
		}
	},

	trump: {
		name: "trump",
		access: 0,
		description: "Gets a random trump quote.",
		fun: true,
		function: function(message) {
			Request("https://api.tronalddump.io/random/quote", { json: true }, (error, _response, body) => {
				if (error) {
					Log(error);
					message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} There was an error: ${error}`).catch();
				}

				message.channel.send(`> ${BotData.GlobalData.Assets.Emoji.Orange} ${body.value}`).catch(Log);
			});
		}
	},

	rps: {
		name: "rps",
		access: 0,
		description: "Play a game of rock-paper-scissors.",
		arguments: ["hand"],
		fun: true,
		function: function(message, args) {
			if (!args.hand) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You didn't pick anything!`).catch(Log);
			var hand = args.hand.toLowerCase();
			if (hand == "rock") hand = 2;
			else if (hand == "scissors") hand = 1;
			else if (hand == "paper") hand = 0;
			else return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You can't use that!`).catch(Log);

			var bhand = Random(0, 2);
			var result = "You win!";
			if (hand == bhand) result = "It's a tie!";
			if (bhand - hand == 1 || bhand - hand == -2) result = "I win!";

			message.channel.send({
				embed: {
					title: "Rock paper scissors",
					description: `I chose **${["paper", "scissors", "rock"][bhand]}**.\nYou chose **${args.hand}**.\n***${result}***`,
					color: BotData.GlobalData.Assets.Colors.Secondary
				}
			});
		}
	},

	// Search commands
	wikipedia: {
		name: "wikipedia",
		access: 0,
		description: "Searches wikipedia for the given term.",
		arguments: ["term"],
		function: function(message, args) {
			if (!args.term) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You did not specify a term!`).catch(Log);
			var term = args.term;
			if (term != FilterNSFW(term) && !message.channel.nsfw)
				return message.channel.send(`${BotData.GlobalData.Assets.Emoji.RedFlag} Your search contained terms that can only be used in channels marked as NSFW!`).catch(Log);

			Request(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${term}&limit=1&namespace=0&format=json`, { json: true }, (error, _, body) => {
				if (body.error) error = body.error.info;
				if (error) {
					Log(error);
					return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Warning} Error: \`${error}\``).catch(Log);
				}

				var data = [
					body[1][0],
					body[3][0]
				];

				Request(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${data[0]}&format=json&exchars=320`, { json: true }, (error, _response, body) => {
					if (error) {
						Log(error);
						return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Warning} Error: \`${error}\``).catch(Log);
					}

					message.channel.send({
						embed: {
							title: `${data[0]} on Wikipedia`,
							description: `${body.query.pages[Object.keys(body.query.pages)[0]].extract}\n[View full article](${data[1]})`,
							color: BotData.GlobalData.Assets.Colors.Secondary,
							footer: {
								text: `Requested by ${message.author.tag}`
							}
						}
					}).catch(Log);
				});
			});
		}
	},

	urban: {
		name: "urban",
		access: 0,
		description: "Shows the Urban Dictionary entry for the given term.",
		arguments: ["term"],
		function: function(message, args) {
			if (!args.term) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You did not specify a term!`).catch(Log);
			var term = args.term;
			if (term != FilterNSFW(term) && !message.channel.nsfw)
				return message.channel.send(`${BotData.GlobalData.Assets.Emoji.RedFlag} Your search contained terms that can only be used in channels marked as NSFW!`).catch(Log);

			message.channel.send(`https://www.urbandictionary.com/define.php?term=${term.replace(/ /g, "+")}`);
		}
	}
};

// Data functions
function LoadData() {
	Log("[i] Loading bot data...");
	try {
		var txt = FileSystem.readFileSync(`${BotData.GlobalData.DataPath}/data.json`);
		BotData.ServerData = JSON.parse(txt);
		Log(`[i] Loaded ${txt.length} bytes`);
	} catch (e) {
		Log(`[!] Could not load bot data from file, moving on without!\n\t${e}`);
	}
	if (!BotData.ServerData.AllServers) BotData.ServerData.AllServers = {};
	if (!BotData.ServerData.AllServers.Levels) BotData.ServerData.AllServers.Levels = {};
	if (!BotData.ServerData.AllServers.LevelCooldowns) BotData.ServerData.AllServers.LevelCooldowns = {};
	setInterval(() => {
		for (var id in BotData.ServerData.AllServers.LevelCooldowns) {
			c = BotData.ServerData.AllServers.LevelCooldowns[id];
			if (c > 0) BotData.ServerData.AllServers.LevelCooldowns[id]--;
		}
	}, 1000);
	Log(`[i] Level cooldown timer started`);
}

function SaveData() {
	Log("[i] Saving bot data...");
	try {
		var txt = JSON.stringify(BotData.ServerData);
		FileSystem.writeFileSync(`${BotData.GlobalData.DataPath}/data@${DateFormat(Date.now(), "yyyy-mm-dd_HH-MM-ss")}.json`, txt);
		FileSystem.writeFileSync(`${BotData.GlobalData.DataPath}/data.json`, txt);
		Log(`[i] Saved ${txt.length} bytes`);
	} catch (e) {
		Log("[!] COULD NOT SAVE BOT DATA!");
		Log(e);
	}
}

// Server settings functions
function InitializeServer(guild) {
	if (BotData.ServerData[guild.id]) return;
	BotData.ServerData[guild.id] = {
		AccessLevels: {
			[guild.owner.id]: 2
		},
		Warns: {},
		Muted: {},
		Settings: {}
	}
	Log(`[i] Initialized server ${guild.id}`);
}

function GetServerSetting(guild, key) {
	Log(key);
	var s = BotData.ServerData[guild.id];
	if (!s) InitializeServer(guild);
	if (!s.Settings) BotData.ServerData[guild.id].Settings = {}; // Temporary fix for servers using pre-0.11 format, remove after 2020/05/20
	
	if (!s.Settings[key]) {
		var l = null;
		for (var ll in BotData.GlobalData.ServerSettings) if (BotData.GlobalData.ServerSettings[ll].Key == key) l = BotData.GlobalData.ServerSettings[ll];
		if (!l) return false;
		if (l.Default) {
			BotData.ServerData[guild.id].Settings[key] = {
				Value: l.Default,
				Disabled: false
			}
		} else {
			BotData.ServerData[guild.id].Settings[key] = {
				Value: undefined,
				Disabled: true
			}
		}
	}

	return BotData.ServerData[guild.id].Settings[key];
}

// Id getters
function UserId(text) {
	if (!text) return false;
	var user = text.match(/<?@?!?(\d+)>?/);
	if (!user) return false;
	return user[1] || false;
}

function RoleId(text) {
	if (!text) return false;
	var role = text.match(/<?@?&?(\d+)>?/);
	if (!role) return false;
	return role[1] || false;
}

function ChannelId(text) {
	if (!text) return false;
	var channel = text.match(/<?#?(\d+)>?/);
	if (!channel) return false;
	return channel[1] || false;
}

// User functions
function AccessLevel(user, guild) {
	var al = BotData.GlobalData.AccessLevels[user.id] || 0;
	if (al >= 0 && al <= 2) al = BotData.ServerData[guild.id].AccessLevels[user.id] || 0;
	if (al == 0) {
		var role = GetServerSetting(guild, "moderatorrole");
		if (!role.Disabled) {
			role = RoleId(role.Value);
			if (!role) return al;
			if (guild.member(user).roles.has(role)) return 1;
		}
	}
	return al;
}

function AddExp(user, exp, channel) {
	var levels = BotData.ServerData.AllServers.Levels;
	var cooldowns = BotData.ServerData.AllServers.LevelCooldowns;

	if (!cooldowns[user.id]) cooldowns[user.id] = 0;
	if (cooldowns[user.id] > 0) return;
	cooldowns[user.id] = BotData.GlobalData.Levels.Cooldown;

	if (!levels[user.id]) levels[user.id] = { Level: 0, Exp: 0 };
	var level = levels[user.id].Level;
	levels[user.id].Exp += exp;

	if (levels[user.id].Exp >= BotData.GlobalData.Levels.ExpNeeded[level + 1]) {
		levels[user.id].Level = level + 1;
		var message = GetServerSetting(channel.guild, "levelmessage");
		if (message.Disabled) return;
		channel.send(message.Value.replace("{level}", "" + levels[user.id].Level).replace("{name}", user.tag).replace("{mention}", `<@${user.id}>`)).catch(Log);
	}
	
	return;
	if (!BotData.ServerData.AllServers.LevelCooldowns[user.id]) BotData.ServerData.AllServers.LevelCooldowns[user.id] = 0;
	if (BotData.ServerData.AllServers.LevelCooldowns[user.id] != 0) return;
	BotData.ServerData.AllServers.LevelCooldowns[user.id] = BotData.GlobalData.Levels.Cooldown;
	if (!BotData.ServerData.AllServers.Levels[user.id]) BotData.ServerData.AllServers.Levels[user.id] = { Level: 0, Exp: 0 };
	var plvl = BotData.ServerData.AllServers.Levels[user.id].Level;
	var nlvl = BotData.ServerData.AllServers.Levels[user.id].Level + 1;
	BotData.ServerData.AllServers.Levels[user.id].Exp += exp;
	if (BotData.ServerData.AllServers.Levels[user.id].Exp >= BotData.GlobalData.Levels.ExpNeeded[nlvl]) BotData.ServerData.AllServers.Levels[user.id].Level = nlvl;
	if (BotData.ServerData.AllServers.Levels[user.id].Level > plvl && BotData.ServerData[channel.guild.id].ShowLevelMessages !== false) channel.send(`Congratulations ${user.username}, you reached level ${nlvl}!`);
}

// Data type functions
function StringToBoolean(string) {
	if (string.toLowerCase() == "true" || string.toLowerCase() == "yes") return true;
	if (parseInt(string) && parseInt(string) != 0) return true;
	return false;	
}

function BooleanToString(boolean) {
	return (boolean) ? "true" : "false";
}

function IntegerToBoolean(integer) {
	return integer != 0;
}

function BooleanToInteger(boolean) {
	return (boolean) ? 1 : 0;
}

// Random function
function Random(min, max, int = true) {
	var f = Math.random() * (max - min) + min;
	return (int === true) ? Math.round(f) : f;
}

// NSFW filter function
function FilterNSFW(text) {
	if (!text) return "";
	return text.replace(BotData.GlobalData.NSFWFilter, "_");
}

// Server logging function
function ServerLog(guild, data) {
	try {
		var channel = GetServerSetting(guild, "logchannel");
		if (channel.Disabled) return;
		channel = guild.channels.get(ChannelId(channel.Value));
		if (!channel) return;

		var emb = {
			title: data.title || "Action",
			description: data.description || "Description",
			color: data.color || BotData.GlobalData.Assets.Colors.Primary,
			author: {
				name: `${BotData.GlobalData.Name} Logs`,
				icon_url: BotData.GlobalData.Assets.Icons.Profile
			},
			footer: {
				text: DateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss")
			}
		};
		if (data.image) {
			emb.thumbnail = {};
			emb.thumbnail.url = data.image;
		}

		if (channel) channel.send({
			embed: emb
		}).catch(Log);
	} catch (e) {
		Log(e);
	}
}

// Server logging events
Client.on("guildMemberAdd", (member) => {
	try {
		ServerLog(member.guild, { title: "User joined", description: member.user.tag, color: BotData.GlobalData.Assets.Colors.Success, image: member.user.avatarURL });
		var channel = GetServerSetting(member.guild, "welcomechannel");
		if (channel.Disabled) return;
		channel = member.guild.channels.get(ChannelId(channel.Value));
		if (!channel) return;
		var message = GetServerSetting(member.guild, "welcomemessage").Value;
		channel.send(message.replace("{server}", member.guild.name).replace("{name}", member.user.tag).replace("{mention}", `<@${member.id}>`)).catch(Log);
	} catch (e) {
		Log(e);
	}
});
Client.on("guildMemberRemove", (member) => {
	try {
		ServerLog(member.guild, { title: "User left", description: member.user.tag, color: BotData.GlobalData.Assets.Colors.Error, image: member.user.avatarURL });
	} catch (e) {
		Log(e);
	}
});

Client.on("guildBanAdd", (guild, user) => {
	try {
		ServerLog(guild, { title: "User banned", description: user.tag, color: BotData.GlobalData.Assets.Colors.Error, image: user.avatarURL });
	} catch (e) {
		Log(e);
	}
});
Client.on("guildBanRemove", (guild, user) => {
	try {
		ServerLog(guild, { title: "User unbanned", description: user.tag, color: BotData.GlobalData.Assets.Colors.Success, image: user.avatarURL });
	} catch (e) {
		Log(e);
	}
});
Client.on("guildMemberUpdate", (oldmbr, newmbr) => {
	try {
		if (oldmbr.nickname != newmbr.nickname)
			ServerLog(newmbr.guild, { title: "Nickname changed", description: `<@${newmbr.id}>\nOld nickname: **${oldmbr.nickname || "(No nickname)"}**\nNew nickname: **${newmbr.nickname || "(No nickname)"}**`, color: BotData.GlobalData.Assets.Colors.Primary, image: newmbr.user.avatarURL });
	} catch (e) {
		Log(e);
	}
});

Client.on("roleCreate", (role) => {
	try {
		ServerLog(role.guild, { title: "Role created", description: `${role.name} <@&${role.id}>`, color: role.color || BotData.GlobalData.Assets.Colors.Success });
	}
	catch (e) {
		Log(e);
	}
});
Client.on("roleDelete", (role) => {
	try {
		ServerLog(role.guild, { title: "Role deleted", description: `${role.name} (${role.id})`, color: role.color || BotData.GlobalData.Assets.Colors.Error });
	}
	catch (e) {
		Log(e);
	}
});
Client.on("roleUpdate", (oldrole, newrole) => {
	try {
		ServerLog(role.guild, { title: "Role updated", description: `${oldrole.name} <@&${oldrole.id}> => ${newrole.name} <@${newrole.id}>`, color: newrole.color || BotData.GlobalData.Assets.Colors.Error });
	}
	catch (e) {
		Log(e);
	}
});

Client.on("channelCreate", (channel) => {
	try {
		if (channel.guild)
			ServerLog(channel.guild, { title: "Channel created", description: `<#${channel.id}>`, color: BotData.GlobalData.Assets.Colors.Success });
	} catch (e) {
		Log(e);
	}
});
Client.on("channelDelete", (channel) => {
	try {
		if (channel.guild)
			ServerLog(channel.guild, { title: "Channel deleted", description: `#${channel.name} (${channel.id})`, color: BotData.GlobalData.Assets.Colors.Error });
	} catch (e) {
		Log(e);
	}
});
Client.on("channelUpdate", (oldch, newch) => {
	try {
		if (channel.guild)
			ServerLog(newch.guild, { title: "Channel updated", description: `<#${oldch.id}> => <#${newch.id}>`, color: BotData.GlobalData.Assets.Colors.Primary });
	} catch (e) {
		Log(e);
	}
});

Client.on("messageUpdate", (oldmsg, newmsg) => {
	try {
		if (newmsg.guild && newmsg.author != Client.user && oldmsg.content != newmsg.content)
			ServerLog(newmsg.guild, { title: "Message edited", description: `from <@${newmsg.author.id}> in channel <#${newmsg.channel.id}>\n>>> **Before:**\n${oldmsg.content}\n\n**After:**\n${newmsg.content}` });
	} catch (e) {
		Log(e);
	}
});
Client.on("messageDelete", (message) => {
	try {
		if (message.guild && message.author != Client.user)
			ServerLog(message.guild, { title: "Message deleted", description: `from <@${message.author.id}> in channel <#${message.channel.id}>\n>>> ${message.content}`, color: BotData.GlobalData.Assets.Colors.Error });
	} catch (e) {
		Log(e);
	}
});
Client.on("messageDeleteBulk", (messages) => {
	try {
		if (messages.first().guild)
			ServerLog(messages.first().guild, { title: "Messages deleted", description: `${messages.array().length} messages deleted in <#${messages.first().channel.id}>`, color: BotData.GlobalData.Assets.Colors.Error });
	} catch (e) {
		Log(e);
	}
});

// Load the bot
LoadData();
setInterval(SaveData, BotData.GlobalData.SaveInterval * 1000);

Client.on("guildCreate", (guild) => {
	if (!guild) return Log(`[!] Guild ${guild.id} doesn't exist!`);
	InitializeServer(guild);
	try {
		var channel;
		guild.channels.forEach((c) => {
			if (typeof c.send == "function" && !channel) channel = c;
		})
		channel.send(`Hello there, my name is ${BotData.GlobalData.Name}. Thanks for adding me to your server! To get started, say **${BotData.GlobalData.DefaultPrefix}info**.`);
	} catch (e) {
		Log(e);
	}
});

Client.on("message", (message) => {
	// Don't try to work in a DM
	if (!message.guild) return;
	// Just in case
	InitializeServer(message.guild);
	// Is the user muted?
	if (typeof BotData.ServerData[message.guild.id].Muted[message.author.id] == "number") {
		if (BotData.ServerData[message.guild.id].Muted[message.author.id] > Date.now()) {
			// Log message
			Log(`[.] [G${message.guild.id}C${message.channel.id}] U${message.author.id}, muted message:\n\tID: ${message.id}\n\tContent: \`${message.content}\``);
			// If mute is active, delete the message and send it to the user
			try {
				message.author.send(
					`${BotData.GlobalData.Assets.Emoji.ZippedMouth} **[${message.guild.name}]** Oh no, you're muted!`,
					{
						embed: {
							title: "Your message",
							color: BotData.GlobalData.Assets.Colors.Error,
							description: message.content
						}
					}
				).catch(Log);
			} catch (e) {
				Log(e);
			}
			// If the user isn't global mod+ delete the message
			if (AccessLevel(message.author, message.guild) < 3) {
				message.delete().catch(Log);
				return;
			}
		} else {
			// If mute is expired remove the must from the list
			BotData.ServerData[message.guild.id].Muted[message.author.id] = null;
		}
	}
	// Is command?
	var prefix = GetServerSetting(message.guild, "prefix").Value;
	if (message.content.startsWith(prefix) && !message.content.startsWith(prefix + " ")) {
		// Is user blacklisted, or is user a bot?
		if ((BotData.GlobalData.AccessLevels[message.author.id] || 0) < 0 || message.author.bot) return;
		// Start typing to make the bot feel less like a bot
		message.channel.startTyping();
		// Create the array of arguments
		var args = message.content.slice(prefix.length).split(" ");
		var command = BotData.Commands[args.shift().toLowerCase()];
		// Does the command exist?
		if (typeof command == "object") {
			// Check if the user can use this command
			if (AccessLevel(message.author, message.guild) < command.access) {
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch("Log");
				return message.channel.stopTyping();
			}
			// Check if the command is fun and fun commands are disabled
			if (command.fun && !StringToBoolean(GetServerSetting(message.guild, "allowfuncommands").Value)) {
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Fun commands are disabled.`).catch("Log");
				return message.channel.stopTyping();
			}
			// Log command
			Log(`[$] [G${message.guild.id}C${message.channel.id}] U${message.author.id}, executed command:\n\tCommand: \`${command.name}\`\n\tArguments: [${((args.length > 0) ? "`" : "") + args.join("`, `") + ((args.length > 0) ? "`" : "")}]`);
			try {
				ServerLog(message.guild, { title: "Command used", description: `<@${message.author.id}> used command **${prefix}${command.name}** ${(args.length > 0) ? "with arguments [" + args.join(", ") + "]" : ""}`, color: BotData.GlobalData.Assets.Colors.Primary });
			} catch (e) {
				Log(e);
			}
			// Prepare the arguments for the command
			var nargs = args;
			if (typeof command.arguments == "object") {
				nargs = {};
				var cnt = 0;
				var argl = args.length;
				for (var arg in command.arguments) {
					nargs[command.arguments[arg]] = args.shift();
					if (++cnt == command.arguments.length && argl > command.arguments.length)
						nargs[command.arguments[arg]] += " " + args.join(" ");
				}
			}
			// Try to execute the command
			try {
				command.function(message, nargs);
			} catch (e) {
				Log(`[!] Command not executed: ${e}\n\t${e.stack || "No further details."}`);
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.Warning} There was an error executing this command: ${e}\n\`${e.stack || "No further details"}\``).catch(Log);
			}
		} else {
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} That command doesn't exist! Try \`${prefix}help\``).catch(Log);
		}
	} else {
		if (message.author.id == Client.user.id) return message.channel.stopTyping();
		// Log message
		Log(`["] [G${message.guild.id}C${message.channel.id}] U${message.author.id}, send message:\n\tID: ${message.id}\n\tContent: \`${message.content}\``);
		if (message.author.bot) return message.channel.stopTyping();
		// Is bot mention?
		if (typeof message.mentions.users.first() != "undefined" && message.mentions.users.first().id == Client.user.id)
			message.channel.send(`Hello ${message.author}, my prefix is \`${prefix}\`.`).catch(Log);
		// Give user exp
		else AddExp(message.author, BotData.GlobalData.Levels.ExpPerChat, message.channel);
	}
	// The end, stop typing
	message.channel.stopTyping();
});

Client.on("ready", () => {
	Log(`[i] Bot logged in at ${DateFormat(Date.now(), "yyyy-mm-dd HH:MM:ss")}`);

	setInterval(() => {
		Client.user.setPresence({
			game: {
				name: `${Client.guilds.size} servers; ${Client.users.size} users`,
				type: 3
			}
		}).catch(Log);
	}, 5000);
});

Log("[i] Attempting login...");
Client.login(BotData.GlobalData.Token);