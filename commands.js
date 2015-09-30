/**
 * This is the file where the bot commands are located
 *
 * @license MIT license
 */

var http = require('http');
var sys = require('sys');

exports.commands = {
	/**
	 * Help commands
	 *
	 * These commands are here to provide information about the bot.
	 */
	
	/*about: function(arg, by, room, con) {
		if (this.hasRank(by, '#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		text += '**Pokémon Showdown Bot** by: Quinella and TalkTakesTime';
		this.say(con, room, text);
	},
  	seen: function(arg, by, room, con) {
  		var text = (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ');
  		if (toId(arg) === toId(by)) {
  			text += 'Have you looked in the mirror lately?';
  		} else if (toId(arg) === toId(config.nick)) {
  			text += 'You might be either blind or illiterate. Might want to get that checked out.';
  		} else if (!this.chatData[toId(arg)] || !this.chatData[toId(arg)].lastSeen) {
  			text += 'The user ' + arg.trim() + ' has never been seen.';
  		} else {
  			text += arg.trim() + ' was last seen ' + this.getTimeAgo(this.chatData[toId(arg)].seenAt) + ' ago, ' + this.chatData[toId(arg)].lastSeen;
  		}
  		this.say(con, room, text);
  	},
	helix: function(arg, by, room, con) {
		if (this.hasRank(by, '+%@#~') || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		
		var rand = Math.floor(20 * Math.random()) + 1;
		var results = '';

		switch (rand) {
 			case 1: results = "Signs point to yes."; break;
			case 2: results = "Yes."; break;
			case 3: results = "Reply hazy, try again."; break;
			case 4: results = "Without a doubt."; break;
			case 5: results = "My sources say no."; break;
			case 6: results = "As I see it, yes."; break;
			case 7: results = "You may rely on it."; break;
			case 8: results = "Concentrate and ask again."; break;
			case 9: results = "Outlook not so good."; break;
			case 10: results = "It is decidedly so."; break;
			case 11: results = "Better not tell you now."; break;
			case 12: results = "Very doubtful."; break;
			case 13: results = "Yes - definitely."; break;
			case 14: results = "It is certain."; break;
			case 15: results = "Cannot predict now."; break;
			case 16: results = "Most likely."; break;
			case 17: results = "Ask again later."; break;
			case 18: results = "My reply is no."; break;
			case 19: results = "Outlook good."; break;
			case 20: results = "Don't count on it."; break;
		}
		text += ''+results+'';
		this.say(con, room, text);
	},*/
	
	/**
	 * Dev commands
	 *
	 * These commands are here for highly ranked users (or the creator) to use
	 * to perform arbitrary actions that can't be done through any other commands
	 * or to help with upkeep of the bot.
	 */
	
	reload: function(arg, by, room, con) {
		if (config.excepts.indexOf(toId(by)) === -1) return false;
		try {
			this.uncacheTree('./commands.js');
			Commands = require('./commands.js').commands;
			this.say(con, room, 'Comandi ricaricati.');
		} catch (e) {
			error('Errore nel ricaricare i comandi: ' + sys.inspect(e));
		}
		return
	},
	reloaddata: function(arg, by, room, con) {
		if (config.excepts.indexOf(toId(by)) === -1) return false;
		this.say(con, room, 'Reloading data files...');
		var https = require('https');
		var datenow = Date.now();
		var formats = fs.createWriteStream("formats.js");
		https.get("https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/config/formats.js?" + datenow, function(res) {
			res.pipe(formats);
		});
		var formatsdata = fs.createWriteStream("formats-data.js");
		https.get("https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/formats-data.js?" + datenow, function(res) {
			res.pipe(formatsdata);
		});
		var pokedex = fs.createWriteStream("pokedex.js");
		https.get("https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/pokedex.js?" + datenow, function(res) {
			res.pipe(pokedex);
		});
		var moves = fs.createWriteStream("moves.js");
		https.get("https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/moves.js?" + datenow, function(res) {
			res.pipe(moves);
		});
		var abilities = fs.createWriteStream("abilities.js");
		https.get("https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/abilities.js?" + datenow, function(res) {
			res.pipe(abilities);
		});
		var items = fs.createWriteStream("items.js");
		https.get("https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/items.js?" + datenow, function(res) {
			res.pipe(items);
		});
		var learnsets = fs.createWriteStream("learnsets.js");
		https.get("https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/learnsets.js?" + datenow, function(res) {
			res.pipe(learnsets);
		});
		var aliases = fs.createWriteStream("aliases.js");
		https.get("https://raw.githubusercontent.com/Zarel/Pokemon-Showdown/master/data/aliases.js?" + datenow, function(res) {
			res.pipe(aliases);
		});
		return this.say(con, room, 'Data files reloaded');
	},
	uptime: function(arg, by, room, con) {
		if (config.excepts.indexOf(toId(by)) === -1) return false;
		
		var uptime = Math.floor((Date.now() - update) / 1000);
		var uptimeDays = Math.floor(uptime / (24 * 60 * 60));
		uptime -= uptimeDays * (24 * 60 * 60);
		var uptimeHours = Math.floor(uptime / (60 * 60));
		uptime -= uptimeHours * (60 * 60);
		var uptimeMinutes = Math.floor(uptime / 60);
		var uptimeSeconds = uptime - uptimeMinutes * 60;
		
		var uptimeText = "Uptime: ";
		if (uptimeDays > 0) uptimeText += uptimeDays + " " + (uptimeDays === 1 ? "day" : "days") + ", ";
		if (uptimeDays > 0 || uptimeHours > 0) uptimeText += uptimeHours + " " + (uptimeHours === 1 ? "hour" : "hours") + ", ";
		if (uptimeDays > 0 || uptimeHours > 0 || uptimeMinutes > 0) uptimeText += uptimeMinutes + " " + (uptimeMinutes === 1 ? "minute" : "minutes") + ", ";
		uptimeText += uptimeSeconds + " " + (uptimeSeconds === 1 ? "second" : "seconds");
		
		return this.say(con, room, uptimeText);
	},
	custom: function(arg, by, room, con) {
		if (config.excepts.indexOf(toId(by)) === -1) return false;
		// Custom commands can be executed in an arbitrary room using the syntax
		// ".custom [room] command", e.g., to do !data pikachu in the room lobby,
		// the command would be ".custom [lobby] !data pikachu". However, using
		// "[" and "]" in the custom command to be executed can mess this up, so
		// be careful with them.
		if (arg.indexOf('[') === 0 && arg.indexOf(']') > -1) {
			var tarRoom = arg.slice(1, arg.indexOf(']'));
			arg = arg.substr(arg.indexOf(']') + 1).trim();
		}
		this.say(con, tarRoom || room, arg);
	},
	js: function(arg, by, room, con) {
 		if (config.excepts.indexOf(toId(by)) === -1) return false;
 		try {
 			var result = eval(arg.trim());
 			this.say(con, room, JSON.stringify(result));
 		} catch (e) {
 			this.say(con, room, e.name + ": " + e.message);
 		}
 	},
	
	/**
	 * Room Owner commands
  	 *
	 * These commands allow room owners to personalise settings for moderation and command use.
  	 */
	
	canuse: function(arg, by, room, con) {
		if (!this.hasRank(by, '#~') || room.charAt(0) === ',') return false;

		var settable = {
			broadcast: 1,
			spam: 1
		};
		var modOpts = {
			flooding: 1,
			caps: 1,
			stretching: 1,
			bannedwords: 1,
			snen: 1
		};
		var opts = arg.split(',');
		var cmd = toId(opts[0]);
		if (cmd === 'mod' || cmd === 'm' || cmd === 'modding') {
			if (!opts[1] || !toId(opts[1]) || !(toId(opts[1]) in modOpts)) return this.say(con, room, 'Incorrect command: correct syntax is .set mod, [' +
				Object.keys(modOpts).join('/') + '](, [on/off])');

			if (!this.settings['modding']) this.settings['modding'] = {};
			if (!this.settings['modding'][room]) this.settings['modding'][room] = {};
			if (opts[2] && toId(opts[2])) {
				if (!this.hasRank(by, '#~')) return false;
				if (!(toId(opts[2]) in {on: 1, off: 1}))  return this.say(con, room, 'Incorrect command: correct syntax is .set mod, [' +
					Object.keys(modOpts).join('/') + '](, [on/off])');
				this.settings['modding'][room][toId(opts[1])] = (toId(opts[2]) === 'on' ? true : false);
				this.writeSettings();
				this.say(con, room, 'Moderation for ' + toId(opts[1]) + ' in this room is now ' + toId(opts[2]).toUpperCase() + '.');
				return;
			} else {
				this.say(con, room, 'Moderation for ' + toId(opts[1]) + ' in this room is currently ' +
					(this.settings['modding'][room][toId(opts[1])] === false ? 'OFF' : 'ON') + '.');
				return;
			}
		} else {
			if (!Commands[cmd]) return this.say(con, room, '.' + opts[0] + ' is not a valid command.');
			var failsafe = 0;
			while (!(cmd in settable)) {
				if (typeof Commands[cmd] === 'string') {
					cmd = Commands[cmd];
				} else if (typeof Commands[cmd] === 'function') {
					if (cmd in settable) {
						break;
					} else {
						this.say(con, room, 'The settings for .' + opts[0] + ' cannot be changed.');
						return;
					}
				} else {
					this.say(con, room, 'Something went wrong. PM TalkTakesTime here or on Smogon with the command you tried.');
					return;
				}
				failsafe++;
				if (failsafe > 5) {
					this.say(con, room, 'The command ".' + opts[0] + '" could not be found.');
					return;
				}
			}
		

			var settingsLevels = {
				off: false,
				disable: false,
				'+': '+',
				'%': '%',
				'@': '@',
				'&': '&',
				'#': '#',
				'~': '~',
				on: true,
				enable: true
			};
			if (!opts[1] || !opts[1].trim()) {
				var msg = '';
				if (!this.settings[cmd] || (!this.settings[cmd][room] && this.settings[cmd][room] !== false)) {
					msg = '.' + cmd + ' is available for users of rank ' + config.defaultrank + ' and above.';
				} else if (this.settings[cmd][room] in settingsLevels) {
					msg = '.' + cmd + ' is available for users of rank ' + this.settings[cmd][room] + ' and above.';
				} else if (this.settings[cmd][room] === true) {
					msg = '.' + cmd + ' is available for all users in this room.';
				} else if (this.settings[cmd][room] === false) {
					msg = '.' + cmd + ' is not available for use in this room.';
				}
				this.say(con, room, msg);
				return;
			} else {
				if (!this.hasRank(by, '#~')) return false;
				var newRank = opts[1].trim();
				if (!(newRank in settingsLevels)) return this.say(con, room, 'Unknown option: "' + newRank + '". Valid settings are: off/disable, +, %, @, &, #, ~, on/enable.');
				if (!this.settings[cmd]) this.settings[cmd] = {};
				this.settings[cmd][room] = settingsLevels[newRank];
				this.writeSettings();
				this.say(con, room, 'The command .' + cmd + ' is now ' +
					(settingsLevels[newRank] === newRank ? ' available for users of rank ' + newRank + ' and above.' :
					(this.settings[cmd][room] ? 'available for all users in this room.' : 'unavailable for use in this room.')))
 			}
 		}
 	},
	/*autoban: 'blacklist',
	ban: 'blacklist',
	ab: 'blacklist',
	blacklist: function(arg, by, room, con) {
		if (!this.canUse('blacklist', room, user) || room.charAt(0) === ',') return false;

		var e = '';
		arg = toId(arg);
		if (arg.length > 18) e ='Invalid username: names must be less than 19 characters long.';
		if (!e && !this.hasRank(this.ranks[toId(room)] + config.nick, '@&#~')) e = config.nick + ' requires rank of @ or higher to (un)blacklist.';
		if (!e) e = this.blacklistUser(arg, room);
		if (!e) this.say(con, room, '/roomban ' + arg + ', Blacklisted user');
		this.say(con, room, (e ? e : 'User "' + arg + '" added to blacklist successfully.'));
	},
	unautoban: 'unblacklist',
	unban: 'unblacklist',
	unab: 'unblacklist',
	unblacklist: function(arg, by, room, con) {
		if (!this.canUse('blacklist', room, user) || room.charAt(0) === ',') return false;

		var e = '';
		arg = toId(arg);
		if (arg.length > 18) e ='Invalid username: names must be less than 19 characters long';
		if (!e && !this.hasRank(this.ranks[toId(room)] + config.nick, '@&#~')) e = config.nick + ' requires rank of @ or higher to (un)blacklist.';
		if (!e) e = this.unblacklistUser(arg, room);
		if (!e) this.say(con, room, '/roomunban ' + arg);
		this.say(con, room, (e ? e : 'User "' + arg + '" removed from blacklist successfully.'));
	},
	viewbans: 'viewblacklist',
	vab: 'viewblacklist',
	viewautobans: 'viewblacklist',
	viewblacklist: function(arg, by, room, con) {
		if (!this.canUse('blacklist', room, user) || room.charAt(0) === ',') return false;

		var text = '';
		if (!this.settings.blacklist || !this.settings.blacklist[room]) {
			text = 'No users are blacklisted in this room.';
		} else {
			var nickList = Object.keys(this.settings.blacklist[room]);
			text = 'The following users are blacklisted: ' + nickList.join(', ');
			if (text.length > 300) text = 'Too many users to list.';
			if (!nickList.length) text = 'No users are blacklisted in this room.';
		}
		this.say(con, room, '/pm ' + by + ', ' + text);
	},
	banword: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;

		if (!this.settings['bannedwords']) this.settings['bannedwords'] = {};
		this.settings['bannedwords'][arg.trim().toLowerCase()] = 1;
		this.writeSettings();
		this.say(con, room, 'Word "' + arg.trim().toLowerCase() + '" banned.');
	},
	unbanword: function(arg, by, room, con) {
		if (!this.hasRank(by, '~')) return false;

		if (!this.settings['bannedwords']) this.settings['bannedwords'] = {};
		delete this.settings['bannedwords'][arg.trim().toLowerCase()];
		this.writeSettings();
		this.say(con, room, 'Word "' + arg.trim().toLowerCase() + '" unbanned.');
	},*/


	/**
	 * General commands
	 *
	 * Add custom commands here.
	 */
	
	/*
	tell: 'say',
	say: function(arg, by, room, con) {
		if (!this.canUse('say', room, by)) return false;
		this.say(con, room, stripCommands(arg) + ' (' + by + ' said this)');
	},
	joke: function(arg, by, room, con) {
		if (!this.canUse('joke', room, by)) return false;
		var self = this;

		var reqOpt = {
			hostname: 'api.icndb.com',
			path: '/jokes/random',
			method: 'GET'
		};
		var req = http.request(reqOpt, function(res) {
			res.on('data', function(chunk) {
				try {
					var data = JSON.parse(chunk);
					self.say(con, room, data.value.joke);
				} catch (e) {
					self.say(con, room, 'Sorry, couldn\'t fetch a random joke... :(');
				}
			});
		});
		req.end();
	},
	choose: function(arg, by, room, con) {
		if (arg.indexOf(',') === -1) {
			var choices = arg.split(' ');
		} else {
			var choices = arg.split(',');
		}
		choices = choices.filter(function(i) {return (toId(i) !== '')});
		if (choices.length < 2) return this.say(con, room, (room.charAt(0) === ',' ? '': '/pm ' + by + ', ') + '.choose: You must give at least 2 valid choices.');
		var choice = choices[Math.floor(Math.random()*choices.length)];
		this.say(con, room, ((this.canUse('choose', room, by) || room.charAt(0) === ',') ? '':'/pm ' + by + ', ') + stripCommands(choice));
	},
	usage: 'usagestats',
	usagestats: function(arg, by, room, con) {
		if (this.canUse('usagestat', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			var text = '/pm ' + by + ', ';
		}
		text += 'http://www.smogon.com/forums/threads/official-smogon-university-simulator-statistics-%E2%80%94-february-2014.3501320/';
		this.say(con, room, text);
	},
	seen: function(arg, by, room, con) {
		var text = (room.charAt(0) === ',' ? '' : '/pm ' + by + ', ');
		if (toId(arg) === toId(by)) {
			text += 'Have you looked in the mirror lately?';
		} else if (toId(arg) === toId(config.nick)) {
			text += 'You might be either blind or illiterate. Might want to get that checked out.';
		} else if (!this.chatData[toId(arg)] || !this.chatData[toId(arg)].lastSeen) {
			text += 'The user ' + arg.trim() + ' has never been seen.';
		} else {
			text += arg.trim() + ' was last seen ' + this.getTimeAgo(this.chatData[toId(arg)].seenAt) + ' ago, ' + this.chatData[toId(arg)].lastSeen;
		}
		this.say(con, room, text);
	},
	*/
	
	broadcast: function(arg, by, room, con) {
		return
	},
	spam: function(arg, by, room, con) {
		return
	},
	
	mon: 'randompoke',
	randmon: 'randompoke',
	randompike: 'randompoke',
	randompokemon: 'randompoke',
	randompoke: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var formatsdata = require('./formats-data.js').BattleFormatsData;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		arg = arg.toLowerCase().replace(/[^a-z0-9,/]/g,"").split(",");
		var pokemon = [];
		var extractedmon = '';
		var tiers = ["ag", "uber", "ou", "bl", "uu", "bl2", "ru", "bl3", "nu", "pu", "nfe", "lcuber", "lc", "cap", "unreleased"];
		var types = ["normal", "fire", "fighting", "water", "flying", "grass", "poison", "electric", "ground", "psychic", "rock", "ice", "bug", "dragon", "ghost", "dark", "steel", "fairy"];
		var colours = ["red", "blue", "yellow", "green", "black", "brown", "purple", "gray", "white", "pink"];
		var tiersSearch = [];
		var typesSearch = [];
		var doubleTypesSearch = [];
		var coloursSearch = [];
		for (var j in arg) {
			if (arg[j] == "") continue;
			if (tiers.indexOf(arg[j]) > -1 && tiersSearch.indexOf(arg[j]) == -1) tiersSearch.push(arg[j]);
			else if (types.indexOf(arg[j]) > -1 && typesSearch.indexOf(arg[j]) == -1) typesSearch.push(arg[j]);
			else if (colours.indexOf(arg[j]) > -1 && coloursSearch.indexOf(arg[j]) == -1) coloursSearch.push(arg[j]);
			else return this.say(con, room, "\"" + arg[j] + "\" non corrisponde a nessuna categoria");
		}
		
		for (var i in formatsdata) {
			if (formatsdata[i].tier) {
				matchTier = tiersSearch.length ? (tiersSearch.indexOf(formatsdata[i].tier.toLowerCase()) > -1) :
							(["unreleased", "cap"].indexOf(formatsdata[i].tier.toLowerCase()) == -1);
				matchType = typesSearch.length ? (typesSearch.indexOf(pokedex[i].types[0].toLowerCase()) > -1) ||
							(pokedex[i].types[1] && typesSearch.indexOf(pokedex[i].types[1].toLowerCase()) > -1) : true;
				matchColour = coloursSearch.length ? (coloursSearch.indexOf(pokedex[i].color.toLowerCase()) > -1) : true;
				
				if (matchTier && matchType && matchColour) pokemon.push(pokedex[i].species);
			}
		}
		
		if (pokemon.length == 0) return this.say(con, room, "Nessun Pokémon trovato nelle categorie richieste");
		extractedmon = pokemon[Math.floor(Math.random()*pokemon.length)];
		text += extractedmon;
		this.say(con, room, text);
	},
	randomitem: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var items = require('./items.js').BattleItems;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var keyArray = Object.keys(items);
		text += items[keyArray[Math.floor(Math.random() * keyArray.length)]].name;
		return this.say(con, room, text);
	},
	randomability: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var arg = toId(arg);
		if (arg == "") return this.say(con, room, "Inserisci un Pokémon");
		if (aliases[arg]) arg = toId(aliases[arg]);
		
		var abilities = pokedex[arg].abilities;
		var keyArray = Object.keys(abilities);
		text += abilities[keyArray[Math.floor(Math.random() * keyArray.length)]];
		return this.say(con, room, text);
	},
	randomev: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		var evs = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
		var stats = ["hp", "atk", "def", "spa", "spd", "spe"];
		var evpool = 127;
		do {
			var x = stats[Math.floor(Math.random() * stats.length)];
			var y = Math.floor(Math.random() * Math.min(64 - evs[x], evpool + 1));
			evs[x] += y;
			evpool -= y;
		} while (evpool > 0);
		text += evs.hp * 4 + " HP / " + evs.atk * 4 + " Atk / " + evs.def * 4 + " Def / " + evs.spa * 4 + " SpA / " + evs.spd * 4 + " SpD / " + evs.spe * 4 + " Spe";
		return this.say(con, room, text);
	},
	randomiv: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		text += Math.floor(Math.random() * 32) + " HP / " + Math.floor(Math.random() * 32) + " Atk / " + Math.floor(Math.random() * 32) + " Def / " + Math.floor(Math.random() * 32) + " SpA / " + Math.floor(Math.random() * 32) + " SpD / " + Math.floor(Math.random() * 32) + " Spe";
		return this.say(con, room, text);
	},
	randomnature: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		var list = ["Adamant", "Bashful", "Bold", "Brave", "Calm", "Careful", "Docile", "Gentle", "Hardy", "Hasty", "Impish", "Jolly", "Lax", "Lonely", "Mild", "Modest", "Naive", "Naughty", "Quiet", "Quirky", "Rash", "Relaxed", "Sassy", "Serious", "Timid"];
		text += list[Math.floor(Math.random() * list.length)];
		return this.say(con, room, text);
	},
	randomtier: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		arg = toId(arg);
		var tiers = [];
		try {
			var formats = require('./formats.js').Formats;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		if (arg == "all") {
			for (var i in formats) {
				if (formats[i].challengeShow != false) tiers.push(formats[i].name);
			}
		}
		else if (arg == "") {
			tiers = ["Random Battle", "OU", "Ubers", "UU", "RU", "NU", "LC", "Anything Goes", "Random Doubles Battle", "Smogon Doubles", "Random Triples Battle", "Seasonal", "Battle Factory", "Challenge Cup", "Battle Cup 1v1", "1v1", "Monotype", "PU", "[Gen 5] OU", "[Gen 2] Random Battle", "[Gen 1] Random Battle"];
		}
		else {
			return this.say(con, room, "errore");
		}
		text += tiers[Math.floor(Math.random()*tiers.length)];
		this.say(con, room, text);
	},
	randomtype: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		types = ["Normal", "Fire", "Fighting", "Water", "Flying", "Grass", "Poison", "Electric", "Ground", "Psychic", "Rock", "Ice", "Bug", "Dragon", "Ghost", "Dark", "Steel", "Fairy"];
		text += types[Math.floor(Math.random()*types.length)];
		this.say(con, room, text);
	},
	/*randomteam: function(arg, by, room, con) {
		if (this.canUse('randomteam', room, by) || room.charAt(0) === ',') {
				var text = '';
		} else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var formatsdata = require('./formats-data.js').BattleFormatsData;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		
		
	},*/
	
	
    gen: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
			var movedex = require('./moves.js').BattleMovedex;
			var abilities = require('./abilities.js').BattleAbilities;
			var items = require('./items.js').BattleItems;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var arg = toId(arg);
		if (arg == "") return this.say(con, room, "Generazione di cosa?");
		if (aliases[arg]) arg = toId(aliases[arg]);
		if (arg == 'metronome') {
			text += 'Move: Gen 1; Item: Gen 4';
		}
		else if (pokedex[arg]) {
			if (pokedex[arg].num < 0) text += 'CAP';
			else if (pokedex[arg].num <= 151) text += 'Gen 1';
			else if (pokedex[arg].num <= 251) text += 'Gen 2';
			else if (pokedex[arg].num <= 386) text += 'Gen 3';
			else if (pokedex[arg].num <= 493) text += 'Gen 4';
			else if (pokedex[arg].num <= 649) text += 'Gen 5';
			else text += 'Gen 6';
		}
		else if (movedex[arg]) {
			if (movedex[arg].num <= 165) text += 'Gen 1';
			else if (movedex[arg].num <= 251) text += 'Gen 2';
			else if (movedex[arg].num <= 354) text += 'Gen 3';
			else if (movedex[arg].num <= 467) text += 'Gen 4';
			else if (movedex[arg].num <= 559) text += 'Gen 5';
			else if (movedex[arg].num <= 617) text += 'Gen 6';
			else text += 'CAP';
		}
		else if (abilities[arg]) {
			if (abilities[arg].num <= 0) text += 'CAP';
			else if (abilities[arg].num <= 76) text += 'Gen 3';
			else if (abilities[arg].num <= 123) text += 'Gen 4';
			else if (abilities[arg].num <= 164) text += 'Gen 5';
			else text += 'Gen 6';
		}
		else if (items[arg]) {
			text += 'Gen ' + items[arg].gen;
		}
		else text += 'Nessun Pokemon/mossa/abilità/strumento con questo nome trovato'
		this.say(con, room, text);
	},
	
	viablemoves: 'randommoves',
	randommoves: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var aliases = require('./aliases.js').BattleAliases;
			var formatsdata = require('./formats-data.js').BattleFormatsData;
			var movedex = require('./moves.js').BattleMovedex;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		arg = arg.toLowerCase().replace(/[^a-zA-Z0-9,]/g,"").split(",");
		var pokemon = arg[0];
		var doubleAlts = ["double", "doubles", "2", "triple", "triples", "3"];
		if (arg[1] && doubleAlts.indexOf(arg[1]) > -1) {
			text += "__Random doubles/triples moves__: ";
			var whichRandom = "randomDoubleBattleMoves";
		}
		else {
			text += "__Random singles moves__: ";
			var whichRandom = "randomBattleMoves";
		}
		if (aliases[pokemon]) pokemon = aliases[pokemon].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (formatsdata[pokemon]) {
			moves = '';
			for (var i in formatsdata[pokemon][whichRandom]) {
				moves += ', ' + movedex[formatsdata[pokemon][whichRandom][i]].name;
			}
			if (moves == '') text += 'none';
			else text += moves.substring(2);
		}
		else {
			text += "Pokémon non trovato";
		}
		this.say(con, room, text);
	},
	eventdex: 'event',
	eventdata: 'event',
	event: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var aliases = require('./aliases.js').BattleAliases;
			var formatsdata = require('./formats-data.js').BattleFormatsData;
			var movedex = require('./moves.js').BattleMovedex;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		arg = arg.toLowerCase().replace(/[^a-zA-Z0-9,]/g,"").split(",");
		var pokemon = arg[0];
		if (!pokemon) return this.say(con, room, "Che Pokémon devo cercare?");
		if (aliases[pokemon]) pokemon = aliases[pokemon].toLowerCase().replace(/[^a-zA-Z0-9]/g,"");
		if (!formatsdata[pokemon]) return this.say(con, room, "Pokémon non trovato");
		if (!formatsdata[pokemon].eventPokemon) return this.say(con, room, "Non esistono eventi di " + pokemon);
		var eventPokemon = formatsdata[pokemon].eventPokemon;
		if (formatsdata[pokemon]) {
			if (arg[1]) {
				var eventNumber = Number(arg[1]);
				if (!isNaN(eventNumber) && eventNumber <= 1000 && eventNumber % 1 == 0) {
					eventNumber = Number(eventNumber);
					if (!eventPokemon[eventNumber]) return this.say(con, room, "Non esiste l'evento numero " + eventNumber + " di " + pokemon + ". Quello più recente è il numero " + eventPokemon.length - 1);
					eventNumber = eventPokemon[eventNumber];
					var text = "Gen " + eventNumber.generation + " event";
					text += (eventNumber.abilities ? ", " + eventNumber.abilities.join("/") : "");
					text += (eventNumber.isHidden ? ", hidden ability" : "");
					text += (eventNumber.nature ? ", " + eventNumber.nature.toLowerCase() + " nature" : "");
					text += (eventNumber.moves ? ", " + eventNumber.moves.join("/") : "");
					text += (eventNumber.level ? ", level " + eventNumber.level : "");
					text += (eventNumber.gender ? ", " + (eventNumber.gender == "M" ? "male" : "female") : "");
					text += (eventNumber.shiny ? ", shiny" : "");
					
					return this.say(con, room, text);
				}
				return this.say(con, room, "Errore: il numero dell'evento che hai inserito o non è un numero, o è troppo grande, o non è intero.");
			}
			return this.say(con, room, "Esistono " + eventPokemon.length.toString() + " eventi di " + pokemon + " (0 - " + (eventPokemon.length - 1).toString() + ")");
		}
		else return this.say(con, room, "Pokémon non trovato");
	},
	
	naturalgift: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var items = require('./items.js').BattleItems;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var types = ["normal", "fire", "fighting", "water", "flying", "grass", "poison", "electric", "ground", "psychic", "rock", "ice", "bug", "dragon", "ghost", "dark", "steel", "fairy"];
		arg = toId(arg);
		if (arg === "" || types.indexOf(arg) === -1) return this.say(con, room, "Inserisci un tipo");
		
		var results = [];
		var count = 0;
		var name;
		var power;
		
		for (var i in items) {
			if (items[i].naturalGift && items[i].naturalGift.type && items[i].naturalGift.type.toLowerCase() === arg) {
				name = items[i].name || i;
				power = items[i].naturalGift.basePower || 0;
				results[count] = {name: name, power: power};
				count++;
			}
		}
		
		results = results.sort(function (a, b) {
			return b.power - a.power;
		});
		
		for (var j in results) {
			if (j > 0) text += " - ";
			text += results[j].name + " (" + results[j].power + ")";
		}
		
		return this.say(con, room, text);
	},
	
	trad: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var trad = require('./tradobject.js').trad;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var parola = arg.toLowerCase().replace(/[^a-z0-9àèéìòù]/g,"");
		if (parola == "") return this.say(con, room, "Cosa devo tradurre?");
		if (aliases[parola]) var aliasParola = aliases[parola].toLowerCase().replace(/[^a-z0-9àèéìòù]/g,"");
		
		var results = [];
		
		//if (parola == "metronome") return this.say(con, room, "metronomo (item), plessimetro (move)");
		
		for (var i in trad) {
			for (var j in trad[i]) {
				if (trad[i][j].en.replace(/[^a-z0-9àèéìòù]/g,"") == parola) results.push({"trad": trad[i][j].it, "cat": i});
				else if (aliasParola && trad[i][j].en.replace(/[^a-z0-9àèéìòù]/g,"") == aliasParola) results.push({"trad": trad[i][j].it, "cat": i});
				else if (trad[i][j].it.replace(/[^a-z0-9àèéìòù]/g,"") == parola) results.push({"trad": trad[i][j].en, "cat": i});
			}
		}
		
		if (results.length) {
			if (results.length === 1) return this.say(con, room, results[0].trad);
			var resultstext = "";
			for (var k in results) {
				resultstext += results[k].trad + " (" + results[k].cat + ")";
				if (k < results.length - 1) resultstext += ", ";
			}
			return this.say(con, room, resultstext);
		}
		return this.say(con, room, "Non trovato");
	},
	heatcrash: 'heavyslam',
	heavyslam: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var pokemon = arg.split(',');
		if (pokemon.length != 2) return this.say(con, room, 'Inserisci i due Pokémon separati da una virgola');
		pokemon[0] = toId(pokemon[0]);
		pokemon[1] = toId(pokemon[1]);
		if (aliases[pokemon[0]]) pokemon[0] = toId(aliases[pokemon[0]]);
		if (aliases[pokemon[1]]) pokemon[1] = toId(aliases[pokemon[1]]);
		if (pokedex[pokemon[0]]) var weight0 = pokedex[pokemon[0]].weightkg;
		else return this.say(con, room, "Pokémon attaccante non trovato");
		if (pokedex[pokemon[1]]) var weight1 = pokedex[pokemon[1]].weightkg;
		else return this.say(con, room, "Pokémon difensore non trovato");
		
		text += "Heavy slam/Heat crash base power: ";
		if (weight0 / weight1 <= 2) text += "40";
		else if (weight0 / weight1 <= 3) text += "60";
		else if (weight0 / weight1 <= 4) text += "80";
		else if (weight0 / weight1 <= 5) text += "100";
		else text += "120";
		this.say(con, room, text);
	},
	
	preevo: 'prevo',
	prevo: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var pokemon = toId(arg);
		if (aliases[pokemon]) pokemon = toId(aliases[pokemon]);
		if (pokedex[pokemon]) {
			if (pokedex[pokemon].prevo) {
				text += pokedex[pokemon].prevo;
			}
			else text += pokemon + ' non ha una pre-evoluzione';
		}
		else text += "Pokémon non trovato";
		this.say(con, room, text);
	},
	
	priority: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			var text = '/pm ' + by + ', ';
		}
		return this.say(con, room, text + '.priority è stato rimosso; ora puoi usare /movesearch __pokemon__, priority+');
	},
	boosting: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var movedex = require('./moves.js').BattleMovedex;
			var learnsets = require('./learnsets.js').BattleLearnsets;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var arg = toId(arg);
		if (aliases[arg]) arg = toId(aliases[arg]);

		if (pokedex[arg]) {
			var boostingmoves = [];
			var pokemonToCheck = [arg];
			var i = true;
			while (i) {
				if (pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo) pokemonToCheck.push(pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo);
				else i = false;
			}
			for (var j in pokemonToCheck) {
				if (learnsets[pokemonToCheck[j]]) {
					for (var k in learnsets[pokemonToCheck[j]].learnset) {
						if (movedex[k]) {
							if ((movedex[k].boosts && movedex[k].target == 'self' && k != 'doubleteam' && k != 'minimize') || k == 'bellydrum') {
								if (boostingmoves.indexOf(movedex[k].name) == -1) {
									boostingmoves.push(movedex[k].name);
								}
							}
						}
					}
				}
			}
			boostingmoves.sort();
			for (var l in boostingmoves) {
				text += boostingmoves[l];
				if (l != boostingmoves.length-1) text += ', ';
			}
		}
		else {
			text += "Non trovato";
		}
		if (text == '') text = 'Nessuna boosting move trovata';
		this.say(con, room, text);
	},
	recovery: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			var text = '/pm ' + by + ', ';
		}
		return this.say(con, room, text + '.recovery è stato rimosso; ora puoi usare /movesearch __pokemon__, recovery');
	},
	mexican: 'status',
	status: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var movedex = require('./moves.js').BattleMovedex;
			var learnsets = require('./learnsets.js').BattleLearnsets;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var arg = toId(arg);
		if (aliases[arg]) arg = toId(aliases[arg]);

		if (pokedex[arg]) {
			var mexicanmoves = [];
			var pokemonToCheck = [arg];
			var i = true;
			while (i) {
				if (pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo) pokemonToCheck.push(pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo);
				else i = false;
			}
			for (var j in pokemonToCheck) {
				if (learnsets[pokemonToCheck[j]]) {
					for (var k in learnsets[pokemonToCheck[j]].learnset) {
						if (movedex[k]) {
							if (movedex[k].status || (movedex[k].volatileStatus && movedex[k].volatileStatus == 'confusion') || (movedex[k].secondary && movedex[k].secondary.chance == 100 && (movedex[k].secondary.status || movedex[k].secondary.volatileStatus == 'confusion'))) {
								if (mexicanmoves.indexOf(movedex[k].name) == -1) {
									mexicanmoves.push(movedex[k].name);
								}
							}
						}
					}
				}
			}
			mexicanmoves.sort();
			for (var l in mexicanmoves) {
				text += mexicanmoves[l];
				if (l != mexicanmoves.length-1) text += ', ';
			}
		}
		else {
			text += "Non trovato";
		}
		if (text == '') text = 'Nessuna status move trovata';
		this.say(con, room, text);
	},
	hazards: 'hazard',
	hazard: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var movedex = require('./moves.js').BattleMovedex;
			var learnsets = require('./learnsets.js').BattleLearnsets;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		var arg = toId(arg);
		if (aliases[arg]) arg = toId(aliases[arg]);

		if (pokedex[arg]) {
			var hazards = [];
			var pokemonToCheck = [arg];
			var i = true;
			while (i) {
				if (pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo) pokemonToCheck.push(pokedex[pokemonToCheck[pokemonToCheck.length-1]].prevo);
				else i = false;
			}
			for (var j in pokemonToCheck) {
				if (learnsets[pokemonToCheck[j]]) {
					for (var k in learnsets[pokemonToCheck[j]].learnset) {
						if (movedex[k]) {
							if (k == "stealthrock" || k == "spikes" || k == "toxicspikes" || k == "stickyweb") {
								if (hazards.indexOf(movedex[k].name) == -1) {
									hazards.push(movedex[k].name);
								}
							}
						}
					}
				}
			}
			hazards.sort();
			for (var l in hazards) {
				text += hazards[l];
				if (l != hazards.length-1) text += ', ';
			}
		}
		else {
			text += "Non trovato";
		}
		if (text == '') text = 'Nessuna hazard trovata';
		this.say(con, room, text);
	},
	typelearn: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			var text = '/pm ' + by + ', ';
		}
		return this.say(con, room, text + '.typelearn è stato rimosso; ora puoi usare /movesearch __pokemon__, __tipo__ (ad esempio /movesearch pikachu, electric type)');
	},
	ds: 'dexsearch',
	dsearch: 'dexsearch',
	dexsearch: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			var text = '/pm ' + by + ', ';
		}
		return this.say(con, room, text + '.dexsearch è stato rimosso, l\'unica funzione che aveva in più rispetto a /dexsearch ora è implementata anche lì (statistica > o < numero)');
	},
	stat: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		try {
			var pokedex = require('./pokedex.js').BattlePokedex;
			var aliases = require('./aliases.js').BattleAliases;
		} catch (e) {
			return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
		}
		
		arg = arg.toLowerCase().replace(/[^a-z0-9,+-]/g, '').split(',');
		if (!arg[1]) return this.say(con, room, 'Scrivi il Pokémon e la stat da calcolare (ad esempio .stat pikachu, speed)');
		arg[0] = arg[0].replace(/[+-]/g,"");
		arg[1] = arg[1].replace(/[+-]/g,"");
		if (aliases[arg[0]] && pokedex[toId(aliases[arg[0]])]) arg[0] = toId(aliases[arg[0]]);
		if (aliases[arg[1]] && pokedex[toId(aliases[arg[1]])]) arg[1] = toId(aliases[arg[1]]);
		
		if (pokedex[arg[1]]) {
			var pokemonarg = 1;
			var statarg = 0;
		}
		else if (pokedex[arg[0]]) {
			var pokemonarg = 0;
			var statarg = 1;
		}
		else return this.say(con, room, 'Pokémon non trovato');
		
		if (arg[statarg] == 'attack') arg[statarg] = 'atk';
		else if (arg[statarg] == 'defense') arg[statarg] = 'def';
		else if (arg[statarg] == 'specialattack') arg[statarg] = 'spa';
		else if (arg[statarg] == 'specialdefense') arg[statarg] = 'spd';
		else if (arg[statarg] == 'speed') arg[statarg] = 'spe';
		
		if (pokedex[arg[pokemonarg]].baseStats[arg[statarg]]) base = pokedex[arg[pokemonarg]].baseStats[arg[statarg]];
		else return this.say(con, room, 'Statistica non trovata: scegli tra attack, defense, special attack, special defense e speed; o le rispettive abbreviazioni');
		
		var calculator = require('./calc.js');
		argSend = arg.slice(2);
		argSend = argSend;
		if (arg[statarg] != 'hp') {
			var results = calculator.calcfunc(argSend, arg[pokemonarg], arg[statarg], 'stat', con, room, this);
			
			if (results[0] == 'err') return this.say(con, room, results[1]);
			
			var ev = results[0];
			var iv = results[1];
			var itemBoost = results[2];
			var boost = results[3];
			var nature = results[4];
			var abilityBoost = results[5];
			var level = Number(results[6]);
			var item = results[7];
			var ability = results[8]
			var statBoost = results[9];
			var sandBoost = results[10];
			
			if (ev == -1) ev = 252;
			if (iv == -1) iv = 31;
			if (itemBoost == 0) itemBoost = 1;
			if (nature == 0) nature = 1;
			if (abilityBoost == 0) abilityBoost = 1;
			if (sandBoost == 0) sandBoost = 1;
			if (level == 0) level = 100;
			
			//var stat = Math.floor(Math.floor((((iv + 2*base + ev/4) * level/100) + 5) * nature) * boost * itemBoost * abilityBoost * sandBoost);
			
			var stat = Math.floor(Math.floor(Math.floor(2*base + iv + Math.floor(ev/4)) * level/100 + 5) * nature);
			
			var boostTable = [1, 1.5, 2, 2.5, 3, 3.5, 4];
			if (boost >= 0) stat = Math.floor(stat * boostTable[boost]);
			else stat = Math.floor(stat / boostTable[-boost]);
			
			function chainModify(mod, nextMod) {
				var prevMod = Math.floor(mod * 4096);
				
				var numerator = 1;
				var denominator = 1;
				if (nextMod.lenght) {
					numerator = nextMod[0];
					denominator = nextMod[1];
				}
				else {
					numerator = nextMod;
				}
				nextMod = Math.floor(numerator * 4096 / denominator);
				
				return ((prevMod * nextMod + 2048) >> 12) / 4096;
			}
			
			var modifier = 1;
			if (itemBoost != 1) modifier = chainModify(modifier, itemBoost);
			if (abilityBoost != 1) modifier = chainModify(modifier, abilityBoost);
			if (sandBoost != 1) modifier = chainModify(modifier, sandBoost);
			
			stat = Math.floor((stat * Math.floor(modifier * 4096) + 2048 - 1) / 4096);
			
			if (stat == 0) stat = 1;
		}
		else {
			var results = calculator.calcfunc(argSend, arg[statarg], 'stathp', con, room, this);
			
			if (results[0] == 'err') return this.say(con, room, results[1]);
			
			var ev = results[0];
			var iv = results[1];
			var level = Number(results[6]);
			
			if (ev == -1) ev = 252;
			if (iv == -1) iv = 31;
			if (level == 0) level = 100;
			
			var stat = Math.floor(Math.floor(2*base + iv + Math.floor(ev/4) + 100) * level/100 + 10);
			if (stat == 0) stat = 1;
		}
		
		if (pokedex[arg[pokemonarg]].species) text += pokedex[arg[pokemonarg]].species + ' ';
		else return this.say(con, room, 'Questo errore non si dovrebbe verificare... (errore nome)');
		
		if (statBoost != '' && statBoost != undefined) text += 'a ' + statBoost + ', ';
		
		text += 'con ';
		
		text += ev + 'ev e ';
		
		text += iv + 'iv, ';
		
		if (arg[statarg] == 'hp') text += ' ';
		else if (nature == 0.9) text += 'con la natura sfavorevole, ';
		else if (nature == 1.1) text += 'con la natura favorevole, ';
		else if (nature == 1) text += ' ';
		else return this.say(con, room, 'Questo errore non si dovrebbe verificare... (errore nature)');
		
		
		if (item != '' && statBoost != undefined) text += item + ', ';
		
		if (ability != '' && statBoost != undefined) text += ability + ', ';
		
		if (sandBoost == 1.5) text += 'sotto sand, ';
		
		if (level != 100) text += 'al livello ' + level + ' ';
		
		text += ' ha ';
		
		if      (arg[statarg] == 'hp') text += 'gli HP';
		else if (arg[statarg] == 'atk') text += 'l\'Attacco';
		else if (arg[statarg] == 'def') text += 'la Difesa';
		else if (arg[statarg] == 'spa') text += 'l\'Attacco Speciale';
		else if (arg[statarg] == 'spd') text += 'la Difesa Speciale';
		else if (arg[statarg] == 'spe') text += 'la Velocità';
		else return this.say(con, room, 'Questo errore non si dovrebbe verificare... (errore statistiche)');
		
		text += ' pari a ' + stat;
		
		this.say(con, room, text);
	},
	
	smogon: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		arg = toId(arg);
		switch (arg) {
			case "":
			case "forum":
			case "forums":
				text += "http://www.smogon.com/forums/";
				break;
			case "competitivediscussion":
				text += "http://www.smogon.com/forums/forums/249/";
				break;
			case "overused":
			case "ou":
				text += "http://www.smogon.com/forums/forums/281/";
				break;
			case "ubers":
			case "uber":
				text += "http://www.smogon.com/forums/forums/259/";
				break;
			case "underused":
			case "uu":
				text += "http://www.smogon.com/forums/forums/288/";
				break;
			case "rarelyused":
			case "ru":
				text += "http://www.smogon.com/forums/forums/302/";
				break;
			case "neverused":
			case "nu":
				text += "http://www.smogon.com/forums/forums/305/";
				break;
			case "pu":
				text += "www.smogon.com/forums/forums/327/";
				break;
			case "littlecup":
			case "lc":
				text += "http://www.smogon.com/forums/forums/260/";
				break;
			case "doubles":
			case "smogondoubles":
				text += "http://www.smogon.com/forums/forums/262/";
				break;
			case "othermetagames":
			case "om":
				text += "http://www.smogon.com/forums/forums/206/";
				break;
			case "battlespot":
				text += "http://www.smogon.com/forums/forums/265/";
				break;
			case "vgc":
				text += "http://www.smogon.com/forums/forums/127/";
				break;
			case "ruinsofalph":
				text += "http://www.smogon.com/forums/forums/31/";
				break;
			case "thepolicyreview":
			case "policyreview":
				text += "http://www.smogon.com/forums/forums/63/";
				break;
			
			case "tournaments":
			case "tournament":
			case "tours":
			case "tour":
				text += "http://www.smogon.com/forums/forums/34/";
				break;
			case "smogontour":
			case "st":
				text += "http://www.smogon.com/forums/forums/49/";
				break;
			case "smogonpremierleague":
			case "premierleague":
			case "spl":
				text += "http://www.smogon.com/forums/forums/130/";
				break;
			case "worldcupofpokemon":
			case "wcop":
				text += "http://www.smogon.com/forums/forums/234/";
				break;
			case "smogongrandslam":
			case "grandslam":
				text += "http://www.smogon.com/forums/forums/208/";
				break;
			case "thecompetitor":
			case "competitor":
				text += "http://www.smogon.com/forums/forums/297/";
				break;
			case "tournamentapplications":
				text += "http://www.smogon.com/forums/forums/214/";
				break;
			case "localtournaments":
				text += "http://www.smogon.com/forums/forums/318/";
				break;
			case "wifitournaments":
				text += "http://www.smogon.com/forums/forums/100/";
				break;
			
			case "smogonstartershangout":
			case "startershangout":
				text += "http://www.smogon.com/forums/forums/264/";
				break;
			case "comunityfeedback":
			case "feedback":
				text += "http://www.smogon.com/forums/forums/323/";
				break;
			case "battling101":
				text += "http://www.smogon.com/forums/forums/42/";
				break;
			case "tuteetalk":
				text += "http://www.smogon.com/forums/forums/223/";
				break;
			case "ratemyteam":
			case "rmt":
				text += "http://www.smogon.com/forums/forums/52/";
				break;
			case "orasouteams":
				text += "http://www.smogon.com/forums/forums/261/";
				break;
			case "orasotherteams":
				text += "http://www.smogon.com/forums/forums/292/";
				break;
			case "pastgenteams":
				text += "http://www.smogon.com/forums/forums/319/";
				break;
			case "teamshowcase":
				text += "http://www.smogon.com/forums/forums/314/";
				break;
			case "ratingactivities":
				text += "http://www.smogon.com/forums/forums/92/";
				break;
			case "rmtarchive":
				text += "http://www.smogon.com/forums/forums/84/";
				break;
			case "pokemonshowdown":
			case "ps":
				text += "http://www.smogon.com/forums/forums/209/";
				break;
			case "disciplineappeals":
				text += "http://www.smogon.com/forums/forums/295/";
				break;
			case "news":
			case "pokemonshowdownnews":
			case "psnews":
				text += "http://www.smogon.com/forums/forums/270/";
				break;
			case "theplayer":
				text += "http://www.smogon.com/forums/forums/307/";
				break;
			case "wifi":
				text += "http://www.smogon.com/forums/forums/53/";
				break;
			case "battlerequests":
			case "wifibattlerequests":
				text += "http://www.smogon.com/forums/forums/290/";
				break;
			case "wifitournaments":
			case "wifitournament":
			case "wifitours":
			case "wifitour":
				text += "http://www.smogon.com/forums/forums/81/";
				break;
			case "giveaways":
				text += "http://www.smogon.com/forums/forums/316/";
				break;
			case "orangeisland":
				text += "http://www.smogon.com/forums/forums/205/";
				break;
			case "oras":
			case "orangeislandoras":
				text += "http://www.smogon.com/forums/forums/320/";
				break;
			
			case "preliminarypokedex":
				text += "http://www.smogon.com/forums/forums/304/";
				break;
			case "sixthgenerationcontributions":
				text += "http://www.smogon.com/forums/forums/253/";
				break;
			case "ubersanalyses":
				text += "http://www.smogon.com/forums/forums/254/";
				break;
			case "ouanalyses":
				text += "http://www.smogon.com/forums/forums/255/";
				break;
			case "uuanalyses":
				text += "http://www.smogon.com/forums/forums/303/";
				break;
			case "ruanalyses":
				text += "http://www.smogon.com/forums/forums/306/";
				break;
			case "nuanalyses":
				text += "http://www.smogon.com/forums/forums/315/";
				break;
			case "lcanalyses":
				text += "http://www.smogon.com/forums/forums/256/";
				break;
			case "doubleanalyses":
				text += "http://www.smogon.com/forums/forums/257/";
				break;
			case "vgc2015analyses":
			case "vgcanalyses":
				text += "http://www.smogon.com/forums/forums/162/";
				break;
			case "othermetagamesanalyses":
			case "omanalyses":
				text += "http://www.smogon.com/forums/forums/310/";
				break;
			case "articlesandletters":
				text += "http://www.smogon.com/forums/forums/258/";
				break;
			case "pastgenerationcontributions":
				text += "http://www.smogon.com/forums/forums/148/";
				break;
			case "bwubersanalyses":
				text += "http://www.smogon.com/forums/forums/149/";
				break;
			case "bwouanalyses":
				text += "http://www.smogon.com/forums/forums/156/";
				break;
			case "bwuuanalyses":
				text += "http://www.smogon.com/forums/forums/172/";
				break;
			case "bwruanalyses":
				text += "http://www.smogon.com/forums/forums/181/";
				break;
			case "bwnuanalyses":
				text += "http://www.smogon.com/forums/forums/186/";
				break;
			case "bwlcanalyses":
				text += "http://www.smogon.com/forums/forums/150/";
				break;
			case "bwdoublesanalyses":
				text += "http://www.smogon.com/forums/forums/243/";
				break;
			case "dppanalyses":
				text += "http://www.smogon.com/forums/forums/136/";
				break;
			case "pastvgcanalyses":
				text += "http://www.smogon.com/forums/forums/179/";
				break;
			case "rbygscadv":
			case "rby":
			case "gsc":
			case "adv":
			case "rse":
				text += "http://www.smogon.com/forums/forums/147/";
				break;
			case "pastgenerationarticlesandletters":
				text += "http://www.smogon.com/forums/forums/106/";
				break;
			case "techicalprojects":
				text += "http://www.smogon.com/forums/forums/107/";
				break;
			case "archives":
				text += "http://www.smogon.com/forums/forums/125/";
				break;
			case "uploadedanalyses":
				text += "http://www.smogon.com/forums/forums/75/";
				break;
			case "lockedoutdatedanalyses":
			case "lockedanalyses":
			case "outdatedanalyses":
				text += "http://www.smogon.com/forums/forums/124/";
				break;
			case "xypreviews":
				text += "http://www.smogon.com/forums/forums/285/";
				break;
			
			case "thesmog":
				text += "http://www.smogon.com/forums/forums/79/";
				break;
			case "thesmogarticleapprovals":
				text += "http://www.smogon.com/forums/forums/216/";
				break;
			case "thesmogartistapprovals":
				text += "http://www.smogon.com/forums/forums/299/";
				break;
			case "socialmedia":
				text += "http://www.smogon.com/forums/forums/275/";
				break;
			case "smogonirc":
			case "irc":
				text += "http://www.smogon.com/forums/forums/226/";
				break;
			case "ircdisciplineappeals":
				text += "http://www.smogon.com/forums/forums/228/";
				break;
			case "createapokemonproject":
			case "createapokmonproject":
			case "capproject":
			case "cap":
				text += "http://www.smogon.com/forums/forums/66/";
				break;
			case "cappreevolutionworkshop":
			case "cappreevolution":
				text += "http://www.smogon.com/forums/forums/198/";
				break;
			case "cappolicyreview":
				text += "http://www.smogon.com/forums/forums/199/";
				break;
			case "capprocessarchive":
			case "caparchive":
				text += "http://www.smogon.com/forums/forums/201/";
				break;
			case "capmetagame":
				text += "http://www.smogon.com/forums/forums/311/";
				break;
			
			case "congrecationofthemasses":
				text += "http://www.smogon.com/forums/forums/163/";
				break;
			case "sportsarena":
				text += "http://www.smogon.com/forums/forums/94/";
				break;
			case "thegreatlibrary":
				text += "http://www.smogon.com/forums/forums/235/";
				break;
			case "firebotdevelopmentlab":
			case "firebot":
				text += "http://www.smogon.com/forums/forums/38/";
				break;
			case "cirusmaximus":
				text += "http://www.smogon.com/forums/forums/78/";
				break;
			case "officeofstrategicinfluence":
				text += "http://www.smogon.com/forums/forums/123/";
				break;
			case "gameproposal":
				text += "http://www.smogon.com/forums/forums/246/";
				break;
			case "animestylebattling":
				text += "http://www.smogon.com/forums/forums/177/";
				break;
			case "smearglesstudio":
			case "smearglestudio":
				text += "http://www.smogon.com/forums/forums/50/";
				break;
			case "smearglesstudioartistapprovals":
			case "smearglestudioartistapprovals":
				text += "http://www.smogon.com/forums/forums/298/";
				break;
			case "threadcryonics":
				text += "http://www.smogon.com/forums/forums/283/";
				break;
			case "smogonsgreatesthits":
			case "smogongreatesthits":
				text += "http://www.smogon.com/forums/forums/58/";
				break;
			case "trouducul":
				text += "http://www.smogon.com/forums/forums/46/";
				break;
			case "closedforums":
				text += "http://www.smogon.com/forums/forums/183/";
				break;
			default:
				text += "Subforum non trovato";
		}
		return this.say(con, room, text);
	},
	
	stats: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "http://www.smogon.com/stats/2015-07/");
		}
	},
	
	seasonal: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "https://parnassius.makes.org/thimble/ODQyNDAwMjU2/ps-seasonal_");
		}
	},
	
	renames: 'showrenames',
	showrenames: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "https://parnassius.makes.org/thimble/NDg3MzI2MjA4/ps-showrenames_");
		}
	},
	
	guida: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "Comandi -> https://parnassius.makes.org/thimble/LTExMzE4MDE2MA==/guida-cerbottana_");
		}
	},
	
	memes: function(arg, by, room, con) {
		if (this.canUse('spam', room, by) || room.charAt(0) === ',') {
			var memes = [
				"( ͡° ͜ʖ ͡°)", "( ͠° ͟ʖ ͡°)", "ᕦ( ͡° ͜ʖ ͡°)ᕤ", "( ͡~ ͜ʖ ͡°)", "( ͡o ͜ʖ ͡o)", "͡° ͜ʖ ͡ -", "( ͡͡ ° ͜ ʖ ͡ °)﻿", "( ͡ ͡° ͡°  ʖ ͡° ͡°)", "(ง ͠° ͟ل͜ ͡°)ง", "( ͡° ͜ʖ ͡ °)", "(ʖ ͜° ͜ʖ)", "[ ͡° ͜ʖ ͡°]",
				"ヽ༼ຈل͜ຈ༽ﾉ", "( ͡o ͜ʖ ͡o)", "{ ͡• ͜ʖ ͡•}", "( ͡° ͜V ͡°)", "( ͡^ ͜ʖ ͡^)", "( ‾ʖ̫‾)", "( ͡°╭͜ʖ╮͡° )", "ᕦ( ͡°╭͜ʖ╮͡° )ᕤ", "╰། ◉ ◯ ◉ །╯", "ᕦ( ̿ ﹏ ̿ )ᕤ", "╰(◕ᗜ◕)╯", "(^ ◕ᴥ◕ ^)",
				"ʕ༼◕  ౪  ◕✿༽ʔ", "╰໒(◉ᴥ◉)७╯", "┌〳 ۞ ﹏ ۞ 〵┐", "ლ(ಠ益ಠლ)", "¯\_(⊙_ʖ⊙)_/¯", "(つ ¯͒ ʖ̯  ¯͒ )つ", "ヽ༼ಢ_ಢ༽ﾉ☂", "ᕦʕ ° o ° ʔᕤ", "(╭ರ_•́)"
			];
			return this.say(con, room, memes[Math.floor(Math.random() * memes.length)]);
		}
	},
	
	shitpost: function(arg, by, room, con) {
		if (this.canUse('spam', room, by) || room.charAt(0) === ',') {
			var letters = {
				a: [
					"┌─┐",
					"├─┤",
					"┴░┴"
				],
				b: [
					"┌┐░",
					"├┴┐",
					"└─┘"
				],
				c: [
					"┌─┐",
					"│░░",
					"└─┘"
				],
				d: [
					"┌┬┐",
					"░││",
					"─┴┘"
				],
				e: [
					"┌─┐",
					"├┤░",
					"└─┘"
				],
				f: [
					"┌─┐",
					"├┤░",
					"└░░"
				],
				g: [
					"┌─┐",
					"│░┬",
					"└─┘"
				],
				h: [
					"┬░┬",
					"├─┤",
					"┴░┴"
				],
				i: [
					"┬",
					"│",
					"┴"
				],
				j: [
					"░┬",
					"░│",
					"└┘"
				],
				k: [
					"┬┌─",
					"├┴┐",
					"┴░┴"
				],
				l: [
					"┬░░",
					"│░░",
					"┴─┘"
				],
				m: [
					"┌┬┐",
					"│││",
					"┴░┴"
				],
				n: [
					"┌┐┌",
					"│││",
					"┘└┘"
				],
				o: [
					"┌─┐",
					"│░│",
					"└─┘"
				],
				p: [
					"┌─┐",
					"├─┘",
					"┴░░"
				],
				q: [
					"┌─┐░",
					"│─┼┐",
					"└─┘└"
				],
				r: [
					"┬─┐",
					"├┬┘",
					"┴└─"
				],
				s: [
					"┌─┐",
					"└─┐",
					"└─┘"
				],
				t: [
					"┌┬┐",
					"░│░",
					"░┴░"
				],
				u: [
					"┬░┬",
					"│░│",
					"└─┘"
				],
				v: [
					"┬░░┬",
					"└┐┌┘",
					"░└┘░"
				],
				w: [
					"┬░┬",
					"│││",
					"└┴┘"
				],
				x: [
					"─┐░┬",
					"┌┴┬┘",
					"┴░└─"
				],
				y: [
					"┬░┬",
					"└┬┘",
					"░┴░"
				],
				z: [
					"┌─┐",
					"┌─┘",
					"└─┘"
				],
				A: [
					"╔═╗",
					"╠═╣",
					"╩░╩"
				],
				B: [
					"╔╗░",
					"╠╩╗",
					"╚═╝"
				],
				C: [
					"╔═╗",
					"║░░",
					"╚═╝"
				],
				D: [
					"╔╦╗",
					"░║║",
					"═╩╝"
				],
				E: [
					"╔═╗",
					"║╣░",
					"╚═╝"
				],
				F: [
					"╔═╗",
					"╠╣░",
					"╚░░"
				],
				G: [
					"╔═╗",
					"║░╦",
					"╚═╝"
				],
				H: [
					"╦░╦",
					"╠═╣",
					"╩░╩"
				],
				I: [
					"╦",
					"║",
					"╩"
				],
				J: [
					"░╦",
					"░║",
					"╚╝"
				],
				K: [
					"╦╔═",
					"╠╩╗",
					"╩░╩"
				],
				L: [
					"╦░░",
					"║░░",
					"╩═╝"
				],
				M: [
					"╔╦╗",
					"║║║",
					"╩░╩"
				],
				N: [
					"╔╗╔",
					"║║║",
					"╝╚╝"
				],
				O: [
					"╔═╗",
					"║░║",
					"╚═╝"
				],
				P: [
					"╔═╗",
					"╠═╝",
					"╩░░"
				],
				Q: [
					"╔═╗░",
					"║═╬╗",
					"╚═╝╚"
				],
				R: [
					"╦═╗",
					"╠╦╝",
					"╩╚═"
				],
				S: [
					"╔═╗",
					"╚═╗",
					"╚═╝"
				],
				T: [
					"╔╦╗",
					"░║░",
					"░╩░"
				],
				U: [
					"╦░╦",
					"║░║",
					"╚═╝"
				],
				V: [
					"╦░░╦",
					"╚╗╔╝",
					"░╚╝░"
				],
				W: [
					"╦░╦",
					"║║║",
					"╚╩╝"
				],
				X: [
					"═╗░╦",
					"╔╩╦╝",
					"╩░╚═"
				],
				Y: [
					"╦░╦",
					"╚╦╝",
					"░╩░"
				],
				Z: [
					"╔═╗",
					"╔═╝",
					"╚═╝"
				],
				" ": [
					"░░",
					"░░",
					"░░"
				]
			};
			var message = arg.replace("à","a").replace("è","e").replace("é","e").replace("ì","i").replace("ò","o").replace("ù","u")
							 .replace("À","A").replace("È","E").replace("É","E").replace("Ì","I").replace("Ò","o").replace("Ù","U")
							 .replace(/[^a-zA-Z /]/g,"");
			if (message.length > 12) return this.say(con, room, "Testo troppo lungo");
			var text0 = "";
			var text1 = "";
			var text2 = "";
			if (message != "") {
				message = message.split('')
				for (var i in message) {
					if (letters[message[i]]) {
						if (i > 0) {
							text0 += "░";
							text1 += "░";
							text2 += "░";
						}
						text0 += letters[message[i]][0];
						text1 += letters[message[i]][1];
						text2 += letters[message[i]][2];
					}
				}
			}
			else {
				text0 = "╔═╗░╗░╔░╦░╔╦╗░╔═╗░╔═╗░╔═╗░╔╦╗";
				text1 = "╚═╗░╠═╣░║░░║░░╠═╝░║░║░╚═╗░░║░";
				text2 = "╚═╝░╝░╚░╩░░╩░░╝░░░╚═╝░╚═╝░░╩░";
			}
			
			this.say(con, room, text0);
			this.say(con, room, text1);
			return this.say(con, room, text2);
		}
	},
	
	anagram: function(arg, by, room, con) {
		if (this.canUse('spam', room, by) || room.charAt(0) === ',') {
			arg = ' ' + shuffle(arg.split("")).join("");
			return this.say(con, room, arg);
		}
	},
	
	
	acher: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "lo acher che bontà ♫");
		}
	},
	conse: 'consecutio',
	cinse: 'consecutio',
	cobse: 'consecutio',
	consecutio: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = "opss" + ["", "s", "ss", "sss"][Math.floor(Math.random() * 4)];
			return this.say(con, room, text + " ho lasciato il pc acceso tutta notte");
		}
	},
	dandi: 'queldandi',
	queldandi: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "ma porca di quella");
		}
	},
	duck: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "quack");
		}
	},
	ed: 'edgummet',
	edgummet: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "soccontro");
		}
	},
	fran: 'fran17',
	'fran17': function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "ei ascolta questo pezzo è bella musica :)");
		}
	},
	haund: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "( ͡° ͜ʖ ͡°)");
		}
	},
	infli: 'inflikted',
	inflikted: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = "INFLIKTED".split("").sort(function(a, b) {
				return Math.random() - 0.5;
			}).join("");
			return this.say(con, room, "ciao " + text);
		}
	},
	lange: 'langee',
	langee: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "Haund mi traduci questo post?");
		}
	},
	milak: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "no Maria io esco");
		}
	},
	azyz: 'oizys',
	oizys: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "no");
		}
	},
	quas: 'quasar',
	quasar: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "basta con le pupazzate");
		}
	},
	silver: 'silver97',
	silver97: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			try {
				var formats = require('./formats.js').Formats;
			} catch (e) {
				return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
			}
			var tiers = [];
			for (var i in formats) {
				if (formats[i].challengeShow != false) tiers.push(formats[i].name);
			}
			return this.say(con, room, "qualcuno mi passa un team " + tiers[Math.floor(Math.random() * tiers.length)].toLowerCase().replace(/[^a-z0-9 /]/g,""));
		}
	},
	smilzo: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "mai na gioia");
		}
	},
	spec: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "vi muto tutti");
		}
	},
	cul1: 'swculone',
	kul1: 'swculone',
	swcul1: 'swculone',
	swkul1: 'swculone',
	culone: 'swculone',
	swculone: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "hue");
		}
	},
	tricking: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			try {
				var pokedex = require('./pokedex.js').BattlePokedex;
				var formatsdata = require('./formats-data.js').BattleFormatsData;
			} catch (e) {
				return this.say(con, room, 'Si è verificato un errore: riprova fra qualche secondo.');
			}
			var pokemonArray = [];
			for (var i in formatsdata) {
				if (formatsdata[i].isNonstandard !== true) {
					pokemonArray.push(pokedex[i].species);
				}
			}
			var pokemon = pokemonArray[Math.floor(Math.random() * pokemonArray.length)];
			var text = ["A critical hit!", "The opposing " + pokemon + " was frozen solid!", "The opposing " + pokemon + " is paralyzed! It can't move!"][Math.floor(Math.random() * 3)];
			return this.say(con, room, text);
		}
	},
	usy: 'uselesstrainer',
	uselesstrainer: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "kek");
		}
	},
	'3v': 'trev',
	vvv: 'trev',
	trev: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "gioco di merda");
		}
	},
	
	spagueti: function(arg, by, room, con) {
		if (room.charAt(0) !== ',') return false;
		by = toId(by);
		var ro = ['parnassius', 'test2017', 'thequasar'];
		var staff = ro.concat(
			'consecutio', 'edgummet', 'haund', 'safes', 'silver97', 'smilzo', 'trev', 'uselesstrainer',
			'abry', 'alexander', 'bionzella', 'galbia', 'l0ne', 'puralux', 'queldandi', 'slimmer', 'specn', 'tricking'
		);
		if (ro.indexOf(by) < 0) return;
		staff.splice(staff.indexOf(by), 1);
		
		var text = "Riunione su spagueti -> http://spagueti.psim.us/";
		if (arg.length > 300 - (text.length + 3)) return this.say(con, room, "Messaggio aggiuntivo troppo lungo");
		text += (arg.length ? "(" + arg + ")" : "");
		
		this.say(con, room, "Invio messaggi in corso...");
		var self = this;
		function spampm() {
			if (staff.length == 0) return self.say(con, room, "Messaggi consegnati");
			self.say(con, '', "/pm " + staff[0] + ", " + text);
			staff.shift();
			setTimeout(spampm, 750);
		}
		spampm();
	},
};
