module.exports = {
	Commands: {
		Warn: {
			Commands: ["warn"],
			Access: (Bot, guild, user) => {
				return guild.members.resolve(user).hasPermission("MANAGE_MESSAGES") || Bot.Utilities.GetUserAccessLevel(guild, user) > 1;
			},
			Arguments: ["*user", "reason"],
			Description: "Warns a user.",
			Function: function(Bot, message, args) {
				var user = message.guild.members.resolve(message.author);
				var target = Bot.Parser.ParseId(args.user);
				if (target) target = message.guild.members.resolve(target.Id);
				if (!target) return message.channel.send(`${Bot.Config.Emoji.Confused} Sorry, I can't find that user!`);
				if (Bot.Utilities.CompareAccessLevels(message.guild, user, target) < 1)
					return message.channel.send(`${Bot.Config.Emoji.Nerd} You can't warn this user!`);

				var reason = args.reason || "No reason specified.";

				var warns = Bot.Data.Guild[message.guild.id].Warns[target.id] || [];
				warns[warns.length] = {
					timestamp: Date.now(),
					reason: reason,
					moderator: user.id
				};
				Bot.Data.Guild[message.guild.id].Warns[target.id] = warns;

				target.send(`${Bot.Config.Emoji.RedFlag} You have been warned in ${message.guild.name}: **${reason.replace(/\*/g, "")}**`).then(() => {
					message.react(Bot.Config.Emoji.Check);
					message.delete({ timeout: 2000 });
				}).catch(() => {
					message.channel.send(`${Bot.Config.Emoji.Warning} Warning logged; user could not be DMed`);
				});
			}
		},

		Warnings: {
			Commands: ["warnings", "warns", "showwarns", "warnlist"],
			Access: (Bot, guild, user) => {
				return guild.members.resolve(user).hasPermission("MANAGE_MESSAGES") || Bot.Utilities.GetUserAccessLevel(guild, user) > 1;
			},
			Arguments: ["*user"],
			Description: "Shows a user's warnings.",
			Function: function(Bot, message, args) {
				var target = Bot.Parser.ParseId(args.user);
				if (target) target = message.guild.members.resolve(target.Id);
				if (!target) return message.channel.send(`${Bot.Config.Emoji.Confused} Sorry, I can't find that user!`);

				var warns = Bot.Data.Guild[message.guild.id].Warns[target.id];
				if (!warns || warns.length < 1) return message.channel.send(`${Bot.Config.Emoji.X} User has no warnings.`);

				for (var warn in warns) {
					warn = warns[warn];
					var warnedby = Bot.Client.users.resolve(warn.moderator);
					warnedby = (warnedby) ? warnedby.tag : warn.moderator;
					message.channel.send({
						embed: {
							title: Bot.Utilities.FormatDate(warn.timestamp),
							description: warn.reason.replace(/\*/g, ""),
							color: Bot.Config.Colors.Primary,
							fields: [
								{
									name: "Warned by",
									value: warnedby
								}
							]
						}
					})
				}
			}

		},

		ClearWarnings: {
			Commands: ["clearwarnings", "clearwarns"],
			Access: (Bot, guild, user) => {
				return guild.members.resolve(user).hasPermission("MANAGE_MESSAGES") || Bot.Utilities.GetUserAccessLevel(guild, user) > 1;
			},
			Arguments: ["*user"],
			Description: "Clears a user's warnings.",
			Function: function(Bot, message, args) {
				var user = message.guild.members.resolve(message.author);
				var target = Bot.Parser.ParseId(args.user);
				if (target) target = message.guild.members.resolve(target.Id);
				if (!target) return message.channel.send(`${Bot.Config.Emoji.Confused} Sorry, I can't find that user!`);
				if (Bot.Utilities.CompareAccessLevels(message.guild, user, target) < 1)
					return message.channel.send(`${Bot.Config.Emoji.Nerd} You can't clear this user's warnings!`);

				Bot.Data.Guild[message.guild.id].Warns[target.id] = [];
				message.react(Bot.Config.Emoji.Check);
				message.delete({ timeout: 2000 });
			}

		},

		Mute: {
			Commands: ["mute", "silence", "stfu"],
			Access: (Bot, guild, user) => {
				return guild.members.resolve(user).hasPermission("MUTE_MEMBERS") || Bot.Utilities.GetUserAccessLevel(guild, user) > 1;
			},
			Arguments: ["*user", "duration", "reason"],
			Description: "Mutes a user.",
			Function: function(Bot, message, args) {
				var user = message.guild.members.resolve(message.author);
				var target = Bot.Parser.ParseId(args.user);
				if (target) target = message.guild.members.resolve(target.Id);
				if (!target) return message.channel.send(`${Bot.Config.Emoji.Confused} Sorry, I can't find that user!`);
				if (Bot.Utilities.CompareAccessLevels(message.guild, user, target) < 1)
					return message.channel.send(`${Bot.Config.Emoji.Nerd} You can't mute this user!`);

			}

		},

		Unmute: {
			Commands: ["unmute"],
			Access: (Bot, guild, user) => {
				return guild.members.resolve(user).hasPermission("MUTE_MEMBERS") || Bot.Utilities.GetUserAccessLevel(guild, user) > 1;
			},
			Arguments: ["*user"],
			Description: "Unmutes a user.",
			Function: function(Bot, message, args) {
				var user = message.guild.members.resolve(message.author);
				var target = Bot.Parser.ParseId(args.user);
				if (target) target = message.guild.members.resolve(target.Id);
				if (!target) return message.channel.send(`${Bot.Config.Emoji.Confused} Sorry, I can't find that user!`);
				if (Bot.Utilities.CompareAccessLevels(message.guild, user, target) < 1)
					return message.channel.send(`${Bot.Config.Emoji.Nerd} You can't unmute this user!`);

			}

		},

		Kick: {
			Commands: ["kick"],
			Access: (Bot, guild, user) => {
				return guild.members.resolve(user).hasPermission("KICK_MEMBERS") || Bot.Utilities.GetUserAccessLevel(guild, user) > 1;
			},
			Arguments: ["*user", "reason"],
			Description: "Kicks a user.",
			Function: function(Bot, message, args) {
				var user = message.guild.members.resolve(message.author);
				var target = Bot.Parser.ParseId(args.user);
				if (target) target = message.guild.members.resolve(target.Id);
				if (!target) return message.channel.send(`${Bot.Config.Emoji.Confused} Sorry, I can't find that user!`);
				if (Bot.Utilities.CompareAccessLevels(message.guild, user, target) < 1)
					return message.channel.send(`${Bot.Config.Emoji.Nerd} You can't kick this user!`);

				var reason = args.reason || "No reason specified.";

				target.send(`${Bot.Config.Emoji.Boot} You have been kicked from ${message.guild.name}: **${reason.replace(/\*/g, "")}**`);

				target.kick(`Kicked by ${user.user.tag} (${user.id}) | ${reason}`).then(() => {
					message.react(Bot.Config.Emoji.Check);
					message.delete({ timeout: 2000 });
				}).catch((error) => {
					message.channel.send(`${Bot.Config.Emoji.Warning} Could not kick user:\n\`\`\`${error}\`\`\``);
				});
			}

		},

		Ban: {
			Commands: ["ban", "yeet"],
			Access: (Bot, guild, user) => {
				return guild.members.resolve(user).hasPermission("BAN_MEMBERS") || Bot.Utilities.GetUserAccessLevel(guild, user) > 2;
			},
			Arguments: ["*user", "reason"],
			Description: "Bans a user.",
			Function: function(Bot, message, args) {
				var user = message.guild.members.resolve(message.author);
				var target = Bot.Parser.ParseId(args.user);
				if (target) target = message.guild.members.resolve(target.Id);
				if (!target) return message.channel.send(`${Bot.Config.Emoji.Confused} Sorry, I can't find that user!`);
				if (Bot.Utilities.CompareAccessLevels(message.guild, user, target) < 1)
					return message.channel.send(`${Bot.Config.Emoji.Nerd} You can't ban this user!`);

				var reason = args.reason || "No reason specified.";

				target.send(`${Bot.Config.Emoji.Boot} You have been banned from ${message.guild.name}: **${reason.replace(/\*/g, "")}**`);

				target.ban({ reason: `Banned by ${user.user.tag} (${user.id}) | ${reason}` }).then(() => {
					message.react(Bot.Config.Emoji.Check);
					message.delete({ timeout: 2000 });
				}).catch((error) => {
					message.channel.send(`${Bot.Config.Emoji.Warning} Could not ban user:\n\`\`\`${error}\`\`\``);
				});
			}

		},

		SoftBan: {
			Commands: ["softban"],
			Access: (Bot, guild, user) => {
				return guild.members.resolve(user).hasPermission("BAN_MEMBERS") || Bot.Utilities.GetUserAccessLevel(guild, user) > 1;
			},
			Arguments: ["*user", "reason"],
			Description: "Bans and then unbans a user, clearing her/his messages.",
			Function: function(Bot, message, args) {
				var user = message.guild.members.resolve(message.author);
				var target = Bot.Parser.ParseId(args.user);
				if (target) target = message.guild.members.resolve(target.Id);
				if (!target) return message.channel.send(`${Bot.Config.Emoji.Confused} Sorry, I can't find that user!`);
				if (Bot.Utilities.CompareAccessLevels(message.guild, user, target) < 1)
					return message.channel.send(`${Bot.Config.Emoji.Nerd} You can't softban this user!`);

				var reason = args.reason || "No reason specified.";

				target.send(`${Bot.Config.Emoji.Boot} You have been softbanned in ${message.guild.name}: **${reason.replace(/\*/g, "")}**`);

				target.ban({ reason: `Softbanned by ${user.user.tag} (${user.id}) | ${reason}`, days: 7 }).then(() => {
					message.react(Bot.Config.Emoji.Check);
				}).catch((error) => {
					message.channel.send(`${Bot.Config.Emoji.Warning} Could not softban user:\n\`\`\`${error}\`\`\``);
				});

				message.guild.members.unban(target, `Softbanned by ${user.user.tag} (${user.id}) | ${reason}`).then(() => {
					message.delete({ timeout: 2000 });
				}).catch((error) => {
					message.channel.send(`${Bot.Config.Emoji.Warning} Could not unban user:\n\`\`\`${error}\`\`\``);
				});
			}

		},

		Unban: {
			Commands: ["unban"],
			Access: (Bot, guild, user) => {
				return guild.members.resolve(user).hasPermission("BAN_MEMBERS") || Bot.Utilities.GetUserAccessLevel(guild, user) > 2;
			},
			Arguments: ["*user", "reason"],
			Description: "Unbans a user.",
			Function: function(Bot, message, args) {
				var user = message.guild.members.resolve(message.author);
				var target = Bot.Parser.ParseId(args.user);
				//if (target) target = Bot.Client.users.resolve(target.Id);
				//if (!target) return message.channel.send(`${Bot.Config.Emoji.Confused} Sorry, I can't find that user!`);

				var reason = args.reason || "No reason specified.";

				message.guild.members.unban(target, `Unbanned by ${user.user.tag} (${user.id}) | ${reason}`).then(() => {
					message.react(Bot.Config.Emoji.Check);
					message.delete({ timeout: 2000 });
				}).catch((error) => {
					message.channel.send(`${Bot.Config.Emoji.Warning} Could not unban user:\n\`\`\`${error}\`\`\``);
				});
			}

		},

		Purge: {
			Commands: ["purge", "prune", "clean", "clear", "delete"],
			Access: (Bot, guild, user) => {
				return guild.members.resolve(user).hasPermission("MANAGE_MESSAGES") || Bot.Utilities.GetUserAccessLevel(guild, user) > 1;
			},
			Arguments: ["*messages"],
			Description: "Deletes the specified amount of messages.",
			Function: function(Bot, message, args) {
				var amount = parseInt(args.messages);
				if (!amount) return message.channel.send(`${Bot.Config.Emoji.X} Invalid amount!`);

				if (amount++ > 99) return message.channel.send(`${Bot.Config.Emoji.Overwhelmed} I can only purge 99 messages at a time!`);

				message.channel.bulkDelete(amount, true).then((messages) => {
					var count = messages.size;
					message.channel.send(`${Bot.Config.Emoji.Check} Deleted ${count - 1} messages!`).then((message) =>
						setTimeout(() => message.delete(), 2000));
				}).catch((error) => {
					message.channel.send(`${Bot.Config.Emoji.Warning} Could not purge messages:\n\`\`\`${error}\`\`\``);
				});
			}
		},

		Nickname: {
			Commands: ["nickname", "nick"],
			Access: (Bot, guild, user) => {
				return guild.members.resolve(user).hasPermission("MANAGE_NICKNAMES") || Bot.Utilities.GetUserAccessLevel(guild, user) > 1;
			},
			Arguments: ["*user", "nickname"],
			Description: "Changes a user's nickname.",
			Function: function(Bot, message, args) {
				var user = message.guild.members.resolve(message.author);
				var target = Bot.Parser.ParseId(args.user);
				if (target) target = message.guild.members.resolve(target.Id);
				if (!target) return message.channel.send(`${Bot.Config.Emoji.Confused} Sorry, I can't find that user!`);
				if (Bot.Utilities.CompareAccessLevels(message.guild, user, target) < 1)
					return message.channel.send(`${Bot.Config.Emoji.Nerd} You can't change this user's nickname!`);

				var nick = args.nickname || "";
				if (nick.length > 32)
					return message.channel.send(`${Bot.Config.Emoji.X} Nicknames must be 32 characters or less!`);

				target.setNickname(nick, `Changed by ${user.user.tag} (${user.id})`).then(() => {
					message.react(Bot.Config.Emoji.Check);
					message.delete({ timeout: 2000 });
				}).catch((error) => {
					message.channel.send(`${Bot.Config.Emoji.Warning} Could not change user's nickname:\n\`\`\`${error}\`\`\``);
				});
			}

		},

		Role: {
			Commands: ["role"],
			Access: (Bot, guild, user) => {
				return guild.members.resolve(user).hasPermission("MANAGE_ROLES") || Bot.Utilities.GetUserAccessLevel(guild, user) > 2;
			},
			Arguments: ["add|remove", "*user", "role"],
			Description: "Adds or removes a role from a user.",
			Function: function(Bot, message, args) {
				var user = message.guild.members.resolve(message.author);
				var target = Bot.Parser.ParseId(args.user);
				if (target) target = message.guild.members.resolve(target.Id);
				else target = user;
				if (!target) return message.channel.send(`${Bot.Config.Emoji.Confused} Sorry, I can't find that user!`);
				if (Bot.Utilities.CompareAccessLevels(message.guild, user, target) < 1)
					return message.channel.send(`${Bot.Config.Emoji.Nerd} You can't change this user's roles!`);

			}

		}
	}
};
