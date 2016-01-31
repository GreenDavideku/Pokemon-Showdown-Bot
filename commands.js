/**
 * This is the file where the bot commands are located
 *
 * @license MIT license
 */

var http = require('http');
var sys = require('sys');

exports.commands = {
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
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		} else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		
		var uptime = Math.floor((Date.now() - update));
		var uptimeDays = Math.floor(uptime / (24 * 60 * 60 * 1000));
		uptime -= uptimeDays * (24 * 60 * 60 * 1000);
		var uptimeHours = Math.floor(uptime / (60 * 60 * 1000));
		uptime -= uptimeHours * (60 * 60 * 1000);
		var uptimeMinutes = Math.floor(uptime / (60 * 1000));
		uptime -= uptimeMinutes * (60 * 1000);
		var uptimeSeconds = Math.floor(uptime / (1000));
		var uptimeMilliseconds = uptime - uptimeSeconds * (1000);
		
		var uptimeText = "Uptime: ";
		if (uptimeDays > 0) uptimeText += uptimeDays + " " + (uptimeDays === 1 ? "day" : "days") + ", ";
		if (uptimeDays > 0 || uptimeHours > 0) uptimeText += uptimeHours + " " + (uptimeHours === 1 ? "hour" : "hours") + ", ";
		if (uptimeDays > 0 || uptimeHours > 0 || uptimeMinutes > 0) uptimeText += uptimeMinutes + " " + (uptimeMinutes === 1 ? "minute" : "minutes") + ", ";
		uptimeText += uptimeSeconds + " " + (uptimeSeconds === 1 ? "second" : "seconds") + ", ";
		uptimeText += uptimeMilliseconds + " " + (uptimeMilliseconds === 1 ? "millisecond" : "milliseconds");
		
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
			spam: 1,
			spamadmin: 1
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
	
	broadcast: function(arg, by, room, con) {
		return;
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
	
	sprite: function(arg, by, room, con) {
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
		arg = arg.toLowerCase().replace(/[^a-z0-9-,]/g,"").split(",");
		var gens = {
			'1': 'rby', '1gen': 'rby', 'gen1': 'rby', 'rby': 'rby',
			'2': 'gsc', '2gen': 'gsc', 'gen2': 'gsc', 'gsc': 'gsc',
			'3': 'rse', '3gen': 'rse', 'gen3': 'rse', 'rse': 'rse', 'adv': 'rse',
			'4': 'dpp', '4gen': 'dpp', 'gen4': 'dpp', 'dpp': 'dpp',
			'5': 'bw', '5gen': 'bw', 'gen5': 'bw', 'bw': 'bw', 'bw2': 'bw', 'b2w2': 'bw',
			'6': 'xy', '6gen': 'xy', 'gen6': 'xy', 'xy': 'xy', 'oras': 'xy'
		}
		var gen = 'xy';
		var ani = false;
		var back = false;
		var shiny = false;
		var pokemon = '';
		for (var i in arg) {
			if (gens[arg[i]]) gen = gens[arg[i]];
			else if (arg[i] == 'back') back = true;
			else if (arg[i] == 'shiny') shiny = true;
			else {
				if (aliases[toId(arg[i])]) arg[i] = aliases[arg[i]].toLowerCase().replace(/[^a-z0-9-]/g,"");
				if (pokedex[toId(arg[i])]) pokemon = arg[i].toLowerCase().replace(/[^a-z0-9-]/g,"");
			}
		}
		if (!pokemon) return this.say(con, room, "Pokemon non trovato");
		if (aliases[pokemon]) pokemon = toId(aliases[pokemon]);
		if (pokedex[pokemon]) {
			if (pokedex[pokemon].num < 0 || (pokedex[pokemon].num > 151 && gen === 'rby') || (pokedex[pokemon].num > 251 && gen === 'gsc')
				|| (pokedex[pokemon].num > 386 && gen === 'rse') || (pokedex[pokemon].num > 493 && gen === 'dpp')
				|| (pokedex[pokemon].num > 649 && gen === 'bw')) return this.say(con, room, "Pokémon non trovato");
		}
		
		if (['bw', 'xy'].indexOf(gen) > -1) {
			gen += 'ani';
			ani = true;
		}
		text = "https://psim.us/sprites/";
		text += gen;
		if (back) text += "-back";
		if (shiny) {
			if (gen === 'rby') return this.say(con, room, "In RBY non esistevano i Pokémon shiny");
			text += "-shiny";
		}
		text += "/";
		text += pokemon;
		if (ani) text += ".gif";
		else text += ".png";
		return this.say(con, room, text);
	},
	
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
				if (trad[i][j].en.toLowerCase().replace(/[^a-z0-9àèéìòù]/g,"") == parola) results.push({"trad": trad[i][j].it, "cat": i});
				else if (aliasParola && trad[i][j].en.toLowerCase().replace(/[^a-z0-9àèéìòù]/g,"") == aliasParola) results.push({"trad": trad[i][j].it, "cat": i});
				else if (trad[i][j].it.toLowerCase().replace(/[^a-z0-9àèéìòù]/g,"") == parola) results.push({"trad": trad[i][j].en, "cat": i});
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
	stat: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			var text = '/pm ' + by + ', ';
		}
		return this.say(con, room, text + '.stat è stato rimosso; ora puoi usare /statcalc __statistica pokemon__, __modificatori__ (ad esempio /statcalc speed diggersby, 252+)');
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
	
	sampleteams: 'teams',
	teams: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			var text = '';
		}
		else {
			return this.say(con, room, '/pm ' + by + ', Scrivimi il comando in PM.');
		}
		arg = toId(arg);
		switch (arg) {
			case "overused":
			case "ou":
				text += 'http://www.smogon.com/forums/threads/3551209/';
				break;
			case "uber":
			case "ubers":
				text += 'http://www.smogon.com/forums/threads/3550998/';
				break;
			case "underused":
			case "uu":
				text += 'http://www.smogon.com/forums/threads/3536731/';
				break;
			case "rarelyused":
			case "ru":
				text += 'http://www.smogon.com/forums/threads/3551316/';
				break;
			case "neverused":
			case "nu":
				text += 'http://www.smogon.com/forums/threads/3548150/';
				break;
			case "pu":
				text += 'http://www.smogon.com/forums/threads/3540949/';
				break;
			case "littlecup":
			case "lc":
				text += 'http://www.smogon.com/forums/threads/3554452/';
				break;
			case "anythinggoes":
			case "ag":
				text += 'http://sampleom.weebly.com/anything-goes.html';
				break;
			case "doublesou":
			case "doubles":
			case "dou":
				text += 'http://www.smogon.com/forums/threads/3548802/';
				break;
			case "vgc2016":
			case "vgc16":
			case "vgc":
				text += 'http://www.smogon.com/forums/threads/3561279/';
				break;
			case "oumonotype":
			case "monotype":
			case "mono":
				text += 'http://monotypeps.weebly.com/sample-teams.html';
				break;
			default:
				text += 'Inserisci una tier (OU, Ubers, UU, RU, NU, PU, LC, Anything Goes, Doubles OU, VGC, OU Monotype)';
		}
		return this.say(con, room, text);
	},
	
	stats: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "http://www.smogon.com/stats/2015-12/");
		}
	},
	
	faq: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "https://showdownitalia.wordpress.com/help/");
		}
	},
	
	renames: 'showrenames',
	showrenames: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "https://parnassius.makes.org/thimble/NDg3MzI2MjA4/ps-showrenames_");
		}
	},
	youtubelinktitle: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "https://greasyfork.org/en/scripts/413-youtube-link-title");
		}
	},
	icons: 'userlisticons',
	iconsuserlist: 'userlisticons',
	userlisticons: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "http://www.smogon.com/forums/threads/userlist-icons-stylish.3551505/");
		}
	},
	breakmyteam: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "https://dl.dropbox.com/u/9207945/rmt.html");
		}
	},
	checks: function(arg, by, room, con) {
		if (this.canUse('broadcast', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "https://dl.dropbox.com/u/9207945/CompGen/Output/Compendiums_html/OU_Checks_All.html");
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
	
	/**
	 * Spam commands
	 *
	 * Add custom commands here
	 */
	
	spam: function(arg, by, room, con) {
		return;
	},
	spamadmin: function(arg, by, room, con) {
		return;
	},
	
	mims: 'memes',
	meme: 'memes',
	memes: function(arg, by, room, con) {
		if (this.canUse('spam', room, by) || room.charAt(0) === ',') {
			var memes = [
				"⊂(▀¯▀⊂)","ᕙ(˵ ಠ ਊ ಠ ˵)ᕗ","(✿ ◕‿◕) ᓄ✂╰U╯","∩༼˵☯‿☯˵༽つ¤=[]:::::>","ლ(~•̀︿•́~)つ︻̷┻̿═━一","( ͡↑ ͜ʖ ͡↑)","ᕙ༼=ݓ益ݓ=༽ᕗ","ᕙ(░ಥ╭͜ʖ╮ಥ░)━☆ﾟ.*･｡ﾟ","┌༼◉ل͟◉༽┐","╰། ◉ ◯ ◉ །╯","ԅ( ͒ ۝ ͒ )ᕤ","╰( ⁰ ਊ ⁰ )━☆ﾟ.*･｡ﾟ","ᕕ( ՞ ᗜ ՞ )ᕗ","ᕙ[･۝･]ᕗ","ᕙ〳 ರ ︿ ರೃ 〵ᕗ","o͡͡͡╮༼ • ʖ̯ • ༽╭o͡͡͡","(◕⌂◕⊃⊃)","໒( , ⊙ – ⊙ , )७","☆*:. o(≧▽≦)o .:*☆","(ノ͡° ͜ʖ ͡°)ノ︵┻┻","┻┻︵⁞=༎ຶ﹏༎ຶ=⁞︵┻┻","ʕ ᓀ ᴥ ᓂ ʔ","ᕙᓄ(☉ਊ☉)ᓄᕗ","ᕦ⁞ ✿ ᵒ̌ ᴥ ᵒ̌ ✿ ⁞ᕤ","ᕙʕ ಥ ▃ ಥ ʔᕗ","٩ʕ◕౪◕ʔو","(V●ᴥ●V)","║ ಡ ͜ ʖ ಡ ║","ᕦ( ̿ ﹏ ̿ )ᕤ","╚═། ◑ ▃ ◑ །═╝",
				"┌༼ – _ – ༽┐","ᕦ༼ ✖ ਊ ✖ ༽ᕤ","ԅ། ຈ ◞౪◟ຈ །و","¯\\_| ಠ ∧ ಠ |_/¯","╏ ” ⊚ ͟ʖ ⊚ ” ╏","୧[ * ಡ ▽ ಡ * ]୨","ᕙ[  ͒ ﹏ ͒  ]ᕗ","⋋| ◉ ͟ʖ ◉ |⋌","( ರ Ĺ̯ ರೃ )","(⁰ ◕〜◕ ⁰)","(∩╹□╹∩)","ᕙ╏✖۝✖╏⊃-(===>","╰[ ⁰﹏⁰ ]╯","(つ°ヮ°)つ  └⋃┘","ლ(ಥ Д ಥ )ლ","ᕕ༼ ͠ຈ Ĺ̯ ͠ຈ ༽┌∩┐","⋌༼ •̀ ⌂ •́ ༽⋋","s( ^ ‿ ^)-b","s( ^ ‸ ^)-p","└༼ ಥ ᗜ ಥ ༽┘","୧( ಠ Д ಠ )୨","┌( ◕ 益 ◕ )ᓄ","@( ◕ x ◕ )@","ᕙ( ~ . ~ )ᕗ","┌( •́ ਊ •̀ )┐","ヽ〳 ՞ ᗜ ՞ 〵ง","໒( ͡ᵔ ▾ ͡ᵔ )७","┌[ ◔ ͜ ʖ ◔ ]┐","ᕦ╏ ʘ̆ ‸ ʘ̆ ╏ᕤ","໒( • ͜ʖ • )७",
				"ᕦ| ๑ ʖ ๑ |ᕤ","〳 ◔ Ĺ̯ ◔ 〵","〳 •́ ﹏ •̀ 〵","¯\\_╏ ՞ ︿ ՞ ╏_/¯","╚═| ~ ಠ ₒ ಠ ~ |═╝","乁| ･ 〰 ･ |ㄏ","/╲/\\╭[ ☯ _ ☯ ]╮/\\╱﻿\\","o͡͡͡╮༼ ʘ̆ ۝ ʘ̆ ༽╭o͡͡͡","ԅ། – ‸ – །ᕗ","┬┴┬┴┤ᕦ( ▀̿ Ĺ̯ ▀̿├┬┴┬","୧( ಠ┏ل͜┓ಠ )୨","┌། ☯ _ʖ ☯ །┐","ᕦ༼◣_◢༽つ","ᕙ(◉෴◉)ᕗ","( ͡° ͜ʖ ͡°)=ε✄","ლ( ◕ 益 ◕ ) ლ","(╭ರ_⊙)","(╭ರᴥ•́)",">:::::::::::[=¤ԅ╏ ˵ ⊚ ◡ ⊚ ˵ ╏┐","c( ⁰ 〰 ⁰ )੭","ᕙʕಠᴥಠʔᕗ","ᕙ(˵ි۝ි˵)ᕗ","/╲/\\╭(.☉ʖ̫☉.)╮/\\╱﻿\\","┌(˵༎ຶ  ل͟  ༎ຶ˵)┐","ლ ( ◕  ᗜ  ◕ ) ლ","/╲/\\╭〳 □ ʖ̫ □ 〵╮/\\╱﻿\\","ʕ ・ Д ・ ʔ","(   ͡°╭╮ʖ   ͡°)","╰໒( ි ▾ ි )७╯","╚═[ ˵✖‿✖˵ ]═╝",
				"ԅ(☉Д☉)╮","╰(ಥдಥ)ノ","ᕕ( ཀ ʖ̯ ཀ)ᕗ","(つ•̀ᴥ•́)つ*:･ﾟ✧","ʕ⊙ᴥ⊙ʔ","╭∩╮༼☯۝☯༽╭∩╮","(⊙ᗜ⊙)","(⊃･ᴥ･)つ","༼つ ◕_◕ ༽つ","ᕙ⁞ = 〰 = ⁞ᕗ","╰༼ ⋋ ‸ ⋌ ༽╯","･｡ﾟ[̲̅$̲̅(̲̅ ͡° ͜ʖ ͡°̲̅)̲̅$̲̅]｡ﾟ.*","¯\\_༽ ಥ Д ಥ ༼_/¯","╰(◕ᗜ◕)╯","░ ∗ ◕ ں ◕ ∗ ░","ლ(ʘ̆〰ʘ̆)ლ","╭∩╮(ಠ۝ಠ)╭∩╮","✿*∗˵╰༼✪ᗜ✪༽╯˵∗*✿","(=ಠ ل͟ ಠ=)","凸( •̀_•́ )凸","(^ ◕ᴥ◕ ^)","( ✖ _ ✖ )","(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧","╚═▐ ۞ ~ ۞ ▐═╝","ʕ༼◕  ౪  ◕✿༽ʔ","(⊹つ•۝•⊹)つ","༼▃ Ĺ̯ ▃༽","໒( ◑ w ◑ )७","ԅ༼ * ◕ ∧ ◕ * ༽ﾉ","┌། ≖ Ĺ̯ ≖ །┐",
				"╰[✿•̀o•́✿]╯","┬─┬ノ( ◕◡◕ ノ)","ᕕ(◉Д◉ )ᕗ","(✿ ◕ᗜ◕)━♫.*･｡ﾟ","¯\\_(౦▾౦ ✿)¯\\_","╰(˵ヘωヘ✿)╯","⋌[∗✖ ω ✖∗]⋋","ᕕ(⌐■_■)ᕗ ♪♬","( ຈ ﹏ ຈ )","(つ☯ᗜ☯)つ","〳 ◉ ͜ʖ ◉ 〵","/╲/\\╭༼ಥДಥ༽╮/\\╱﻿\\","/╲/\\╭(˵◕╭ ͟ʖ╮◕˵)╮/\\╱﻿\\","╰༼ •̀۝•́ ༽╯","(ᕗ ͠°  ਊ ͠° )ᕗ","╰( ◕ ᗜ ◕ )╯","༼( ͡⊙  ਊ  ͡⊙)༽","o͡͡͡╮། ❛ั ╭ ͟ʖ╮ ❛ั །╭o͡͡͡","ᕙ༼ಠ͜ʖಠ༽ノ","(-_-｡)","┌( ◐ o ◐ )┐","╚═░ ・ ﹏ ・ ░═╝","/╲/\\╭⁞ ∗ ＾ ౪ ＾ ∗ ⁞╮/\\╱﻿\\","ᕦ( ヘ (oo) ヘ )ᕤ","໒( ݓ Ĺ̯ ݓ )७","໒( ∗ ⊘ ﹏ ⊘ ∗ )७","/╲/\\╭༼ ຈ – ຈ ༽╮/\\╱﻿\\","╏ •́ – •̀ ╏","໒( ಥ Ĺ̯ ಥ )७","ԅ༼ . º ʖ̯ º . ༽ง",
				"ᕕ{  ͒ ʖ̯  ͒  }ᕗ","໒( •̀ ╭ ͟ʖ╮ •́ )७","乁། ˵ ◕ – ◕ ˵ །ㄏ","乁ʕ •̀ ۝ •́ ʔㄏ","/╲/\\╭| • □ • |╮/\\╱﻿\\","┌∩┐(ಠ͜ʖಠ)┌∩┐","(っ-̶●̃益●̶̃)っ","(∩◕(oo)◕∩ )","( ´_ゝ`)","ᕕ(˵•̀෴•́˵)ᕗ","╰{ ˵◕_◕˵ }╯","╰(✿˙ᗜ˙)੭━☆ﾟ.*･｡ﾟ","┏(-_-)┓┏(-_-)┛┗(-_-﻿ )┓","ଘ(੭*ˊᵕˋ)੭","d–(^ ‿ ^ )z","ლ༼ ▀̿ Ĺ̯ ▀̿ ლ༽","༼ﾉ۞⌂۞༽ﾉ","(つ°ヮ°)つ","━╤デ╦︻(▀̿̿Ĺ̯̿̿▀̿ ̿)","╰(”◕﹏◕”)つ","┌〳 ˵ •́ o •̀ ˵ 〵┐","╰( . •́ ͜ʖ •̀ . )╯","~~~~~~~[]=¤ԅ(ˊᗜˋ* )੭","[ ᕤ ಠ (oo) ಠ ]ᕤ ︵┻━┻","༽つ۞﹏۞༼つ ─=≡ΣO))","ლ( ¤ 益 ¤ )┐","੧༼ ◕ ∧ ◕ ༽┌∩┐","⋋║ . ⊗ o ⊗ . ║⋌","ԅ╏ ᴼ ︿ ᴼ ╏੭","c╏ ಡ д ಡ ╏୨",
				"ʕ – (oo) – ʔ","ヽ║ ˘ _ ˘ ║ノ","੧║ ⊙ ౪ ⊙ ║ᓄ","ლ༼ ❛ Ĺ̯ ❛ ༽ᕤ","໒( ❛ั Ĺ̯ ❛ั )७","/╲/\\╭༼ : ❛ ◡ ❛ : ༽╮/\\╱﻿\\","o͡͡͡╮[ ⊡ 〜 ⊡ ]╭o͡͡͡","┌[ ಠ ▃ ಠ ]┐","ᕦ( ᴼ ڡ ᴼ )ᕤ","/╲/\\╭༼ * ಠ 益 ಠ * ༽╮/\\╱﻿\\","୧( ͡ᵔ 益 ͡ᵔ )୨","ᕦʕ ՞ ౪ ՞ ʔᕤ","ᕦ╏ ¬ ʖ̯ ¬ ╏ᕤ","乁໒( ͡◕ ᴥ ◕͡ )७ㄏ","[ ⇀ ‿ ↼ ]","ᕕ| ~ ⁰ ෴ ⁰ ~ |┐","໒( •́ ‸ •̀ )७","o͡͡͡╮໒( •̀ ‿ •́ )७╭o͡͡͡","| ◯ ‸ ◯ |","ᕙ▐ ° ◯ ° ▐ᕗ","ԅ༼ : ◕ ۝ ◕ : ༽╯","⁞ ✿ •̀ ヮ •́ ✿ ⁞","໒( * ͒ ʖ̫ ͒ * )७","ԅ༼ * ✖ ۝ ✖ * ༽୨","ᕦ( ⊙ ∧ ⊙ )ᕤ","ᕕ〳 ཀ 益 ཀ 〵ง","| ” ☯ ︿ ☯ ” |","¯\\_| ✖ 〜 ✖ |_/¯","┌༼ ˘ 益 ˘ ༽┐","⋋། ⊙ _̀ ⊙ །⋌",
				"¯\\_▐ ☯ ︿ ☯ ▐_/¯","ᕙ( ຈ ▃ ຈ )ᕗ","ᕦ| º ෴ º |ᕤ","o͡͡͡╮╏ ◕ ◡ ◕ ╏╭o͡͡͡","໒( ” ͒ Ĺ̯ ͒ ” )७","┌( ՞ ڡ ՞ )┐","ᕕ║ ⊘ ౪ ⊘ ║ㄏ","┌[ ヘ ‸ ヘ ]┐","( ◑ ᗜ ◑ )","╰༼ ❛ ʖ̫ ❛ ༽╯","༼ •̀ ₒ •́ ༽","╰། ͒ ▃ ͒ །╯","། □ ෴ □ །","ᕦ໒( ՞ ◡ ՞ )७ᕤ","(つ◉益◉)つ","(> ^_^ )>","O–(’̀-’̀Q )","(}༼⊙-◞౪◟-⊙༽{)","┌∩┐╭˵ಥ o ಥ˵╮┌∩┐","༼つಠ益ಠ༽つ ─=≡ΣO))","/╲/\\〳 ᴼ ౪ ᴼ 〵/\\╱﻿\\","( * ಥ ⌂ ಥ * )","ԅ▒ ˘ ▾ ˘ ▒┘","〳 ‾́ ﹏ ‾́ 〵","୧[ ☯ ౪ ☯ ]୨","╰〳 ՞ Ĺ̯ ՞ 〵ノ⌒.","o͡͡͡╮⁞ ^ ▃ ^ ⁞╭o͡͡͡","། ⊙ 益 ⊙ །","୧╏ ՞ _ ՞ ╏୨","༼ ° ▽ ° ༽",
				"/╲/\\╭༼ ◔ □ ◔ ༽╮/\\╱﻿\\","╰| ՞ Ĺ̯ ՞ |╯","ʕ ◕ ▃ ◕ ʔ","/╲/\\╭║ ◉ ◡ ◉ ║╮/\\╱﻿\\","/╲/\\╭[ : ☯ ₒ ☯ : ]╮/\\╱﻿\\","┌( ˵ ⊘ ‿ ⊘ ˵ )ᕤ","୧( ⊚ ╭͜ʖ╮ ⊚ )୨","੧║ : ︣ ヮ ︣ : ║ㄏ","⋋▐ ” ⊙ ~ ⊙ ” ▐⋌","| (• ◡ •) |","ᕙ(⇀∏↼)ᕗ","ʕ◉ᴥ◉ʔ","└▐ ◐ ◯ ◐ ▐┘","☜(ﾟヮﾟ☜)","(◕ᴥ◕)","(つ˵•́ω•̀˵)つ━☆ﾟ.*･｡ﾟ҉̛༽̨҉҉ﾉ","ᕕ( ⁰ ▽ ⁰ )ᕗ","(:ㄏ■ Д ■ :)ㄏ","╰໒(◉ᴥ◉)७╯","( ´ ∀ ` )","┗(＾0＾)┓","໒( ͡ᵔ ͜ʖ ͡ᵔ )७","୧| ⁰ ᴥ ⁰ |୨","། ﹒︣ ‸ ﹒︣ །","┌▐ ☯ ۝ ☯ ▐┐","└( ՞ ~ ՞ )┘","〳 ＾ ▽ ＾ 〵","ԅ║ ⁰ ۝ ⁰ ║┐","⋋╏ ۞ ڡ ۞ ╏⋌","┌〳 ۞ ﹏ ۞ 〵┐",
				"乁( ⁰͡  Ĺ̯ ⁰͡ ) ㄏ","ɖී؀ීϸ","[-c°▥°]-c","ᕙ༼⊘͜ʟ⊘༽ᕗ","༼:ಡʖ̯ಡ:༽","ᕕ(ಥʖ̯ಥ)ᕗ","┌∩┐(◕◡◉)┌∩┐","♪~ ᕕ( ᐛ )ᕗ","║ ⌐ ౪ ⌐ ║","╰(⊡-⊡)و✎⮹","╰(⊹◕۝◕ )╯","╭∩╮( ͡° ل͟ ͡° )╭∩╮","(ﾉಠдಠ)ﾉ︵┻━┻","(⊃✖  〰 ✖)⊃","། – _ – །","乁〳 ” ˘ ෴ ˘ ” 〵ㄏ","ᕕ[*•̀͜ʖ•́*]︻̷┻̿═━一","ᕕ┌◕ᗜ◕┐ᕗ","_|___|_  ╰(º o º╰)","╰〳 ಠ 益 ಠೃ 〵╯","╭∩╮(⋋‿⋌)ᕗ","ᕙ(˵◕ω◕˵✿)つ","/╲╏•̀•̀۝•́•́╏╱﻿\\","凸〳 ಥ ڡ ಥ 〵凸","(つಠ_ʖಠ)つ","ᕕ༼✿•̀︿•́༽ᕗ","╰[◔▽◔├┬┴┬┴","(ಥ_ʖಥ)","(つ◕౪◕)つ━☆ﾟ.*･｡ﾟ","୧༼ಠ益ಠ╭∩╮༽",
				"୧(● ՞o ՞●)୨","┌༼▀̿ Ĺ̯▀̿༽┐","(＾┌_̀┐＾)","♪O>( ･ ∀ ･ )っ┌iii┐","~~旦_(･o･;)","ʕ ಡ ﹏ ಡ ʔ⊃―{}@{}@{}-","ᕕ( ・‿・)つ-●-●","٩(◕‿◕｡)۶","╰[✖Ĺ̯ಠ]╯","༼✿◕ᗜ◕༽┌∩┐","༼ つ ˵ ╥ ͟ʖ ╥ ˵༽つ","─=≡Σ(((༼つಠ益ಠ༽つ","༼つ◔益◔༽つ","ლ(ಠ益ಠლ)","┻━┻ ヘ╰( •̀ε•́ ╰)","(つ ¯͒ ʖ̯  ¯͒ )つ","(• ε •)","/╲/\\╭(✖╭╮✖)╮/\\╱﻿\\","༼つºل͟ºς༽","╭∩╮໒(✪ਊ✪)७╭∩╮","(^┌_̀┐^)","୧(=ʘ͡ᗜʘ͡=)୨","¯\\_(⊙_ʖ⊙)_/¯","(つ･･)つ¤=[]:::::::>","ʕ༼✖∧✖༽ʔ","ლ[ಠ(oo)ಠ]ლ","ヽ༼ಢ_ಢ༽ﾉ☂","┻━┻ ︵﻿ ¯\\_༼ᴼل͜ᴼ༽_/¯ ︵ ┻━┻","~~~~~~~[]=¤ԅ( ◔益◔ )ᕗ",">====]-o¯\\_༼☯‿☯✿༽ﾉ",
				"໒(:ರωರ:)〜︻̷┻̿═━","(///_-)","(╯°Д°)╯︵c(.□ . c)","/( .□.) ︵╰(゜益゜)╯︵ /(.□. /)","ʕノ•ᴥ•ʔノ ︵ ┻━┻","(┛ಠДಠ)┛彡┻━┻","\\ ʕ◕‿◕ʔ /","(╭ರ_•́)","( ‘_>’)","╭∩╮ʕ ◉ ﹏ ◉ ʔ╭∩╮","༼; ಠ ਊ ಠ༽","༼ つ ಠ₍₍ළ₎₎ಠ༽つ","╰〳˵ ✖ Д ✖ ˵〵⊃━☆ﾟ.*･｡ﾟ","o͡͡͡╮( – ▾ – )╭o͡͡͡","ᕙ༼◕◞౪◟◕༽ᕗ","t( -_- t )","ᕦ( ͡° ͜ʖ ͡°)ᕤ","/╲/\\╭( ಠ □ ಠೃ )╮/\\╱﻿\\","┴┬┴┤( ͡° ͜ʖ├┬┴┬","╭(ʘ̆~◞౪◟~ʘ̆)╮","╰( ◕ ^ ◕ )╯","໒(◕ヮ◕)〜⊹","(つ▀¯▀)つ","ᕕ░ ◕ – ◕ ░ᕤ","໒( ∗ ⇀ 3 ↼ ∗ )७","ᕕ[ ・ ▾ ・ ]ᕗ","╏ ° ▃ ° ╏","੧〳 ˵ ಠ ᴥ ಠ ˵ 〵ノ⌒.","ᕕ| ͡■ ﹏ ■͡ |و","ᕦʕ ° o ° ʔᕤ",
				"໒( ͒ ౪ ͒ )७","乁〳 ❛ д ❛ 〵ㄏ","ԅ[ * ༎ຶ _ ༎ຶ * ]┐","/╲/\\╭⁞ ರ ͜ʖ ರೃ ⁞╮/\\╱﻿\\","ᕕ▒ ຈ ︿ ຈ ▒┌∩┐","ヽ། ﹒ ~ ﹒ །╮","ʕ ͡°̲ (oo) ͡°̲ ʔ","乁║ ˙ 益 ˙ ║ㄏ","o͡͡͡╮░ O ◡ O ░╭o͡͡͡","ᕦ༼ ˵ ◯ ਊ ◯ ˵ ༽ᕤ","໒( ° 〰 ° )७","⋋⁞ ◔ ﹏ ◔ ⁞⋌","ԅ⁞ ◑ ₒ ◑ ⁞ᓄ","╚═[ ☉ ڡ ☉ ]═╝","ᕦ໒( ᓀ ڡ ᓂ )७ᕤ","¯\\_༼ ಥ ‿ ಥ ༽_/¯","ᕙ| ᴼ ʖ̯ ᴼ |ᕗ","໒( ◔ ▽ ◔ )७","ヽ⁞ ~ ◉ – ◉ ~ ⁞و","໒( ิ Ĺ̯ ิ )७","ᕙ(◕ਊ◕)ᕗ","凸( •̀ 3 •́ )凸","┌( ಠ‿ಠ)┘","║ ” ◕ ◯ ◕ ” ║","┌░ : ◔ ਊ ◔ : ░┐","└໒( ♥ ◡ ♥ )७┘","ᕦʕ . ☯ ᴥ ☯ . ʔᕤ","ᕦ໒( ⊡ 益 ⊡ )७ᕤ","└༼ •́ ͜ʖ •̀ ༽┘","୧໒( ˵ ° ~ ° ˵ )७୨",
				"໒( ⇀ ‸ ↼ )७","୧། ☉ ౪ ☉ །୨","୧╏ ~ ᴥ ~ ╏୨","୧༼ ヘ ᗜ ヘ ༽୨","ᕦ〳 ◑ ‸ ◑ 〵ᕤ","╚═╏ ⇀ ͜ر ↼ ╏═╝","⋋〳 ￣ ᴥ ￣ 〵⋌","ᕙ໒( ˵ ಠ ╭͜ʖ╮ ಠೃ ˵ )७ᕗ","╰| ° ◞౪◟ ° |╯","/╲/\\╭〳 ര ʖ̯ ര 〵╮/\\╱﻿\\","༼ ◔ ͜ʖ ◔ ༽","/╲/\\╭⁞ ͡° ͜ʖ ͡° ⁞╮/\\╱﻿\\","੧( ◖ ω ◗ )ノ⌒.","╏ ◯ ᴥ ◯ ╏","╰໒( ” ¤ ‿ ¤ ” )७╯","⋋( * ᴼ ں ᴼ * )⋌","( ◕ ʖ̯ ◕ )","╏ . ^ Ĺ̯ ^ . ╏","╰༼ ∗ ಡ ▾ ಡ ∗ ༽╯","╰༼⇀︿⇀༽つ-]═──","┴┬┴┤･_･├┴┬┴","乁༼☯‿☯✿༽ㄏ","(☞ﾟヮﾟ)☞","ヽ༼ ʘ ∧ ʘ ༽ᓄ","ᕙ[ ˵ ͡’ ω ͡’ ˵ ]ᕗ","༼ ╥ ل ╥ ༽","[ : • 益 • : ]","└། – 〜 – །┘","〳 ͡° Ĺ̯ ͡° 〵","ლ║ ✿ ☉ ω ☉ ✿ ║ᓄ",
				"╚═໒( ” ◖ 〰 ◗ ” )७═╝","╰[ ° 益 ° ]╯","ლ༼ * ･ ⌂ ･ * ༽ᓄ","乁໒( ͒ ⌂ ͒ )७ㄏ","ᕕ[ ᓀ ڡ ᓂ ]ㄏ","╏ ˵ ✪ ﹏ ✪ ˵ ╏","⋋〳 ･ ਊ ･ 〵⋌","╚═〳 ͡ᵔ ▃ ͡ᵔ 〵═╝","⋋〳 ᵕ _ʖ ᵕ 〵⋌","▐ ” ⊗ ﹏ ⊗  ”▐","〳 : ⊘ ڡ ⊘ : 〵","ᕦ༼ – _ – ༽ᕤ","▐ ✪ _ ✪▐","໒( . ͡° ͟ʖ ͡° . )७┌∩┐","ᕙʕ ◖ ڡ ◗ ʔᕗ","༼∩•́ω•̀∩༽","༼ノ◕ヮ◕༽ノ︵┻━┻","(╯=▃=)╯︵┻━┻","ᕙﾉ•̀ʖ•́ﾉ୨","┏༼ ◉ ╭╮ ◉༽┓","ヽ༼ ☯‿☯༼ ಠ益ಠ༽◕ل͜◕༽つ","¯\\_༼ᴼل͜ᴼ༽_/¯","└(՞▃՞ └)","c〳 ° ▾ ° 〵つ","┌໒( : ⊘ ۝ ⊘ : )७┐","ᕕ༼ , •́ ω •̀ , ༽┐","▐ ∗ ᵒ̌ 〜 ᵒ̌ ∗ ▐","c〳 ݓ ﹏ ݓ 〵੭","୧〳 ＾ ౪ ＾ 〵୨","໒( ⊡ _ ⊡ )७",
				"( ▀ 益 ▀ )","ᕕ〳 ◕ ◞౪◟ ◕ 〵╭o͡͡͡","༼ ∗ ＾ ┏ل͜┓ ＾ ∗ ༽","ᕦ⁞ ∗ ❛ั ◯ ❛ั ∗ ⁞ᕤ","ᕕ( . ି ں ି . )ノ","ᕦ໒( ͡° ⌂ °͡ )७ᕤ","¯\\_( ͠° ͟ʖ °͠ )_/¯","┌〳 ･ o ･ 〵┐","୧༼ ” ✖ ‸ ✖ ” ༽୨","乁| ･ิ ∧ ･ิ |ㄏ","┌║ ･ิ 〜 ･ิ ║┐","ᕦ║ ⌣ ∧ ⌣ ║ᕤ","╏ : ◉ ∧ ◉ : ╏","¯\\_໒( ” ▀ ﹏ ▀ ” )७_/¯","ᕕ⁞ ᵒ̌ 〜 ᵒ̌ ⁞ᕗ","ԅ| . ͡° ڡ ͡° . |ᕤ","o͡͡͡╮໒( * ☯ ◞౪◟ ☯ * )७╭o͡͡͡","┌༼ ” ۞ – ۞ ” ༽┐","┌ʕ º ʖ̯ º ʔ┐","(╬ ಠ益ಠ)","༼∩ຈل͜ຈ༽つ━☆ﾟ.*･｡ﾟ","ᕦ໒( ᴼ 益 ᴼ )७ᕤ","༼    ಠ   ͟ʖ  ಠ   ༽","└། ๑ _ ๑ །┘","ᕕ〳 ் (oo) ் 〵╯",". * ･ ｡ﾟ☆━੧༼ •́ ヮ •̀ ༽୨","༼∩ •́ ヮ •̀ ༽⊃━☆ﾟ. * ･ ｡ﾟ","┏། ﹒ _ ﹒ །┓","ノ║ ಠ ਊ ಠೃ ノ║","ᕙ( ͡° ͜ʖ ͡°)ᕗ",
				"(つ ͡° ͜ʖ ͡°)つ","⁞ つ: •̀ ⌂ •́ : ⁞-︻╦̵̵͇̿̿̿̿══╤─","╾━╤デ╦︻ԅ། ･ิ _ʖ ･ิ །ง","(⊃ • ʖ̫ • )⊃","୧〳 ” ʘ̆ ᗜ ʘ̆ ” 〵୨","/╲/\\╭( •̀ ᗜ •́ )╮/\\╱﻿\\","୧| ✖ ﹏ ✖ |୨","໒( ˵ ° ۝ ° ˵ )७","| ~ ￣ (oo) ￣ ~ |","ʕ ☉ (oo) ☉ ʔ","┌║ ຈ ε ຈ ║┐","ᕕ[ ˵ ☯ ڡ ☯ ˵ ]┐","└╏ ･ ᗜ ･ ╏┐","₍₍ ᕕ༼.◕ヮ◕.༽ᕗ⁾⁾","₍₍ ᕕ( * ⊙ ヮ ⊙ * )ᕗ⁾⁾","(⊃｡•́‿•̀｡)⊃━☆ﾟ.*･｡ﾟ","੧| ✿ ◔ ں ◔ ✿ |ᓄ¤=[]:::::::::::–","੧| ⊗ ▾ ⊗ |⊃¤=(————-","~~~~~~~[]=¤ԅ໒( ☯ ᗜ ☯ )७ᕗ","╰༼.◕ヮ◕.༽つ¤=[]————","c:::::::::::::[]=¤ԅ╏ ˵ ⊚ ◡ ⊚ ˵ ╏┐","———–[]=¤ԅ༼ ･ 〜 ･ ༽╯","ᕦ[ •́ ﹏ •̀ ]⊃¤=[]::::::::>","໒( ﹒ ͜ر ﹒ )७","໒( ᓀ ‸ ᓂ )७","⋋╏ ❛ ◡ ❛ ╏⋌","┌༼ ⊘ _ ⊘ ༽┐","໒( ◔ ω ◔ )७","└( ͡° ︿ °͡ )┘","へ║ ☉ д ☉ ║ᕗ",
				"୧| ͡ᵔ ﹏ ͡ᵔ |୨","ԅ༼ ･ 〜 ･ ༽╯","໒( * ⊙ ヮ ⊙ * )७","/╲/\\╭[ ⊙ 〜 ⊙ ]╮/\\╱﻿\\","╏ ˵ ・ ͟ʖ ・ ˵ ╏","༼ : ౦ ‸ ౦ : ༽","║ * ರ Ĺ̯ ರ * ║","( : – ◞౪◟ – : )","ᕕ[ º Ĺ̯ º ]ᕤ","└໒( ” x ͟ʖ x ” )७┘","ᕦ⁞ * ヘ ﹏ ヘ * ⁞ᕤ","(ノ°▽°)ノ︵┻━┻","ʕ ᵒ̌ ‸ ᵒ̌ ʔ","ヽ༼ಢ_ಢ༽ﾉ","ᕙ༼*◕_◕*༽ᕤ","৵( °͜  °৵)","ᕙ໒(˵￣ᴥ￣˵)७ᕗ","(⊹◕ʖ̯◕)","[ﾉಠೃಠ]︻̷┻̿═━一","┐(・。・┐) ♪","ᕦ༼ ºººل͟ºº├┬┴┬┴","༼凸 ◉_◔༽凸","†ヽ[ಠĹ̯ಠ]ノ","/╲/\\╭[ ୖ _ʖ ୖ ]╮/\\╱﻿\\","੧| ✿ ◔ ں ◔ ✿ |ᓄ","⊂(ο･㉨･ο)⊃","( ʘ̆ ╭͜ʖ╮ ʘ̆ )","༼.◕ヮ◕.༽つ","ᕙ༼ ◉_◔༽ᕗ","╰༼=ಠਊಠ=༽╯",
				"༼ง=ಠ益ಠ=༽ง","ᕕ( ◔3◔)ᕗ","乁[ᓀ˵▾˵ᓂ]ㄏ","ᗜಠ o ಠ)¤=[]:::::>","╰(•̀ 3 •́)━☆ﾟ.*･｡ﾟ","╭(◕◕ ◉෴◉ ◕◕)╮","o͡͡͡╮〳 ~ ☉ ₒ ☉ ~ 〵╭o͡͡͡","୧ʕ•̀ᴥ•́ʔ୨","╭∩╮（︶︿︶）╭∩╮","ヽ༼ ◉  ͜  ◉༽ﾉ","(╯ಠ‿ಠ)╯︵┻━┻","┏༼ •́ ╭╮ •̀ ༽┓","༼⌐■ل͟■༽","─=≡Σ((( つ ◕o◕ )つ","╚▒ᓀ▃ᓂ▒╝","(✿ ◕‿◕) ᓄ✂╰⋃╯","ヽ༼ຈل͜ຈ༽⊃─☆*:・ﾟ","〳 = ◑ ‸ ◑ = 〵","┌(▀Ĺ̯▀)┐","┌╏✖_✖╏┘","༼ ºل͟º༼ ºل͟º ༽ºل͟º ༽ºل͟º ༽","༼ ºل͟º༼ ºل͟º(  ͡°  ͜ʖ  ͡°)ºل͟º ༽ºل͟º ༽","¯\\_(ツ)_/¯","( ＾◡＾)っ (‿|‿)","へ། ¯͒ ʖ̯ ¯͒ །ᕤ","ᕕ༼ ՞ ͜ʖ ՞ ༽凸","໒( , ್ ∧ ್ , )७","┌╏ •́ – •̀ ╏┐","ᕦ[ . ◕ ͜ ʖ ◕ . ]ᕤ","ԅ[ ﹒︣ ͜ʟ ﹒︣ ]ﾉ",
				"੧༼ ◕ – ◕ ༽┐","/╲/\\╭[ ⌣ ︿ ⌣ ]╮/\\╱﻿\\","╚═། ” ಡ Д ಡ ” །═╝","( ˘ ▃ ˘ )","໒( ͡; 益 ͡; )७┌∩┐","⋋║ ՞ ▽ ՞ ║⋌","٩║ ✿ ᴼ ل ᴼ ✿ ║┌∩┐","└། . ⊙ ◞౪◟ ⊙ . །┘","┌[ O ʖ̯ O ]┐","໒( ⊚ (oo) ⊚ )७","ԅ༼ ʘ̆ Ĺ̯ ʘ̆ ༽┌∩┐","ᕕ⁞ ್ ۝ ್ ⁞┘","ʕ ಡ ﹏ ಡ ʔ","ᕙ░ ʘ̆ ᗜ ʘ̆ ░ᕗ","ᕦ░ . ‾́ ◯ ‾́ . ░ᕤ","╰╏ ･ ᗜ ･ ╏╯","▐ ᓀ (oo) ᓂ ▐","ᕕ໒( * ◕ ڡ ◕ * )७╭∩╮","໒( : ⊗ Ĺ̯ ⊗ : )७","╰໒( = ◕ ◯ ◕ = )७╯","୧〳 ” • ڡ • ” 〵୨","┌╏ º □ º ╏┐","੧| ⊗ ▾ ⊗ |୨","໒( ☉ ͜ʖ ☉ )७","໒( : ͡☉ 〰 ͡☉ : )७","໒( ಠ ڡ ಠ )७╭∩╮","o͡͡͡╮། * ◔ ʖ̫ ◔ * །╭o͡͡͡","ᕦ[ ˵ ຈ ︿ ຈ ˵ ]ᕤ","╰༼ ･ิ ﹏ ･ิ ༽╯","⋋( ◕ ∧ ◕ )⋌",
				"⋋╏ , ͡° ╭ ͟ʖ╮ ͡° , ╏⋌","| . ☉ ~ ☉ . |","╰╏ ◉ 〜 ◉ ╏╯","ᕙ໒( ∗ σ Ĺ̯ σ ∗ )७ᕗ","། ~ ◕ (oo) ◕ ~ །","ԅ[ ˵ ☯ ڡ ☯ ˵ ]凸","ᕦ༼ •́ – •̀ ༽ᕤ","o͡͡͡╮⁞ ˵ ᓀ ︿ ᓂ ˵ ⁞╭o͡͡͡","༽つ۞﹏۞༼つ","ԅ[ •́ ﹏├┬┴┬┴","ʕ ⊃･ ◡ ･ ʔ⊃︵┻━┻","ᕕ╏ ͡ᵔ ‸ ͡ᵔ ╏و︻̷┻̿═━一","└⁞ ۞ Ĺ̯ ۞ ⁞┘","╚═། . ◯ o ◯ . །═╝","ᕙʕ ◐ ﹏ ◐ ʔᕗ","| ˵ ･ (oo) ･ ˵ |","ԅ། ･ิ _ʖ ･ิ །ง","┌༼ σ ‸ σ ༽┐","( ⊙ ʖ̯ ⊙ )","⋋╏ ᓀ 〜 ᓂ ╏⋌","໒( ” ͠° ʖ̫ °͠ ” )७","ԅ║ ಠ ਊ ಠೃ ║୨","ᕕ໒( • ʖ̫ • )७╮","[ ” ಠ ‸ ಠ ” ]","╏ ◔ _̀ ◔ ╏","╚═░ ◕ ▽ ◕ ░═╝","⁞ つ: •̀ ⌂ •́ : ⁞つ","ᕦ( ~ ◔ ᴥ ◔ ~ )੭━☆ﾟ.*･｡ﾟ","ᕦ( ˵ ◕ д ◕ ˵ )੭━☆ﾟ.*･｡ﾟ","ᕦ⁞ ˵ ͡◕ ╭ ͟ʖ╮ ◕͡ ˵ ⁞ᕤ",
				"໒( ˵☉ ͟ʖ ☉˵ )७","▐  ⊙ ▃ ⊙ ▐","ᕙ( ˵ ◕ д ◕ ˵ )ᕗ","໒( ✿ ❛ ͜ʖ ❛ ✿ )७","໒( ◐ ‿ ◐ )७","c( ˵ ╥ ͟ʖ ╥ ˵ )੭","໒( ◕ (oo) ◕ )७","/╲/\\╭( . ರ ل ರೃ . )╮/\\╱﻿\\","ʕ ﹒︣ ᴥ ﹒︣ ʔ","ᕕ╏ ۞ ∧ ۞ ╏╭∩╮","ᕕ╏ ^ ◡ ^ ╏ᓄ","༼ = ⊙ ᗜ ⊙ = ༽","ᕙ| ” ◉ ◡ ◉ ” |ᕗ","། ” ் ʖ̯ ் ” །","ᕙ⁞ : •̀ ⌂ •́ : ⁞ᕗ","⋋╏ ヘ ⌂ ヘ ╏⋌","┌| ◔ ▃ ◔ |┐","໒( ~ ◔ ᴥ ◔ ~ )७","༼ ∗ ͝° _ʖ ͝° ∗ ༽","ʕ ˵ ๑ _ ๑ ˵ ʔ","▐ ・ ‿ ・▐","(ʘ言ʘ╬)","૮( ᵒ̌皿ᵒ̌ )ა","(ఠ్ఠ ˓̭ ఠ్ఠ)","( ੭눈 _ 눈 )੭","ლ(ಠ_ಠლ)","ლ(ಠ益ಠ)ლ","╭(๑¯д¯๑)╮","(҂ ˘ _ ˘ )","ᕕ║ ° ڡ ° ║┐",
				"乁། * ❛ ͟ʖ ❛ * །ㄏ","╏つ” ⊡ 〜 ⊡ ” ╏つ","ʕ ⊃･ ◡ ･ ʔ⊃","[ ･ิ ▾ ･ิ ]","ԅ╏ ˵ ⊚ ◡ ⊚ ˵ ╏┐","ლ༼ ◕ _̀ ◕ ༽ノ⌒.","੧║ ” ◔ Ĺ̯ ◔ ” ║و","໒( ･ Ĺ̯ ･ )७","o͡͡͡╮| ͠° ▃ °͠ |╭o͡͡͡","╰། ﹒ _ ﹒ །╯","c໒( ◐ ﹏ ◐ )७੭","ᕕ╏ ͡ᵔ ‸ ͡ᵔ ╏凸","୧[ ˵ ͡ᵔ ͜ʟ ͡ᵔ ˵ ]୨","໒( , ⊙ Ĺ̯ ⊙ , )७","ᕕ| ◉ ͜ʟ ◉ |ง","╚═╏ . ˘ ڡ ˘ . ╏═╝","ᕦ[ ◔ (oo) ◔ ]ᕤ","ᕙ( : ˘ ∧ ˘ : )ᕗ","c(ˊᗜˋ*c)","༼⊃ •́ ヮ •̀ ༽⊃","(⊃｡•́‿•̀｡)⊃","੧║ ☯ ⌂ ☯ ║┐","੧| ✿ ◔ ں ◔ ✿ |ᓄ","໒( = ಠ ◡ ಠ = )७","୧༼ ͡◕ д ◕͡ ༽୨","ᕙ། – ڡ – །ᕗ","└| ಠ ‸ ಠ |┘","ԅ໒( ☯ ᗜ ☯ )७ᕗ","ᕕ╏ ͡ ▾ ͡ ╏┐","། ˵ ︣ ෴ ︣ ˵ །",
				"(╯°□°）╯︵ (\\ . 0 .)\\","ლ(- ◡ -ლ)","ლ( `Д’ ლ)","༼つ . •́ _ʖ •̀ . ༽つ","༼つ ் ▽ ் ༽つ","╏つ ͜ಠ ‸ ͜ಠ ╏つ","/╲/\\╭༼ ି 〰 ି ༽╮/\\╱﻿\\","ᕙ╏ : ◑ ڡ ◑ : ╏ᕗ","╰| ⁰ ෴ ⁰ |╯","ᕙ〳 ʘ – ʘ 〵ᕗ","/╲/\\╭[ ･ิ ʖ̫ ･ิ ]╮/\\╱﻿\\","ᕙ། ◕ – ◕ །ᕗ","ᕕ║ = ◔ ヮ ◔ = ║୨","┌| . ิ 〰 ิ . |┐","ԅ། ^ ͜ʟ ^ །و","༼ ͡◕ ◞౪◟ ◕͡ ༽","乁⁞ ◑ ͜ر ◑ ⁞ㄏ","⋋| ՞ ‸ ՞ |⋌","〳 ☯ ﹏ ☯ 〵","【＝◈︿◈＝】","o͡͡͡╮༼  ಠДಠ ༽╭o͡͡͡━☆ﾟ.*･｡ﾟ","╰། ❛ ڡ ❛ །╯","/╲/\\╭〳 . ˘ ۝ ˘ . 〵╮/\\╱﻿\\","╏ ⊙ Ĺ̯ ⊙ ╏","( ◔ ʖ̯ ◔ )","༼ ~ ͡■ _ ■͡ ~ ༽","ᕦ( ✿ ⊙ ͜ʖ ⊙ ✿ )━☆ﾟ.*･｡ﾟ","ʕ ͠° ʖ̫ °͠ ʔ","໒( ° ౪ ° )७┌∩┐","ᕕ╏ ͜ಠ ‸ ͜ಠ ╏ᓄ",
				"ヽ| ͡☉ ︿ ͡☉ |ノ⌒.","┌[ ◐ ‸ ◐ ]┐","୧⁞ ˵ ･ 益 ･ ˵ ⁞୨","[ ☯ ͜ʟ ☯ ]","ヽ༼ ் ▽ ் ༽╯","o͡͡͡╮༼ ◔ _ ◔ ༽╭o͡͡͡","༼ ・ ౪ ・ ༽","ᕕ༼  ︣ ᗜ ︣  ༽୨","/╲/\\╭[ ☉ ﹏ ☉ ]╮/\\╱﻿\\","໒( ◉ ‸ ◉ )७","༼ ˵ ❛ 益 ❛ ˵ ༽","└[ ◕ 〜 ◕ ]┘","༼ , ﹒︣ o ﹒︣ , ༽","ԅ༼ ◔ ڡ ◔ ༽ง","ʕ ﹒ ᴥ ﹒ ʔ","ԅ[ •́ ﹏ •̀ ]و","໒( ” •̀ ᗜ •́ ” )७","ʕ ∗ •́ ڡ •̀ ∗ ʔ","╚═[ ˵ •̀ ﹏ •́ ˵ ]═╝","୧ʕ ⇀ ⌂ ↼ ʔ୨","໒( ~ ͡◕ ◡ ◕͡ ~ )७","[ ಠ □ ಠೃ ]","ᕦ༼ ~ •́ ₒ •̀ ~ ༽ᕤ","ʕ ͡° ʖ̫ °͡ ʔ","╰໒( ͡ຈ ᴥ ຈ͡ )७╯","໒( ˵ ͡° ͜ʖ °͡ ˵ )७","ヽ༼ •́ ヮ •̀ ༽ᓄ","໒( •̀ ◡ •́ )७┌∩┐","( ✿ •̀ ‸ •́ ✿ )","ᕦ༼ •́ ‸ •̀ ༽ᕤ",
				"ᕕ༼ •́ Д •̀ ༽ᕗ","[ ಠ (oo) ಠ ]","༼ ಠ ▃ ಠೃ ༽","ᕙ( * •̀ ᗜ •́ * )ᕗ","o͡͡͡╮༼ . •́ _ʖ •̀ . ༽╭o͡͡͡","༼ ∗ •̀ (oo) •́ ∗ ༽","c༼ ” ͡° ▃ °͡ ” ༽ᕤ","໒( ˵ •̀ □ •́ ˵ )७","ʕ •̀ o •́ ʔ","へʕ ∗ ´ ۝ ´ ∗ ʔ┘","┌໒( : ͡° д °͡ : )७┐","▓⚗_⚗▓","»-(¯`·.·´¯)->","ε(´סּ︵סּ`)з","(❍ᴥ❍ʋ)","༼☉ɷ⊙༽","‎(/.__.)/","(◔/‿\\◔)","(⋟﹏⋞)","♞▀▄▀▄♝▀▄","♪ヽ( ⌒o⌒)人(⌒-⌒ )v ♪","óÔÔò ʕ·͡ᴥ·ʔ óÔÔò","╾━╤デ╦︻","ᗧ͇̿ · · ᗣ͇̿ᗣ͇̿ᗣ͇̿ᗣ͇̿","╭∩╮ʕ•ᴥ•ʔ╭∩╮","█▬█ █ ▀█▀","┏━┓ ︵ /(^.^/)","▄︻̷̿┻̿═━一","(⌐■_■)–︻╦╤─","(づ ￣ ³￣)づ",
				"┬┴┬┴┤･ω･)ﾉ├┬┴┬┴","︻╦̵̵͇̿̿̿̿══╤─","くコ:彡","^ↀᴥↀ^","❚█══█❚","c༽✖﹏✖༼ᓄ","⊂(´･◡･⊂ )∘˚˳°","ᗜੂͦ﹏ᗜੂͦ","◦°˚\\(*❛‿❛)/˚°◦","₍₍ ᕕ(´◓⌓◔)ᕗ⁾⁾","ଘ(੭*ˊᵕˋ)੭*","(っ ºДº)っ ︵ ⌨","┃ ु ⠁⃘  ⠁⃘ू┃⁼³₌₃","ೖ(⑅σ̑ᴗσ̑)ೖ","(ʘᗩʘ’)","༼ つ ̥◕͙_̙◕͖ ͓༽つ","(∩ ͡ ° ʖ ͡ °) ⊃-(===>","ヘ(￣ω￣ヘ)","┌∩┐(ಠ_ಠ)┌∩┐","ヽ(⌐■_■)ノ♪♬","ͼ(ݓ_ݓ)ͽ","(((༼•̫͡•༽)))","(ಥ﹏ಥ)","┳━┳ ヽ༼ಠل͜ಠ༽ﾉ","(✖╭╮✖)",".·´¯`(>▂>)´¯`·.","٩(｡•́‿•̀｡)۶","／人 ◕ ‿‿ ◕ 人＼","(づ｡◕‿‿◕｡)づ","⁝⁞⁝⁞ʕु•̫͡•ʔु☂⁝⁞⁝⁝",
				"(๑•॒̀ ູ॒•́๑)","(ヾﾉ•᷅ ༬•᷄ )","ฅ⁽͑ ˚̀ ˙̭ ˚́ ⁾̉ฅ","(۶ૈ ᵒ̌ Дᵒ̌)۶ૈ=͟͟͞͞ ⌨","凸(⊙▂⊙✖ )","(ू˃̣̣̣̣̣̣︿˂̣̣̣̣̣̣ ू)","((╬ಠิ﹏ಠิ))","┬┴┬┴┤(･_├┬┴┬┴","⊹⋛⋋( ՞ਊ ՞)⋌⋚⊹","(.﹒︣︿﹒︣.)","༼⁰o⁰；༽","੧(❛〜❛✿)੭","(˵¯͒〰¯͒˵)","( ཀ͝ ∧ ཀ͝ )","(;´༎ຶД༎ຶ`)","༼;´༎ຶ ۝ ༎ຶ༽","╰⋃╯ლ(´ڡ`ლ)","ヽヽ༼༼ຈຈل͜ل͜ຈຈ༽༽ﾉﾉ","(O ʖ O)","ヽ༼, ͡X ͜ʖ ͡X,༽ﾉ","༼ຈل͜ຈ༽ﾉ·︻̷┻̿═━一","╭∩╮༼◕ل͜◕༽╭∩╮","(-(-(-_-)-)-)","ヽ༼ ͠ ͠° ͜ʖ ͠ ͠° ༽ﾉ","(∩｀-´)⊃━☆ﾟ.*･｡ﾟ","╰(⇀‸↼)╯","╰(⇀⌂↼‶)╯","༼ ಥل͟ಥ ༽","༼つ☯﹏☯༽つ","ᕙ༼ ͝°益° ༽ᕗ",
				"(✿☯‿☯✿)","ヽ໒(☯_☯✿)७ﾉ","ᕕ༼ຈل͜ຈ༽ᕗ","( ﾉ ﾟｰﾟ)ﾉ","ヽ༼ຈل͜ຈ༽ﾉ︵┻━┻","(ﾉಠ_ಠ)ﾉ","(╯°□°)╯︵ ┻━┻","ᕕ( ᐛ )ᕗ","༼☯﹏☯༽","୧༼ಠ益ರೃ༽୨","ᕙ༼ຈل͜ຈ༽ᕗ","༼ つ ◕o◕ ༽つ","( ͡° ʖ̯ ͡°)","┌(▀Ĺ̯ ▀-͠ )┐","ヽ༼ ˙ ͜ʟ˙ ༽ﾉ","(◔ д◔)","٩(ˊᗜˋ*)و","ლ༼ཹ༽ლ","( ͡°ᴥ ͡° ʋ)","(ง⌐□ل͜□)ง","ヽ( ͝° ͜ʖ͡°)ﾉ","└༼ຈلຈ༽┐","凸༼ຈل͜ຈ༽凸","ヽ(´・ω・`)ﾉ","└(◉◞౪◟◉)┘","( ๑‾̀◡‾́)σ»","ヽ༼ -ل͟-༽ﾉ Zzzzzzz","(◞‸◟；)","ᕦ⊙෴⊙ᕤ","(✿ヘᴥヘ)",
				"へ(¬ϖ¬)へ","ヽ༼ຈل͜ຈ༽ᓄ†","(≖ᴗ≖✿)","(ノ ̿ ̿ᴥ ̿ ̿)ノ","(╯･ิ-･ิ)╯","(/◔ ◡ ◔)/","(_/¯◜ ω ◝)_/¯","ノಠ_ಠノ","୧༼ʘ̆ںʘ̆༽୨","ヽ༽ຈل͜ຈ༼ﾉ","༼∩✿ل͜✿༽⊃━☆ﾟ. * ･ ｡ﾟ","༼∩☉ل͜☉༽⊃━☆ﾟ. * ･ ｡ﾟ","ノ(;Ĺ̯̿̿ ;ノ)","(⌐ ͡■ ͜ʖ ͡■)","( ͡° ͜ʖ ͡°)>⌐■-■","( ͡° ͜ʖ ͡°)","༼⌐■ل͜■༽","༼ ຈل͜ຈ༽ノ⌐■-■","༼ ຈل͜ຈ༽","༼,ຈ_ຈ,༽","ヽ༼ ; ل͜ ; ༽ﾉ","/╲/\\╭༼ຈຈل͜ຈຈ༽╮/\\╱﻿\\","ヽ༼, ͡ຈ ͜ʖ ͡ຈ,༽ﾉ","༼ ºل͟º༼ ºل͟º༽","ヽ(͡◕ ͜ʖ ͡◕)ﾉ","༼ つ ͡ ͡° ͜ ʖ ͡ ͡° ༽つ","ʕ•̫͡•ʕ̫͡ʕ•͓͡•ʔ-̫͡-ʕ•̫͡•ʔ̫͡ʔ-̫͡-ʔ","ヽ༼ຈ┏ل͜┓ຈ༽ﾉ","╚═( ͡° ͜ʖ ͡°)═╝","(°ヮ°)",
				"ᕕ( ಠ‿ಠ)ᕗ","ᕙ( ͡◉ ͜ ʖ ͡◉)ᕗ","༼୨༼ ºل͟º ༽୧༽","ᕦ༼✩ل͜✩༽ᕤ","(งಠل͜ಠ)ง","(っಠ‿ಠ)っ","(̿ಠ ̿Ĺ̯̿̿ಠ ̿)̄","ヽ(‘ºل͟º)ノ","ヽ༼✡ل͜✡༽ﾉ","✡✡ヽ༼ຈل͜ຈ༽ﾉ✡✡","( ͡; ͜ʖ ͡;)","ლ(▀̿̿Ĺ̯̿̿▀̿ლ)","┌( ͝° ͜ʖ͡°)=ε/̵͇̿̿/’̿’̿ ̿","( ͝ಠ ʖ ಠ)=ε/̵͇̿̿/’̿’̿ ̿","╰( ͡° ͜ʖ ͡° )つ──☆*:・ﾟ","( ͡☉ ͜ʖ ͡☉)","/╲/\\╭(▀̿̿Ĺ̯̿̿▀̿ ̿)╮/\\╱\\","(╯°□°）╯︵ ส็็็็็็็ส","/╲/\\╭༼ ººل͟ºº ༽╮/\\╱﻿\\","(ᓄಠ_ಠ)ᓄ","ヽ(╯▽╰)ﾉ","ヽ(╯ل͜╰)ﾉ","ᕙ(⇀‸↼‶)ᕗ","(ºل͟º)","ᕙ(° ͜ಠ ͜ʖ ͜ಠ°)ᓄ","༼〜ຈل͜ຈ༽〜","┌(° ͜ʖ͡°)┘","༼ つ ◕_◕ ༽つ","ᕙ(▀̿̿Ĺ̯̿̿▀̿ ̿) ᕗ","ヽ༼ ◉_◔ ༽ﾉ",
				"(ง ͡ʘ ͜ʖ ͡ʘ)ง","┌∩┐༼ ºل͟º ༽┌∩┐","╰( ͡’◟◯ ͡’)╯","(╯ຈل͜ຈ) ╯︵ ┻━┻","ʕง•ᴥ•ʔง","(ง’̀-‘́)ง","(งಠ_ಠ)ง","(ง ° ͜ ʖ °)ง","(́ง◉◞౪◟◉‵)ง","ʕっ•ᴥ•ʔっ","┬───┬ ノ༼ຈل͜ຈノ༽","ヽ(ಠ▃ಠ)ﾉ","ヽ༼◐ل͜◑༽ﾉ","( ◔ ౪◔)","(╯°□°)ຈ҉̛༽̨҉҉ﾉ̨","ヽ(”`▽´)ﾉ","ᕙ( ^ ₒ^ c)","(◕‿◕✿)","༼ つ ▀̿_▀̿ ༽つ","༼ﾉ ◉ ͜ ◉ ༽つ","( つ★ل͜ ★)つ","ヽ༼ • ͜ •༽ﾉ","୧༼◔益◔╭∩╮༽","୧༼ ͡◉ᴥ ͡◉༽୨","ᕙ༼◕ ᴥ ◕༽ᕗ","୧༼◕ ᴥ ◕༽୨","(•_̀• ง)","(ʘ͡ ʖ͜ ʘ͡ ง)","༼ – ل͜ – ༽","ᕦ(▀̿ ̿ -▀̿ ̿ )つ├┬┴┬┴",
				"(=◕ل͜◕=)","༼ ⨀ ̿Ĺ̯̿̿⨀ ̿༽ง","ಠ⌣ಠ","(❛ε❛“)","ᕙ༼ ◔ل͜ ◕ ༽ᕤ","ᕙ (° ~͜ʖ~ °) ᕗ","/╲/\\╭( ͡° ͡° ͜ʖ ͡° ͡°)╮/\\╱\\","ᕕ( 　´　Д　｀　 )ᕗ","ヽ༼xل͜x༽ﾉ","─=≡Σ((( つ◕ل͜◕)つѰ","ʘ ͜ʖ ʘ","༼ノಠل͟ಠ༽ノ ︵ ┻━┻","༼ﾉຈل͜ຈ༽ﾉ︵┻━┻","╭∩╮◕ل͜◕)╭∩╮","───==≡≡ΣΣ((( つºل͜º)つ","ᕕ(⌐□ل͜□)ᕗ","ᕕ( ͡° ͜ʖ ͡°)ᕗ","(º◡º)っ","ᕕ༼✪ل͜✪༽ᕗ","༼ ༽ ლ(́◉◞౪◟◉‵ლ)","乁( ◔ ౪◔)ㄏ","(◕ل͜◕)","ヽ༼ ʘ̚ل͜ʘ̚༼◕_◕༽◉_◔ ༽ﾉ","ヽ༼ ຈل͜ຈ༼ ▀̿̿Ĺ̯̿̿▀̿ ̿༽Ɵ͆ل͜Ɵ͆ ༽ﾉ","─=≡Σᕕ( ͡° ͜ʖ ͡°)ᕗ","(╯ ͝° ͜ʖ͡°)╯︵ ┻━┻","(つ☢益☢)つ︵┻━┻","┬─┬ノ(ಠ_ಠノ)","┬━┬ノ(▀̿̿Ĺ̯̿̿▀̿ ̿ノ)","ヽ༼ ツ ༽ﾉ ︵┻━┻",
				"༼ ᕤ ºل͟º ༽ᕤ ︵┻━┻","ζ༼ᴼل͜ᴼ༽ᶘѰ","┬──┬╯﻿︵ /(.□. \\）","( •_•)>⌐■-■","(ﾉ＾◡＾)ﾉ︵﻿ ┻━┻","┬━┬﻿ ノ( ゜¸゜ノ)","ヽ(`Д´)ﾉ","(=^-ω-^=)","┻━┻ ︵﻿ ¯\\ (ツ)/¯ ︵ ┻━┻","（╯°□°）╯︵( .o.)","┌( ಠ_ಠ)┘","(╯°Д°）╯︵/(.□ . )","┻━┻ ︵ヽ(`Д´)ﾉ︵ ┻━┻","(ノಠ益ಠ)ノ彡┻━┻","┬━┬﻿ ノ( ゜-゜ノ)","ლ(́◉◞౪◟◉‵ლ)","༼ つ ◕_◕ ༽つ ༼ ༽","(ʘ ل͟├┬┴┬┴","~(˘◡˘~)","༼ +ل͟+ ༽","( ͝° ͜ʖ͡°)つ* ლ(́◉◞౪◟◉‵ლ)","(✿_✿)","(۞_۞)","୧༼ ◯益◯ ༽୨","༼:◕:ل͜◕:༽","༼ ಠل͟ಠ༽ ̿ ̿ ̿ ̿’̿’̵з=༼ຈل͜ຈ༽ﾉ","ᕕ༼ ͡■ل͜ ͡■༽ᕗ","(∩ ͡° ͜ʖ ͡°)⊃━☆─=≡Σ((( つ◕ل͜◕)つ","ᕙ༼◕ل͜◕༽ᕗ","༼ᕗຈل͜ຈ༽ᕗ",
				"ヽ(ﾟｰﾟヽ)","(◐ل͜ ◐)","༼ つ ◕3◕ ༽つ ♫♪♫","ヽ( ͡͡ ° ͜ ʖ ͡ °)⊃━☆ﾟ. * ･ ｡ﾟ","ಠل͟ಠ","(╯_ʖ╰)","┌༼ຈل͜ຈ༽┐","◕_◕","( ͝°_ʖ͡°)","ヽʕ•ᴥ•ʔﾉ","ヽ༼ຈ╭͜ل͜╮ຈ༽ﾉ","୧( ͠° ͟ʖ ͡°)୨","ヽ(๑╹ڡ╹๑)ﾉ","༼◉ل͟◉༽","༼ つ ͠° ͟ ͟ʖ ͡° ༽つ","ヽ༼ – ل͜ – ༽ﾉ","[̲̅$̲̅ຈل͜ຈ$̲̅]","╰( ͡◕◯ ͡◕)╯","ヽ༼☯﹏☯༽ﾉ","ヽ༼ຈل͜ຈ༽ﾉ☆","( ͝° ͜ʖ͡°)","ヾ( ͝° ͜ʖ͡°)ノ♪","(｡◕‿‿◕｡)","( ͡ᵔ ͜ʖ ͡ᵔ )","( ͝° ͜ʖ͡°)つ ⌒ ͜","( ͡° ʖ°)","─=≡Σ((( つ◕ل͜◕)つ","(͡◔ ͜ʖ ͡◔)","(ಠ_ಠ)ᕗ","ﾉ༽ຈ͜لຈ༼ヽ",
				"ヽ༼ ͒ ̶ ͒༽ﾉ","༼ つD◕ل͜◕ ༽つ>–>","༼ つ ◕_◕ ༽つ ~~~卐","( ‾ʖ̫‾)","╭( ͝ಠل͜ಠ)つ","╰(✿ ͡’◟◯ ͡’)╯","(つ 益 )つ","(‘ºل͟º)","ᕕ( ͡°╭ ͟ʖ╮͡° ) ᕤ","( ง ͡°╭ ͟ʖ╮͡° ) ง","ヽ( ͡°╭͜ʖ╮͡ರೃ )ﾉ","( ͡°╭ ͟ʖ╮͡├┬┴┬┴","( ＾◡＾)","ヽ༼ ツ ༽ﾉ ♫","┌༼▀̿̿Ĺ̯̿̿▀̿༽┘","ԅ(ˆ⌣ˆԅ)","(‘ºل͟º)ノ⌒","(ᵔᴥᵔ)","ಠ‿ಠ","( ◕ ◡ ◕ )","~(╯▽╰)~","~( ＾◡＾)~","┌( ͝° ͜ʖ͡°)ᕤ","༼ຈل͜ ͡°)ᕗ","╚༼ ຈل͜ຈ༽╝","ヽ༼✿σل͜ σ༽ﾉ","ლ(́✪◞౪◟✪‵ლ)","( •_•)ノ✝","(~° ͜ʖ͡°)~ ( . ( . )","ヽ(*・ω・)ﾉ",
				"(∩ ͡° ͜ʖ ͡°)⊃━ 卐","╭∩╮( ° ͜ʖ͡°)╭∩╮","(⊙＿⊙’)","( ~ ♥‿♥)~ð","༼(∩ ͡°╭͜ʖ╮͡ ͡°)༽⊃━☆ﾟ. * ･ ｡ﾟ","༼ ºل͟º༼ ºل͟º༽ºل͟º ༽","(╥﹏╥)","┌༼ຈل͜ຈ༽┘","乁( •_• )ㄏ","( ＾◡＾)っ✂","◟(∗❛ัᴗ❛ั∗)◞","(ง •̀_•́)ง","( ◔ ౪◔)ㄏ","☚(ﾟヮﾟ☚)","¯\\_(ツ)_/¯","༼ つ ✿◕‿◕✿༽つ╰⋃╯","─=≡Σ((((ó ì_í)=ó","─=≡Σ((((͡◔ ͜ʖ ͡◔)","༼ ͠ຈ ͟ل͜ ͠ຈ༽ง","ヽ༼@ل͜ຈ༽ﾉ","ლ ༼ ಥل͟ಥ ༽","╮(╯▽╰)╭","( °U° )","o͡͡͡͡͡͡╮༼;´༎ຶ.̸̸̸̸̸̸̸̸̸̸̸̸̸̸̨̨̨̨̨̨̨.̸̸̨̨۝ ༎ຶ༽╭o͡͡͡͡͡͡","(•_•)","̿̿ ̿̿ ̿’̿’̵͇̿̿з=༼ ▀̿̿Ĺ̯̿̿▀̿ ̿ ༽","¯_( ͡° ͜ʖ ͡°)ง-]—- ᴇɴ ɢᴀʀᴅᴇ","ᕙ (° ~ ° ~)","༼ つ ◕ 3 ◕ ༽つ","༼☉╾☉༽",
				"( ͡ _ ͡°)ﾉ⚲","( ＾◡＾)っ✂╰⋃╯","(▀̿̿Ĺ̯̿̿▀̿ ̿)⊃━☆ﾟ. * ･ ｡ﾟ","༼ ͠ຈ ͟ل͜ ͠ຈ༽ง︵┻━┻","ヽ༼ຈل͜ರೃ༽ﾉ","(╯ ╥﹏╥)╯︵ ǝʞoɾ ǝɯɐs","(ง ◉◡◔)ง","(⌐■_■)┣▇▇▇═──","(⌐■_■)","(⌐■_■)┣▇▇▇═── ༼ ºل͟º༽","━╤デ╦︻(▀̿̿Ĺ̯̿̿▀̿ ̿)","└ʕ•ᴥ•ʔ┘","(ᕗ ⌐□ل͜□)ᕗ ├┬","(ง ͠ ᵒ̌ Дᵒ̌)¤=[]:::::>","(ง ͠° ͟ل͜ ͡°)¤=[]:::::>","̿’ ̿’\\̵͇̿̿\\з=(ಡل͟ಡ)=ε/̵͇̿̿/’̿’̿","̿’ ̿’\\̵͇̿̿\\з=(ಥДಥ)=ε/̵͇̿̿/’̿’̿","( ͡° ͜ʖ͡°)╭∩╮","(☯‿├┬┴┬┴","凸（͡°͜ʖ͡°）凸","ヽ༼ຈᴥຈ༽ﾉ","ᕙ(ಥ益ಥ‶)ノ","ʕ ͝°ل͟ ͝°ʔ","(▀̿̿Ĺ̯̿̿├┬┴┬┴","( ͝° ͜ʖ͡°)つY","ヽ( ͡°╭͜ʖ╮͡° )ﾉ","༼凸 ◉_◔༽凸","♫ ┌༼ຈل͜ຈ༽┘ ♪","༼ ಥل͟ಥ ༽ ┬┴┬┴┤","༼ ಠل͟ಠ༽",
				"|༼ʘ ل͜ ʘ༽|","ヽ༼◕ل͜◕༽ﾉ","(° ͜ʖ°)","ヽ༼ ツ ༽ﾉ","（͡°͜ʖ͡°）","(☢益☢t)","╮(╯ل͜╰)╭","༼ つ◕(oo)◕༽つ","(ι´   Д｀)ﾉ","ヽ༼◥▶ل͜◀◤༽ﾉ","[̲̅$̲̅(̲̅ ͡◥▶ ͜ʖ ͡◀◤)̲̅$̲̅]","ヽ༼ຈل͜ຈ༽ﾉ☂","(＾◡＾)っ","ヽ༼ ☭ل͜☭ ༽ﾉ","༼✪ل͜✪༽ᕤ","ヽ༼ʘ̚ل͜ʘ̚༽ﾉ","(∩ ͡° ͜ʖ ͡°)⊃━☆ﾟ","୧༼ ͡◉ل͜ ͡◉༽୨","༼ ͡■ل͜ ͡■༽","ヽ༼ຈل͜ຈ༽ง","ɳ༼ຈل͜ຈ༽ɲ","(~˘▾˘)~","ʕ•ᴥ•ʔ","(☞ﾟヮﾟ)☞","୧༼ಠ益ಠ༽୨","(▀̿̿Ĺ̯̿̿▀̿ ̿)","└(°ᴥ°)┘","ヽ༼♥ل͜♥༽ﾉ","༼ ᓄºل͟º ༽ᓄ","(ง ͠° ͟ل͜ ͡°)ง",
				"ᕦ༼ຈل͜ຈ༽ᕤ","༼ ºل͟º༽","(‘ºل͟º)ノ⌒.","[̲̅$̲̅(̲̅ ͡° ͜ʖ ͡°̲̅)̲̅$̲̅]","༼°ل͜°༽","ヽ༼ ಠل͟ಠ༽ﾉ","༼ ಥ ل͜ – ༽","( ͡°╭͜ʖ╮͡° )","ヽ༼ຈل͜├┬┴┬┴","ヽ༼ಥل͟ಥ༽¤=[]:::::>","(✿◕_◕✿)","ヽ༼ຈل͜ຈ༽ﾉ","(ง ͠° ل͜ °)ง","ლ༼ ▀̿̿Ĺ̯̿̿▀̿ ̿ლ༽","(◉◞౪◟◉)","(ノ◉◞౪◟◉‵)ノ⌒[̲̅$̲̅(̲̅ ͡° ͜ʖ ͡°̲̅)̲̅$̲̅]","(‘ºل͟º)ノ⌒.[̲̅$̲̅(̲̅ ͡° ͜ʖ ͡°̲̅)̲̅$̲̅]"
			];
			meme = memes[Math.floor(Math.random() * memes.length)];
			if (meme.charAt(0) === '/') meme = '/' + meme;
			return this.say(con, room, meme);
		}
	},
	
	shitpost: function(arg, by, room, con) {
		if (this.canUse('spam', room, by) || room.charAt(0) === ',') {
			if (Date.now() - lastshitpost < 40000) return this.say(con, room, "Aspetta");
			var message = arg.replace("à","a").replace("è","e").replace("é","e").replace("ì","i").replace("ò","o").replace("ù","u")
							 .replace("À","A").replace("È","E").replace("É","E").replace("Ì","I").replace("Ò","o").replace("Ù","U")
							 .replace(/[^a-zA-Z0-9 /]/g,"");
			if (message.length > 12) return this.say(con, room, "Testo troppo lungo");
			lastshitpost = Date.now();
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
				"0": [
					"╔═╗",
					"║░║",
					"╚═╝"
				],
				"1": [
					"╗",
					"║",
					"╩"
				],
				"2": [
					"╔═╗",
					"╔═╝",
					"╚═╝"
				],
				"3": [
					"╔═╗",
					"░═╣",
					"╚═╝"
				],
				"4": [
					"╦░╦",
					"╚═╣",
					"░░╩"
				],
				"5": [
					"╔═╗",
					"╚═╗",
					"╚═╝"
				],
				"6": [
					"╔═╗",
					"╠═╗",
					"╚═╝"
				],
				"7": [
					"═╗",
					"░║",
					"░╩"
				],
				"8": [
					"╔═╗",
					"╠═╣",
					"╚═╝"
				],
				"9": [
					"╔═╗",
					"╚═╣",
					"╚═╝"

				],
				" ": [
					"░░",
					"░░",
					"░░"
				]
			};
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
	
	aq: 'addquote',
	addquote: function(arg, by, room, con) {
		if (this.canUse('spamadmin', room, by)) {
			if (arg === '') return false;
			arg = arg.replace('"', '\"');
			if (!this.settings['quotes']) this.settings['quotes'] = {};
			if (!this.settings.quotes[room]) this.settings.quotes[room] = [];
			if (this.settings.quotes[room].indexOf(arg) > -1) return this.say(con, room, "Duplicate quote");
			this.settings.quotes[room].push(arg);
			this.writeSettings();
			return this.say(con, room, "Quote added");
		}
	},
	deletequote: function(arg, by, room, con) {
		if (this.canUse('spamadmin', room, by)) {
			if (arg === '') return false;
			var text;
			if (this.settings['quotes'] && this.settings.quotes[room]) {
				arg = Number(arg);
				if (!isNaN(arg) && arg % 1 === 0) {
					var quotes = this.settings.quotes[room];
					if (quotes[arg]) {
						quotes.splice(arg, 1);
						this.writeSettings();
						text = "Quote deleted";
					}
					else {
						text = "Quote not found";
					}
				}
				else {
					text = "Insert a quote number";
				}
			}
			else {
				text = "No quotes found";
			}
			this.say(con, room, text);
		}
	},
	q: 'quote',
	quote: function(arg, by, room, con) {
		if (this.canUse('spam', room, by)) {
			var text;
			if (this.settings['quotes'] && this.settings.quotes[room]) {
				argN = Number(arg);
				var quotes = this.settings.quotes[room];
				if (!isNaN(argN) && argN % 1 === 0) {
					if (quotes[argN]) {
						text = quotes[argN];
					}
					else {
						text = "Quote not found";
					}
				}
				text = quotes[Math.floor(Math.random() * quotes.length)];
			}
			else {
				text = "No quotes found";
			}
			return this.say(con, room, text);
		}
	},
	quotelist: function(arg, by, room, con) {
		if (this.canUse('spam', room, by)) {
			var text = '';
			if (this.settings['quotes'] && this.settings.quotes[room]) {
				var quotes = this.settings.quotes[room];
				for (var i in quotes) {
					text += i + '. ' + quotes[i] + '\n\n';
				}
			}
			else {
				text = "No quotes found";
			}
			this.uploadToHastebin(con, room, by, text, true);
		}
	},
	
	anagram: function(arg, by, room, con) {
		if (this.canUse('spam', room, by) || room.charAt(0) === ',') {
			arg = ' ' + shuffle(arg.split("")).join("");
			return this.say(con, room, arg);
		}
	},
	mangobay: function(arg, by, room, con) {
		if (this.canUse('spam', room, by) || room.charAt(0) === ',') {
			return this.say(con, room, "𝓜𝓪𝓷𝓰𝓸 𝓑𝓪𝔂 https://www.youtube.com/watch?v=yuyV6G6atoQ 𝓜𝓪𝓷𝓰𝓸 𝓑𝓪𝔂");
		}
	},
};
