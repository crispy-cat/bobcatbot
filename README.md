# BobcatBot
## An extendable Discord bot for Node.js.

### Features
- One script
- Easily customizable
- Simple to add, remove and modify commands
- Host yourself or [invite to your server](https://discordapp.com/oauth2/authorize?client_id=681181594412646442&permissions=8&scope=bot)

### Support
- [Support server](https://discord.gg/a66StMe)
- SovereignBeak#9147

### Getting started
1. [Download and install Node.js](https://nodejs.org/)
2. Create a folder on your desktop, on a USB drive, wherever you want
3. Download [app.js](app.js) and put it in the previously created folder
4. Review the settings within [app.js](app.js) (lines 30-153)
5. [Create an application and bot](https://discordapp.com/developers)
6. Create a file in your folder called `.env` with the following text:
	```
	bot_token=YOUR TOKEN HERE
	```
	Additionally you may add the following to change the timezone of the bot:
	```
	TZ=America/New_York
	```
7. Open a command window, navigate to your folder and run the following:
	```
	node app.js
	```
8. Enjoy your new bot!
