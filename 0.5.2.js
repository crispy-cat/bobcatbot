/* BobCatBot Alpha 0.5.2
 * Created by crispycat
 * Bobcat project started 2019/10/27
*/

if (process.env.NODE_ENV != "production") require("dotenv").config();

var FileSystem = require("fs");
var Unzip = require("unzip");
var Request = require("request").defaults({ headers: { "User-Agent": "BobCatBot 0.5.0; Bobcat Discord bot" } });
var DateFormat = require("dateformat");
var Discord = require("discord.js");
var Log = console.log;

var Client = new Discord.Client();
var BotData = {};

// Bot settings data
BotData.GlobalData = {
	// Info
	Name: "Bobcat",
	LongName: "Bobcat Alpha",
	DefaultPrefix: ">",
	Version: {
		Major: 0,
		Minor: 5,
		Patch: 2,
		String: "0.5.2"
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
		"654051938605727785": 4,
		"423102128328802306": 4,
		"492795527038238751": 3,
		"333986101238693890": 3,
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
			Up: "\u{1f53a}",
			Down: "\u{1f53b}",
			PingPong: "\u{1f3d3}",
			OneHundred: "\u{1f4af}",
			ZippedMouth: "\u{1f910}"
		}
	},
	// Level system settings
	Levels: {
		ExpPerChat: 3,
		ExpNeeded: [
			0, 12, 24, 48, 96, 192, 384, 768, 1536, 3072, 6144,
			12288, 24576, 49152, 98304, 196608, 393216, 786432,
			1572864, 3145728, 6291456, 12582912, 25165824,
			50331648, 100663296, 201326592, 402653184,
			805306368, 1610612736, 3221225472, 6442450944,
			12884901888, 25769803776, 51539607552,
			103079215104, 206158430208, 412316860416,
			824633720832, 1649267441664, 3298534883328,
			6597069766656, 13194139533312, 26388279066624
		]
	},
	// Save path and token
	DataPath: "./save/botdata.json",
	SaveInterval: 30,
	Token: process.env.bot_token
}

BotData.ServerData = {};

