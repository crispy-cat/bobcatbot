var ohnoacowhesgonnamoogetreadyboyshesgonnadoitohnoherehegoesmmmmoooooooooooooooooooooooooo = "        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||";

module.exports = {
	Commands: {
		Cowsay: {
			Commands: ["cowsay", "cow", "moo"],
			Access: 0,
			Arguments: ["*message"],
			Description: "What does the cow say?",
			Fun: true,
			Function: function (Bot, message, args) {
				var msg = args.message || `Usage: ${Bot.Utilities.GetGuildSetting(message.guild, "prefix").Value}cowsay <message>`;
				msg = `\`\`\`\n${msg}\n\n${ohnoacowhesgonnamoogetreadyboyshesgonnadoitohnoherehegoesmmmmoooooooooooooooooooooooooo}\n\`\`\``;
				message.channel.send(msg);
			}
		},

		Match: {
			Commands: ["match", "ship", "relationship", "lovemeter", "love"],
			Access: 0,
			Arguments: ["*person1", "*person2"],
			Description: "Tests how compatible two people are.",
			Fun: true,
			Function: function (Bot, message, args) {
				var p1 = args["person1"];
				var p2 = args["person2"];
				if (!p1 || !p2) return message.channel.send(`${Bot.Config.Emoji.X} Please specify two people!`);
				p1 = p1.toLowerCase();
				p2 = p2.toLowerCase();

				function n(str) {
					var i = 0;
					for (var j = 0; j < str.length; j++) i += str.charCodeAt(j);
					return i;
				}

				var s = Math.round((n(p1) + n(p2)) * 11 / (p1.length + p2.length) % 100);

				var m = "Let's fuckin go!";
				if (s < 100) m = "Do it!";
				if (s < 90) m = "Looking great";
				if (s < 75) m = "Looking good";
				if (s < 65) m = "Not bad";
				if (s < 60) m = "More likely than not";
				if (s < 50) m = "Perhaps";
				if (s < 40) m = "I don't know about this...";
				if (s < 25) m = "Not worth it";
				if (s < 10) m = "Don't even try";
				if (s == 0) m = "Not a chance"

				var l = "";
				for (var i = 0.5; i < s / 10; i++) l += "\u2588";
				while (l.length < 10) l += "\u2591";

				var c = Bot.Config.Colors.Warning;
				if (s >= 60) c = Bot.Config.Colors.Success;
				if (s < 40) c = Bot.Config.Colors.Error;
				message.channel.send({
					embed: {
						title: `${m}        ${l}`,
						description: `Compatibility: **${s}%**\n${args["person1"]} <--> ${args["person2"]}`,
						color: c
					}
				});
			}
		},

		Kitten: {
			Commands: ["kitten", "meow", "placekitten", "fuckoff", "fuckyou", "shutup"],
			Access: 0,
			Description: "Gets a random image of a kitten from placekitten.com.",
			Fun: true,
			Function: function(Bot, message) {
				var r = Bot.Utilities.Random(854, 1280);
				message.channel.send({
					embed: {
						title: "Myew!",
						color: Bot.Config.Colors.Primary,
						image: {
							url: `https://placekitten.com/g/${r}/${Math.round(r * 9 / 16)}`
						},
						footer: {
							text: `Requested by ${message.author.tag}`
						}
					}
				});
			}
		},

		Wikipedia: {
			Commands: ["wikipedia", "wiki"],
			Access: 0,
			Arguments: ["*search term"],
			Description: "Searches Wikipedia for a given term.",
			Fun: true,
			Function: function(Bot, message, args) {
				var term = args["search term"];
				if (!term) return message.channel.send(`${Bot.Config.Emoji.X} You didn't specify a search term!`);

				if (!message.channel.nsfw && term != Bot.Utilities.FilterNSFW(term))
					return message.channel.send(`${Bot.Config.Emoji.RedFlag} Your search terms can only be used in NSFW channels!`);

				Bot.Utilities.Request(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${term}&limit=1&namespace=0&format=json`, { json: true }, (error, _, body) => {
					if (body.error) error = body.error.info;
					if (error) {
						Bot.Utilities.Log(error);
						return message.channel.send(`${Bot.Config.Emoji.Warning} Error: \`${error}\``);
					}

					var data = [
						body[1][0],
						body[3][0]
					];

					if (!data[0]) return message.channel.send(`${Bot.Config.Emoji.X} No data!`);

					Bot.Utilities.Request(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${data[0]}&format=json&exchars=320`, { json: true }, (error, _, body) => {
						if (error) {
							Bot.Utilities.Log(error);
							return message.channel.send(`${Bot.Config.Emoji.Warning} Error: \`${error}\``);
						}

						message.channel.send({
							embed: {
								title: `${data[0]} on Wikipedia`,
								description: `${body.query.pages[Object.keys(body.query.pages)[0]].extract}\n[View full article](${data[1]})`,
								color: Bot.Config.Colors.Secondary,
								footer: {
									text: `Requested by ${message.author.tag}`
								}
							}
						});
					});
				});
			}
		}
	}
};
