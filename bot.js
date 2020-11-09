/*
* Bobcat Discord Bot v0.12.0
* Created by crispycat
* 2020/10/29
* If you want to change the way the bot works, use settings.json and command modules!
* I can't help you if you broke something while modifying the core files!
*/

if (process.env.NODE_ENV != "production") require("dotenv").config();

var Bot = {
	Version: "0.12.0",
	Root: __dirname.replace(/\\/g, "/"),
	Utilities: {},
	Commands: { _Modules: [] },
	Config: {},
	Data: {
		User: {},
		Guild: {}
	},
	GuildSettings: {
		prefix: {
			Type: "string",
			DefaultValue: ">",
			Description: "Sets the prefix for the bot to use (the '>' in >info)"
		},
		allowfuncommands: {
			Type: "boolean",
			DefaultValue: true,
			Description: "Whether the bot should allow the use of >kitten, etc"
		}
	},
	Hooks: {
		Fire: function(hook, ...args) {
			for (var h in this._Hooks) {
				if (this._Hooks[h].Hook == hook) {
					try {
						this._Hooks[h].Call(Bot, ...args);
					} catch (e) {
						Bot.Utilities.Log(`[!] Error firing hook ${hook}: ${e.stack}`);
					}
				}
			}
		},
		When: function(hook, call) {
			this._Hooks[this._Hooks.length] = {
				Hook: hook,
				Call: call
			};
			return this._Hooks[this._Hooks.length - 1];
		},
		_Hooks: []
	},
	Tick: 0
};
Bot.Utilities.Bot = Bot;

console.log(`###########################################\n#   /\\   /\\                               #\n#    #        Bobcat Bot v${Bot.Version}\n#    #\\                                   #\n#    #####\\   by crispycat                #\n# \`  #.   #   released under MIT license  #\n#  \\=#####/                               #\n###########################/Initalizing/###\n\n`);

// Load core utilities in order
console.log("Loading core utilities...");

var utils = {
	Discord: "discord.js",
	FormatDate: "~formdate.js",
	FS: "fs",
	Log: "~log.js",
	Request: "~request.js",
	Decache: "decache",

	Random: "~random.js",
	FilterNSFW: "~filternsfw.js",

	LoadData: "~loaddata.js",
	SaveData: "~savedata.js",
	BackupData: "~backdata.js",

	InitializeGuildData: "~gdinit.js",
	InitializeUserData: "~udinit.js",
	GetGuildSetting: "~ggsetting.js",
	SetGuildSetting: "~sgsetting.js",
	GetUserAccessLevel: "~getual.js",
	SetUserAccessLevel: "~setual.js",
	SetRoleAccessLevel: "~setral.js",
	CompareAccessLevels: "~cmpual.js",

	GetExp: "~getexp.js",
	SetExp: "~setexp.js"
};

for (var u in utils) {
	var path = utils[u].replace("~", `${Bot.Root}/core/utilities/`);
	try {
		Bot.Utilities[u] = require(path);
		console.log(`\tLoaded ${path}`);
	} catch (e) {
		console.log(`\t[!] Could not load ${path}:\t${e}\n\tExpect potential bot instability!`);
	}
}

// Load config
Bot.Utilities.Log("Loading Bot Config...");
try {
	Bot.Config = JSON.parse(Bot.Utilities.FS.readFileSync(`${Bot.Root}/config.json`));
} catch (e) {
	Bot.Utilities.Log(`\t[!] Could not load Bot Config:\n\t${e}\n\tExpect potential bot instability!`);
}

// Load core functions
Bot.Utilities.Log("Loading core functions...");
Bot.Client = new Bot.Utilities.Discord.Client();
Bot.Parser = require(`${Bot.Root}/core/parser.js`);
Bot.LoadModule = require(`${Bot.Root}/core/modload.js`);

// Load command modules
Bot.Utilities.Log("Loading command modules...");
for (var m in Bot.Config.LoadModules) Bot.LoadModule(Bot.Config.LoadModules[m]);

// Load data save
Bot.Utilities.Log("Loading data...");
try {
	Bot.Utilities.LoadData();
} catch (e) {
	Bot.Utilities.Log(`\t[!] Could not load bot data:\n\t${e}\n\tUsing default data instead!`);
}

// Listen for events
Bot.Client.on("ready", () => {
	Bot.Hooks.Fire("ClientReady");
	Bot.Utilities.Log("Logged in");

	Bot.Client.user.setPresence({
		status: Bot.Config.DefaultStatus.Status,
		activity: {
			name: Bot.Config.DefaultStatus.Text,
			type: Bot.Config.DefaultStatus.Type
		}
	});
});

