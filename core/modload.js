module.exports = function(path) {
	path = path.replace("~", `${this.Root}/modules/`);
	this.Utilities.Log(`Loading module ${path}...`);
	this.Utilities.Decache(path);
	var data = require(path);
	if (typeof data == "function") { // "Advanced" module designed to be executed as function
		this.Utilities.Log("\tAdvanced module, attempting execution...");
		try {
			data = data(this);
			if (data) this.Utilities.Log(`\tModule returned: \`${data}`);
			else this.Utilities.Log("\tModule did not return anything, assuming success");
		} catch (e) {
			this.Utilities.Log(`\t[!] Module did not load successfully; ${e}`);
		}
	} else { // "Basic" module, contains array of commands, etc
		this.Utilities.Log("\tBasic module, loading data...");
		try {
			if (data.Utilities) {
				for (var u in data.Utilities) {
					this.Utilities[u] = data.Utilities[u];
					this.Utilities.Log(`\t\tLoaded utility ${u}`);
				}
			}
			if (data.Commands) {
				for (var c in data.Commands) {
					this.Commands[c] = data.Commands[c];
					var mod = path.match(/(\w+)\.js$/)[1];
					this.Commands[c]._Module = mod;
					if (!this.Commands._Modules.includes(mod)) this.Commands._Modules.push(mod);
					this.Utilities.Log(`\t\tLoaded command ${c}`);
				}
			}
			if (data.GuildSettings) {
				for (var s in data.GuildSettings) {
					this.GuildSettings[s] = data.GuildSettings[s];
					this.Utilities.Log(`\t\tLoaded guild setting ${s}`);
				}
			}
		} catch (e) {
			this.Utilities.Log(`\t[!] Module did not load successfully; ${e}`);
		}
	}
}