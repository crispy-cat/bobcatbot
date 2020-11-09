module.exports = {
	Commands: {
		Say: {
			Commands: ["say", "echo"],
			Access: 1,
			Arguments: ["*message"],
			Description: "Makes the bot say something.",
			Function: function (Bot, message, args) {
				if (!args.message) return message.channel.send(`${Bot.Config.Emoji.X} You didn't tell me what to say!`);
				message.channel.send(`${args.message}`);
			}
		},

		SayDelete: {
			Commands: ["saydelete", "echodelete", "sayd", "echod", "sd"],
			Access: 1,
			Arguments: ["*message"],
			Description: "Makes the bot say something and deletes your message.",
			Function: function (Bot, message, args) {
				if (!args.message) return message.channel.send(`${Bot.Config.Emoji.X} You didn't tell me what to say!`);
				message.channel.send(`${args.message}`);
				message.delete();
			}
		},

		Emote: {
			Commands: ["emote", "emoji"],
			Access: 0,
			Arguments: ["*emote"],
			Description: "Shows an emote.",
			Function: function (Bot, message, args) {
				if (!args.emote) return message.channel.send(`${Bot.Config.Emoji.X} You didn't specify an emote!`);
				var emote = args.emote.match(/<?(a?):?([a-z][a-z0-9\-_]*)?:?(\d+)>?/i);

				if (emote) {
					emote = {
						name: emote[2],
						ext: (emote[1]) ? "gif" : "png",
						id: emote[3]
					};

					return message.channel.send({
						embed: {
							title: `Emote \\:${emote.name}:`,
							color: Bot.Config.Colors.Primary,
							image: {
								url: `https://cdn.discordapp.com/emojis/${emote.id}.${emote.ext}`
							}
						}
					});
				}
				message.channel.send(`${Bot.Config.Emoji.X} That emote is invalid!`);
			}
		},

		ServerInfo: {
			Commands: ["serverinfo", "server"],
			Access: 0,
			Arguments: [],
			Description: "Shows info about this server.",
			Function: function (Bot, message, args) {
				message.channel.send({
					embed: {
						title: `You're in ${message.guild.name}`,
						color: Bot.Config.Colors.Primary,
						fields: [
							{
								name: "Owned by",
								value: message.guild.owner.user.tag,
								inline: true
							},
							{
								name: "Members",
								value: message.guild.memberCount,
								inline: true
							},
							{
								name: "Channels",
								value: message.guild.channels.cache.array().length,
								inline: true
							},
							{
								name: "Roles",
								value: message.guild.roles.cache.array().length,
								inline: true
							},
							{
								name: "Emoji",
								value: message.guild.emojis.cache.array().length,
								inline: true
							},
							{
								name: "Explicit filter level",
								value: message.guild.explicitContentFilter,
								inline: true
							},
							{
								name: "Features",
								value: (message.guild.features.length > 0) ? message.guild.features.join(",\n") : "-",
								inline: true
							},
							{
								name: "Id",
								value: message.guild.id,
								inline: true
							}
						]
					}
				});
			}
		},

		GetInvite: {
			Commands: ["getinvite"],
			Access: (Bot, guild, user) => {
				return guild.members.resolve(user).hasPermission("CREATE_INSTANT_INVITE") || Bot.Utilities.GetUserAccessLevel(guild, user) > 1;
			},
			Arguments: ["maxage", "maxuses"],
			Description: "Creates an invite to this server.",
			Function: function (Bot, message, args) {
				var age = (parseInt(args.maxage) || 0) * 3600;
				var uses = parseInt(args.maxuses) || 0;

				message.channel.createInvite({
					maxAge: age,
					maxUses: uses,
					unique: true,
					reason: `Created by ${message.author.tag}`
				}).then((invite) => {
					message.author.send(`Your invite: https://discord.gg/${invite.code}`).then(() => {
						message.channel.send(`${Bot.Config.Emoji.Check} Check your DMs!`);
					}).catch(() => {
						message.channel.send(`Your invite: https://discord.gg/${invite.code}`);
					});
				}).catch((error) => {
					message.channel.send(`${Bot.Config.Emoji.Warning} Could not create invite:\n\`\`\`${error}\`\`\``);
				});
			}
		}
	}
};