Bot.Client.on("message", (message) => {
	// Don't process DMs or bot messages
	if (!message.guild || message.author.bot) return Bot.Hooks.Fire("BotOrDirectMessage", message);
	// If message is a command, process it
	if (message.content.startsWith(Bot.Utilities.GetGuildSetting(message.guild, "prefix").Value)) {
		// Make sure this is really a valid command
		var command = Bot.Parser.ParseCommand(message.content, Bot.Utilities.GetGuildSetting(message.guild, "prefix").Value);
		if (command.Command) {
			// Let's find the command
			var com;
			for (var c in Bot.Commands) {
				for (var n in Bot.Commands[c].Commands) {
					if (Bot.Commands[c].Commands[n] == command.Command) {
						com = Bot.Commands[c];
						break;
					}
				}
				if (com) break;
			}

			if (com) {
				// Make sure the user is allowed to use the command
				var allow = false;
				if (typeof com.Access == "number") allow = Bot.Utilities.GetUserAccessLevel(message.guild, message.author) >= com.Access;
				else if (typeof com.Access == "function") allow = com.Access(Bot, message.guild, message.author);
				if (!allow) return message.channel.send(`${Bot.Config.Emoji.Nerd} Sorry, you can't use that command!`).catch(Bot.Utilities.Log);

				if (com.Fun && !Bot.Utilities.GetGuildSetting(message.guild, "allowfuncommands").Value)
					return message.channel.send(`${Bot.Config.Emoji.X} Sorry, fun commands are disabled in this server!`).catch(Bot.Utilities.Log);

				// Execute
				message.channel.startTyping();
				Bot.Hooks.Fire("Message", true, message);
				try {
					Bot.Utilities.Log(`[${message.guild.id}/${message.channel.id}] ${message.author.id}: ${message.content}`);
					com.Function(Bot, message, Bot.Parser.ParseArguments(command.Arguments, com.Arguments));
					Bot.Hooks.Fire("Command", true, message, command)
				} catch (e) {
					Bot.Utilities.Log(`\t[!] Failed execution: ${e.stack}`);
					Bot.Hooks.Fire("Command", false, message, command)
					message.channel.send({
						embed: {
							title: "Command error",
							description: `\`\`\`\n${e.stack}\n\`\`\``,
							color: Bot.Config.Colors.Error
						}
					}).catch(Bot.Utilities.Log);
				}
				message.channel.stopTyping(true);
			}
		}
	} else {
		Bot.Hooks.Fire("Message", false, message);
	}
});

var events = {
	warn: "ClientWarn",
	error: "ClientError",

	guildCreate: "GuildCreated",
	guildDelete: "GuildDeleted",
	guildUpdate: "GuildUpdated",

	guildMemberAdd: "MemberJoined",
	guildMemberRemove: "MemberLeft",
	guildMemberUpdate: "MemberUpdated",
	guildBanAdd: "UserBanned",
	guildBanRemove: "UserUnbanned",
	userUpdate: "UserUpdated",

	roleCreate: "RoleCreated",
	roleDelete: "RoleDeleted",
	roleUpdate: "RoleUpdated",

	channelCreate: "ChannelCreated",
	channelDelete: "ChannelDeleted",
	channelUpdate: "ChannelUpdated",
	channelPinsUpdate: "PinsUpdated",
	webhookUpdate: "WebhookUpdated",

	emojiCreate: "EmojiCreated",
	emojiDelete: "EmojiDeleted",
	emojiUpdate: "EmojiUpdated",

	inviteCreate: "InviteCreated",
	inviteDelete: "InviteDeleted",

	messageDelete: "MessageDeleted",
	messageDeleteBulk: "MessagesDeleted",
	messageUpdate: "MessageUpdated",
	messageReactionAdd: "ReactionAdded",
	messageReactionRemove: "ReactionRemoved",
	messageReactionRemoveAll: "ReactionsRemoved",
	typingStart: "StartedTyping"
};

Object.keys(events).forEach((ev) => {
	Bot.Client.on(ev, (...args) => {
		Bot.Utilities.Log(`Discord event ${ev} => Bobcat hook ${events[ev]}(${args.join(", ")})`);
		Bot.Hooks.Fire(events[ev], ...args);
	});
});

// Timers
setInterval(() => {
	try {
		Bot.Utilities.SaveData();
	} catch (e) {
		Log(`[!] Could not save data: ${e}`);
	}
}, Bot.Config.SaveInterval * 1000);

setInterval(() => {
	try {
		Bot.Utilities.BackupData();
	} catch (e) {
		Log(`[!] Could not make backup: ${e}`);
	}
}, Bot.Config.BackupInterval * 1000);

setInterval(() => {
	Bot.Tick++;
	Bot.Hooks.Fire("Tick", Bot.Tick);
}, Bot.Config.TickInterval * 1000);

// Log in!
Bot.Utilities.Log("Connecting to Discord...");
Bot.Client.login(Bot.Config.Token || process.env.token).then(() => Bot.Hooks.Fire("ClientLogin", true)).catch(() => Bot.Hooks.Fire("ClientLogin", false));