// The most important part - the commands!
BotData.Commands = {
	/* Commands are defined as follows:
	 * command: {
	 *	name: [command name as string],
	 *	access: [access level as integer, 0-4],
	 *	description: [optional description for the help command as string],
	 *	args: [optional array object of arguments for the command],
	 *	function: [function which accepts args (message, args)]
	 * }
	 */

	// Debug and data commands
	exec: {
		name: "exec",
		access: 4, // DO NOT SET THIS TO < 4 IF YOU WANT TO KEEP YOUR COMPUTER AND TOKEN SAFE!!
		description: "Code execution command",
		arguments: ["code"],
		function: function(message, args) {
			message.channel.send(`Result: \`${ eval(args.code)}\``).catch(Log);
		}
	},

	sudo: {
		name: "sudo",
		access: 4, // DO NOT SET THIS TO < 4 IF YOU WANT TO KEEP YOUR COMPUTER AND TOKEN SAFE!!
		description: "Execute as user",
		arguments: ["user", "command", "arguments"],
		function: function(message, args) {
			if (!args.user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			var user = args.user.match(/<?@?!?(\d+)>?/);
			if (!user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			user = message.guild.members.get(user);
			var command = BotData.Commands[args.command];

			var args = [];
			if (args.arguments) args = args.arguments.split(" ");

			if (typeof command == "object") {
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
				var nmessage = message;
				nmessage.author = user.user;

				command.function(nmessage, nargs);
			} else {
				message.channel.send("Command does not exist!");
			}
		}
	},

	save: {
		name: "save",
		access: 3,
		description: "Save bot data",
		function: function(message, _) {
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.Up} Saving data...`).catch(Log);
			SaveData();
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} Saved!`).catch(Log);
		}
	},

	reload: {
		name: "reload",
		access: 3,
		description: "Reload bot data",
		function: function(message, _) {
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.Down} Attempting to reload data...`).catch(Log);
			try {
				LoadData();
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} Reloaded!`).catch(Log);
			} catch (e) {
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Data could not be reloaded, ${e}`).catch(Log);
			}
		}
	},

	stop: {
		name: "stop",
		access: 4,
		description: "Stop the bot",
		function: function(message, _) {
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.Hammer} Stopping bot...`).catch(Log);
			SaveData();
			Client.destroy().then(process.exit);
		}
	},

	// Administrative commands
	accesslevel: {
		name: "accesslevel",
		access: 3,
		arguments: ["user", "level"],
		function: function(message, args) {
			if (!args.user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			var user = args.user.match(/<?@?!?(\d+)>?/);
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

	addmod: {
		name: "addmod",
		access: 2,
		description: "Add a moderator.",
		arguments: ["user"],
		function: function(message, args) {
			if (!args.user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			var user = args.user.match(/<?@?!?(\d+)>?/);
			if (!user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);

			if (BotData.ServerData[message.guild.id].AccessLevels[user] > 0) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} User is already a moderator!`).catch(Log);
			BotData.ServerData[message.guild.id].AccessLevels[user] = 1;
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} User is now a moderator!`).catch(Log);
		}
	},

	remmod: {
		name: "remmod",
		access: 2,
		description: "Remove a moderator.",
		arguments: ["user"],
		function: function(message, args) {
			if (!args.user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			var user = args.user.match(/<?@?!?(\d+)>?/);
			if (!user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);

			if (BotData.ServerData[message.guild.id].AccessLevels[user] != 1) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} User is not a moderator!`).catch(Log);
			BotData.ServerData[message.guild.id].AccessLevels[user] = 0;
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} User is no longer a moderator!`).catch(Log);
		}
	},

	// Ping, echo and help commands
	ping: {
		name: "ping",
		access: 0,
		description: "Get the bot latency.",
		function: function(message, _) {
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
		arguments: ["message"],
		function: function(message, args) {
			message.channel.send(args.message);
		}
	},

	secho: {
		name: "secho",
		access: 1,
		arguments: ["message"],
		function: function(message, args) {
			message.channel.send(args.message);
			message.delete();
		}
	},

	info: {
		name: "info",
		access: 0,
		function: function(message, _) {
			message.channel.send({
				embed: {
					title: BotData.GlobalData.LongName,
					description: `Say \`${BotData.ServerData[message.guild.id].Prefix || BotData.GlobalData.DefaultPrefix}help\` for a list of commands.`,
					color: BotData.GlobalData.Assets.Colors.Primary,
					/*author: {
						name: BotData.GlobalData.LongName,
						icon_url: BotData.GlobalData.Assets.Icons.Profile
					},*/
					image: {
						url: BotData.GlobalData.Assets.Icons.Full
					},
					footer: {
						text: `${BotData.GlobalData.LongName} v${BotData.GlobalData.Version.String} | Requested by ${message.author.tag}`
					},
					fields: [
						{
							name: "Prefix",
							value: `My prefix for this server is \`${BotData.ServerData[message.guild.id].Prefix || BotData.GlobalData.DefaultPrefix}\`.`,
							inline: true
						},
						{
							name: "Developer",
							value: "crispycat\nJohnSteeds#4687",
							inline: true
						},
						{
							name: "Logo design",
							value: "teknowafel#6746",
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
								"[Add to your server](https://discordapp.com/api/oauth2/authorize?client_id=654067311430336521&permissions=8&scope=bot)",
								"[Minimal Permissions](https://discordapp.com/api/oauth2/authorize?client_id=654067311430336521&permissions=117824&scope=bot)",
								"[Development Branch](https://discordapp.com/api/oauth2/authorize?client_id=654073967413559353&permissions=8&scope=bot)",
								"[Support server](https://discord.gg/33XaQHx)"

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
		description: "Display this list.",
		function: function(message, _) {
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} Check your dms!`);
			commands = [];
			for (var cx in BotData.Commands) {
				command = BotData.Commands[cx];
				if (command.access > AccessLevel(message.author.id, message.guild.id)) continue;
				var c = {};
				c.name = (BotData.ServerData[message.guild.id].Prefix || BotData.GlobalData.DefaultPrefix) + command.name;
				if (command.arguments) for (var arg in command.arguments) c.name += ` <${command.arguments[arg]}>`;
				c.value = command.description || "No description provided.";
				commands[commands.length] = c;
			}
			message.author.send({
				embed: {
					title: `${BotData.GlobalData.LongName} Commands`,
					description: `My prefix for ${message.guild.name} is \`${BotData.ServerData[message.guild.id].Prefix || BotData.GlobalData.DefaultPrefix}\``,
					fields: commands
				}
			}).catch(Log);
		}
	},

	// Level commands
	level: {
		name: "level",
		access: 0,
		description: "Get your level",
		function: function(message, _) {
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

	// Bot settings commands
	prefix: {
		name: "prefix",
		access: 2,
		description: "Change the bot prefix.",
		arguments: ["prefix"],
		function: function(message, args) {
			if (!args.prefix) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You must specify a prefix!`).catch(Log);
			BotData.ServerData[message.guild.id].Prefix = args.prefix;
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.Check} My new prefix is \`${BotData.ServerData[message.guild.id].Prefix}\``);
		}
	},

	// Moderator commands
	// You'll notice the permissions are set to 0, this is intentional as each command has separate checks
	warn: {
		name: "warn",
		access: 0,
		description: "Warn a user. Moderator command.",
		arguments: ["user", "reason"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author.id, message.guild.id) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			if (!args.user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			var target = args.user.match(/<?@?!?(\d+)>?/);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			target = message.guild.members.get(target[1]);

			if (user.highestRole.comparePositionTo(target.highestRole) < 1 && AccessLevel(message.author.id, message.guild.id) >= 3) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot warn this user.`);

			if (typeof BotData.ServerData[message.guild.id].Warns[message.author.id] != "object") BotData.ServerData[message.guild.id].Warns[message.author.id] = [];
			BotData.ServerData[message.guild.id].Warns[message.author.id][BotData.ServerData[message.guild.id].Warns[message.author.id].length] = { time: Date.now(), reason: args.reason || "No reason specified." };

			target.send(`${BotData.GlobalData.Assets.Emoji.RedFlag} You have been warned in ${message.guild.name}: **${args.reason || "No reason specified."}**`);

			message.react(BotData.GlobalData.Assets.Emoji.Check);
			setTimeout(() => {
				message.delete().catch(Log);
			}, 2000);
		}
	},

	warnings: {
		name: "warnings",
		access: 0,
		description: "View a user's warnings. Moderator command.",
		arguments: ["user"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author.id, message.guild.id) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			if (!args.user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			var target = args.user.match(/<?@?!?(\d+)>?/);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			target = message.guild.members.get(target[1]);

			if (typeof BotData.ServerData[message.guild.id].Warns[message.author.id] != "object") BotData.ServerData[message.guild.id].Warns[message.author.id] = [];

			if (BotData.ServerData[message.guild.id].Warns[message.author.id].length < 1) return message.channel.send("User has no warnings.");

			BotData.ServerData[message.guild.id].Warns[message.author.id].forEach((warning) => {
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
		description: "Clear a user's warnings. Moderator command.",
		arguments: ["user"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author.id, message.guild.id) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			if (!args.user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			var target = args.user.match(/<?@?!?(\d+)>?/);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			target = message.guild.members.get(target[1]);

			if (user.highestRole.comparePositionTo(target.highestRole) < 1 && AccessLevel(message.author.id, message.guild.id) >= 3) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot clear warnings for this user.`);

			BotData.ServerData[message.guild.id].Warns[message.author.id] = [];

			message.react(BotData.GlobalData.Assets.Emoji.Check);
			setTimeout(() => {
				message.delete().catch(Log);
			}, 2000);
		}
	},

	mute: {
		name: "mute",
		access: 0,
		description: "Mute a user. Moderator command.",
		arguments: ["user", "minutes", "reason"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author.id, message.guild.id) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true) || user.hasPermission("MUTE_MEMBERS", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			if (!args.user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			var target = args.user.match(/<?@?!?(\d+)>?/);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			target = message.guild.members.get(target[1]);

			if (user.highestRole.comparePositionTo(target.highestRole) < 1 && AccessLevel(message.author.id, message.guild.id) >= 3) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot mute this user.`);

			var time = parseInt(args.minutes);
			if (!time) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid time!`).catch(Log);
			time *= 60000;

			BotData.ServerData[message.guild.id].Muted[target.id] = Date.now() + time;

			target.send(`${BotData.GlobalData.Assets.Emoji.ZippedMouth} You have been muted for ${args.minutes} minutes in ${message.guild.name}: **${args.reason || "No reason specified."}**`);

			message.react(BotData.GlobalData.Assets.Emoji.Check);
			setTimeout(() => {
				message.delete().catch(Log);
			}, 2000);
		}
	},

	unmute: {
		name: "unmute",
		access: 0,
		description: "Unmute a user. Moderator command.",
		arguments: ["user"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author.id, message.guild.id) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true) || user.hasPermission("MUTE_MEMBERS", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			if (!args.user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			var target = args.user.match(/<?@?!?(\d+)>?/);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			target = message.guild.members.get(target[1]);

			if (user.highestRole.comparePositionTo(target.highestRole) < 1 && AccessLevel(message.author.id, message.guild.id) >= 3) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot unmute this user.`);

			BotData.ServerData[message.guild.id].Muted[target.id] = 0;

			target.send(`${BotData.GlobalData.Assets.Emoji.Check} You have been unmuted in ${message.guild.name}.`);

			message.react(BotData.GlobalData.Assets.Emoji.Check);
			setTimeout(() => {
				message.delete().catch(Log);
			}, 2000);
		}
	},

	purge: {
		name: "purge",
		access: 0,
		description: "Purge messages in a channel. Moderator command.",
		arguments: ["amount"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author.id, message.guild.id) >= 1) allow = true;
			else if (user.hasPermission("MANAGE_MESSAGES", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			var amount = parseInt(args.amount);
			if (!amount) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid amount!`).catch(Log);

			if (amount > 100) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Overwhelmed} I can only purge 100 messages at a time!`).catch(Log);

			message.react(BotData.GlobalData.Assets.Emoji.Check);

			message.channel.fetchMessages({ limit: amount }).then((messages) => {
				messages.forEach((msg) => {
					msg.delete().catch(Log);
				});
			});
		}
	},

	kick: {
		name: "kick",
		access: 0,
		description: "Kick a user. Moderator Command",
		arguments: ["user", "reason"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author.id, message.guild.id) >= 1) allow = true;
			else if (user.hasPermission("KICK_USERS", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			if (!args.user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			var target = args.user.match(/<?@?!?(\d+)>?/);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			target = message.guild.members.get(target[1]);

			if (user.highestRole.comparePositionTo(target.highestRole) < 1 && AccessLevel(message.author.id, message.guild.id) >= 3) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot kick this user.`);

			target.send(`${BotData.GlobalData.Assets.Emoji.Boot} You have been kicked from ${message.guild.name}: **${args.reason || "No reason specified."}**`);

			target.kick(args.reason || "No reason specified.").then(() => {
				message.react(BotData.GlobalData.Assets.Emoji.Check);
				setTimeout(() => {
					message.delete().catch(Log);
				}, 2000);
			}).catch((error) => {
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Could not kick user: \`${error}\`!`).catch(Log);
				Log(error);
			});
		}
	},

	ban: {
		name: "ban",
		access: 0,
		description: "Ban a user. Moderator Command",
		arguments: ["user", "reason"],
		function: function(message, args) {
			var user = message.guild.member(message.author);

			var allow = false;
			if (AccessLevel(message.author.id, message.guild.id) >= 1) allow = true;
			else if (user.hasPermission("BAN_USERS", false, true, true)) allow = true;
			if (!allow) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);

			if (!args.user) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			var target = args.user.match(/<?@?!?(\d+)>?/);
			if (!target) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Invalid user!`).catch(Log);
			target = message.guild.members.get(target[1]);

			if (user.highestRole.comparePositionTo(target.highestRole) < 1 && AccessLevel(message.author.id, message.guild.id) >= 3) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} You cannot ban this user.`);

			target.send(`${BotData.GlobalData.Assets.Emoji.Hammer} You have been banned from ${message.guild.name}: **${args.reason || "No reason specified."}**`);

			target.ban(args.reason || "No reason specified.").then(() => {
				message.react(BotData.GlobalData.Assets.Emoji.Check);
				setTimeout(() => {
					message.delete().catch(Log);
				}, 2000);
			}).catch((error) => {
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Could not ban user: \`${error}\`!`).catch(Log);
				Log(error);
			});
		}
	},

	// Utility and fun commands
	avatar: {
		name: "avatar",
		access: 0,
		description: "Get a user's avatar.",
		arguments: ["user"],
		function: function(message, args) {
			var target;
			if (args.user) target = args.user.match(/<?@?!?(\d+)>?/);
			else target = message.author.id;

			if (target[1]) target = target[1];

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
		description: "Get the image of an emote.",
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
		description: "Roll some dice.",
		arguments: ["dice"],
		function: function(message, args) {
			var num = parseInt(args.dice);
			if (!num) num = 2;
			if (num < 1) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} Nothing to roll.`);
			if (num > 100) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Overwhelmed} That's too many!!`);

			var total = 0;
			var rolls = [];
			for (i = 0; i < num; i++) {
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
		description: "Get an answer from the 8 ball.",
		function: function(message, _) {
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
		description: "Get a random number.",
		arguments: ["min", "max"],
		function: function(message, args) {
			var min = parseInt(args.min);
			var max = parseInt(args.max);
			if (isNaN(min) || isNaN(max)) return message.channel.send("Please pick a minimum and maximum value!");
			message.channel.send(`The number is ${Random(min, max)}!`);
		}
	}
};

// Data functions
function LoadData() {
	Log("[i] Loading bot data...");
	try {
		var txt = FileSystem.readFileSync(BotData.GlobalData.DataPath);
		BotData.ServerData = JSON.parse(txt);
		if (typeof BotData.ServerData.AllServers != "object") BotData.ServerData.AllServers = { Levels: {} };
		Log(`[i] Loaded ${txt.length} bytes`);
	} catch (e) {
		Log("[X] FATAL: CANNOT LOAD BOT DATA!");
		throw e;
	}
}

function SaveData() {
	Log("[i] Saving bot data...");
	try {
		var txt = JSON.stringify(BotData.ServerData);
		FileSystem.writeFileSync(BotData.GlobalData.DataPath + "." + DateFormat(Date.now(), "yyyymmddHHMMss"), txt);
		FileSystem.writeFileSync(BotData.GlobalData.DataPath, txt);
		Log(`[i] Saved ${txt.length} bytes`);
	} catch (e) {
		Log("[!] COULD NOT SAVE BOT DATA!");
		Log(e);
	}
}

// Exp function
function AddExp(user, exp, channel) {
	if (typeof BotData.ServerData.AllServers.Levels[user.id] != "object") BotData.ServerData.AllServers.Levels[user.id] = { Level: 0, Exp: 0 };
	var plvl = BotData.ServerData.AllServers.Levels[user.id].Level;
	var nlvl = BotData.ServerData.AllServers.Levels[user.id].Level + 1;
	BotData.ServerData.AllServers.Levels[user.id].Exp += exp;
	if (BotData.ServerData.AllServers.Levels[user.id].Exp >= BotData.GlobalData.Levels.ExpNeeded[nlvl]) BotData.ServerData.AllServers.Levels[user.id].Level = nlvl;
	if (BotData.ServerData.AllServers.Levels[user.id].Level > plvl) channel.send(`Congratulations ${user.username}, you reached level ${nlvl}!`);
}

// Access level function
function AccessLevel(user, guild) {
	var al = BotData.GlobalData.AccessLevels[user] || 0;
	if (al <= 2) al = BotData.ServerData[guild].AccessLevels[user] || 0;
	return al;
}

// Random function
function Random(min, max, int = true) {
	var f = Math.random() * (max - min) + min;
	return (int === true) ? Math.round(f) : f;
}

// Main bot functions
LoadData();
setInterval(SaveData, BotData.GlobalData.SaveInterval * 1000);

Client.on("guildCreate", (guild) => {
	if (!guild) return Log(`[!] Guild ${guild.id} added but data could not be created!`);
	BotData.ServerData[guild.id] = {
		AccessLevels: {
			[guild.owner.id]: 2
		},
		Muted: {}
	};
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
	// If for whatever reason the server's data does not exist, create it
	if (typeof BotData.ServerData[message.guild.id] != "object") BotData.ServerData[message.guild.id] = {
		AccessLevels: {
			[message.guild.owner.id]: 2
		},
		Muted: {}
	};
	if (typeof BotData.ServerData[message.guild.id].Muted != "object") BotData.ServerData[message.guild.id].Muted = {};
	if (typeof BotData.ServerData[message.guild.id].Warns != "object") BotData.ServerData[message.guild.id].Warns = {};
	// Is the user blacklisted or a bot?
	if ((BotData.GlobalData.AccessLevels[message.author.id] || 0) < 0 || message.author.bot) return;
	// Is the user muted?
	if (typeof BotData.ServerData[message.guild.id].Muted[message.author.id] == "number") {
		if (BotData.ServerData[message.guild.id].Muted[message.author.id] > Date.now()) {
			// If must is active, delete the message and send it to the user
			try {
				message.author.send(
					`${BotData.GlobalData.Assets.Emoji.ZippedMouth} **[${message.guild.name}]** Uh oh, looks like you're muted!`,
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
			message.delete();
		} else {
			// If mute is expired remove the must from the list
			BotData.ServerData[message.guild.id].Muted[message.author.id] = null;
		}
	}
	// Is command?
	if (message.content.startsWith(BotData.ServerData[message.guild.id].Prefix || BotData.GlobalData.DefaultPrefix)) {
		// Start typing to make the bot feel less like a bot
		message.channel.startTyping();
		// Create the array of arguments
		var args = message.content.slice((BotData.ServerData[message.guild.id].Prefix || BotData.GlobalData.DefaultPrefix).length).split(" ");
		var command = BotData.Commands[args.shift().toLowerCase()];
		// Does the command exist?
		if (typeof command == "object") {
			// Check if the user can use this command
			if (AccessLevel(message.author.id, message.guild.id) < command.access) return message.channel.send(`${BotData.GlobalData.Assets.Emoji.Nerd} You can't use that!`).catch(Log);
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
				Log(e);
				message.channel.send(`${BotData.GlobalData.Assets.Emoji.Warning} There was an error executing this command: ${e}\n\`${e.stack || "No further details"}\``).catch(Log);
			}
		} else {
			message.channel.send(`${BotData.GlobalData.Assets.Emoji.X} That command doesn't exist! Try \`${BotData.ServerData[message.guild.id].Prefix || BotData.GlobalData.DefaultPrefix}help\``).catch(Log);
		}
	} else {
		// Is bot mention?
		if (typeof message.mentions.users.first() != "undefined" && message.mentions.users.first().id == Client.user.id)
			message.channel.send(`Hello ${message.author}, my prefix is \`${BotData.ServerData[message.guild.id].Prefix || BotData.GlobalData.DefaultPrefix}\`.`).catch(Log);
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
				name: `${Client.guilds.keyArray().length} servers; ${Client.users.keyArray().length} users`,
				type: 3
			}
		}).catch(Log);
	}, 5000);
});

Log("[i] Attempting login...");
Client.login(BotData.GlobalData.Token);