﻿/**
 * This is the file where commands get parsed
 *
 * Some parts of this code are taken from the Pokémon Showdown server code, so
 * credits also go to Guangcong Luo and other Pokémon Showdown contributors.
 * https://github.com/Zarel/Pokemon-Showdown
 *
 * @license MIT license
 */

var sys = require('sys');
var https = require('https');
var url = require('url');

const ACTION_COOLDOWN = 3*1000;
const FLOOD_MESSAGE_NUM = 4;
const FLOOD_PER_MSG_MIN = 250; // this is the minimum time between messages for legitimate spam. It's used to determine what "flooding" is caused by lag
const FLOOD_MESSAGE_TIME = 5*1000;
const MIN_CAPS_LENGTH = 18;
const MIN_CAPS_PROPORTION = 0.7;

settings = {};
try {
	settings = JSON.parse(fs.readFileSync('settings.json'));
	if (!Object.keys(settings).length && settings !== {}) settings = {};
} catch (e) {} // file doesn't exist [yet]

exports.parse = {
	actionUrl: url.parse('https://play.pokemonshowdown.com/~~' + config.serverid + '/action.php'),
	room: 'lobby',
	'settings': settings,
	ranks: {},

	data: function(data, connection) {
		if (data.substr(0, 1) === 'a') {
			data = JSON.parse(data.substr(1));
			if (data instanceof Array) {
				for (var i = 0; i < data.length; i++) {
					this.message(data[i], connection);
				}
			} else {
				this.message(data, connection);
			}
		}
	},
	message: function(message, connection, lastMessage) {
		if (!message) return;

		if (message.indexOf('\n') > -1) {
			var spl = message.split('\n');
			for (var i = 0, len = spl.length; i < len; i++) {
				this.message(spl[i], connection, i === len - 1);
				if (spl[i].split('|')[1] && spl[i].split('|')[1] === 'users') {
					this.room = '';
					break;
				}
			}
			return;
		}

		var spl = message.split('|');
		if (!spl[1]) {
			spl = message.split('>');
			if (spl[1]) this.room = spl[1];
			return;
		}

		switch (spl[1]) {
			case 'challstr':
				info('received challstr, logging in...');
				var id = spl[2];
				var str = spl[3];

				var requestOptions = {
					hostname: this.actionUrl.hostname,
					port: this.actionUrl.port,
					path: this.actionUrl.pathname,
					agent: false
				};

				if (!config.pass) {
					requestOptions.method = 'GET';
					requestOptions.path += '?act=getassertion&userid=' + toId(config.nick) + '&challengekeyid=' + id + '&challenge=' + str;
				} else {
					requestOptions.method = 'POST';
					var data = 'act=login&name=' + config.nick + '&pass=' + config.pass + '&challengekeyid=' + id + '&challenge=' + str;
					requestOptions.headers = {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Content-Length': data.length
					};
				}

				var req = https.request(requestOptions, function(res) {
					res.setEncoding('utf8');
					var data = '';
					res.on('data', function(chunk) {
						data += chunk;
					});
					res.on('end', function() {
						if (data === ';') {
							error('failed to log in; nick is registered - invalid or no password given');
							process.exit(-1);
						}
						if (data.length < 50) {
							error('failed to log in: ' + data);
							process.exit(-1);
						}

						if (data.indexOf('heavy load') !== -1) {
							error('the login server is under heavy load; trying again in one minute');
							setTimeout(function() {
								this.message(message);
							}.bind(this), 60000);
							return;
						}

						try {
							data = JSON.parse(data.substr(1));
							if (data.actionsuccess) {
								data = data.assertion;
							} else {
								error('could not log in; action was not successful: ' + JSON.stringify(data));
								process.exit(-1);
							}
						} catch (e) {}
						send(connection, '|/trn ' + config.nick + ',0,' + data);
					}.bind(this));
				}.bind(this));

				req.on('error', function(err) {
					error('login error: ' + sys.inspect(err));
				});

				if (data) {
					req.write(data);
				}
				req.end();
				break;
			case 'updateuser':
				if (spl[2] !== config.nick) {
					return;
				}

				if (spl[3] !== '1') {
					error('failed to log in, still guest');
					process.exit(-1);
				}

				ok('logged in as ' + spl[2]);
				
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

				// Now join the rooms
				var cmds = ['|/blockchallenges', '|/avatar 120'];
				for (var i in config.rooms) {
					var room = toId(config.rooms[i]);
					if (room === 'lobby' && config.serverid === 'showdown') {
						continue;
					}
					cmds.push('|/join ' + room);
				}
				for (var i in config.privaterooms) {
					var room = toId(config.privaterooms[i]);
					if (room === 'lobby' && config.serverid === 'showdown') {
						continue;
					}
					cmds.push('|/join ' + room);
				}
				for (var i in config.tourwatchrooms) {
					var room = toId(config.tourwatchrooms[i]);
					if (room === 'lobby' && config.serverid === 'showdown') {
						continue;
					}
					cmds.push('|/join ' + room);
				}

				var self = this;
				if (cmds.length > 3) {
					self.nextJoin = 0;
					self.joinSpacer = setInterval(function(con, cmds) {
						if (cmds.length > self.nextJoin + 2) {
							send(con, cmds.slice(self.nextJoin, self.nextJoin + 2));
							self.nextJoin += 2;
						} else {
							send(con, cmds.slice(self.nextJoin));
							delete self.nextJoin;
							clearInterval(self.joinSpacer);
						}
					}, 4*1000, connection, cmds);
				} else {
					send(connection, cmds);
				}

				self.settings.chatData = cleanChatData(self.settings.chatData, true);
				this.chatDataTimer = setInterval(
					function() {self.settings.chatData = cleanChatData(self.settings.chatData);},
					30*60*1000
				);
				if (lastMessage) this.room = '';
				break;
			case 'title':
				ok('joined ' + spl[2]);
				if (lastMessage) this.room = '';
				break;
			case 'c':
				var by = spl[2];
				spl.splice(0, 3);
				this.processChatData(by, this.room || 'lobby', connection, spl.join('|'));
				if (this.room && this.isBlacklisted(toId(by), this.room)) this.say(connection, this.room, '/roomban ' + by + ', Blacklisted user');
				if (this.room && (config.tournotifroom && this.room === toId(config.tournotifroom)) && by.substr(1) !== config.nick) lastmessagetournotif = Date.now();
				this.chatMessage(spl.join('|'), by, this.room || 'lobby', connection);
				if (lastMessage) this.room = '';
				break;
			case 'c:':
				var by = spl[3];
				spl.splice(0, 4);
				this.processChatData(by, this.room || 'lobby', connection, spl.join('|'));
				if (this.room && this.isBlacklisted(toId(by), this.room)) this.say(connection, this.room, '/roomban ' + by + ', Blacklisted user');
				if (this.room && (config.tournotifroom && this.room === toId(config.tournotifroom)) && by.substr(1) !== config.nick) lastmessagetournotif = Date.now();
				this.chatMessage(spl.join('|'), by, this.room || 'lobby', connection);
				if (lastMessage) this.room = '';
				break;
			case 'pm':
				var by = spl[2];
				if (by.substr(1) === config.nick) return;
				spl.splice(0, 4);
				this.chatMessage(spl.join('|'), by, ',' + by, connection);
				if (lastMessage) this.room = '';
				break;
			case 'N':
				var by = spl[2];
				if (toId(by) !== toId(config.nick) || ' +%@&#~'.indexOf(by.charAt(0)) === -1) return;
				this.ranks[this.room || 'lobby'] = by.charAt(0);
				if (lastMessage) this.room = '';
				break;
			case 'J': case 'j':
				var by = spl[2];
				if (this.room && this.isBlacklisted(toId(by), this.room)) this.say(connection, this.room, '/roomban ' + by + ', Blacklisted user');
				if (toId(by) !== toId(config.nick) || ' +%@&#~'.indexOf(by.charAt(0)) === -1) return;
				this.ranks[this.room || 'lobby'] = by.charAt(0);
				if (lastMessage) this.room = '';
				break;
			case 'l': case 'L':
				var by = spl[2];
				if (lastMessage) this.room = '';
				break;
			case 'users':
				var userlist = spl[2].split(',').slice(1);
				for (var i in userlist) {
					if (toId(userlist[i]) === toId(config.nick)) {
						this.ranks[this.room || 'lobby'] = userlist[i].charAt(0);
					}
				}
				break;
			case 'tournament':
				var room = this.room;
				if (spl[2] === 'create' && config.tourwatchrooms.indexOf(toId(room)) > -1) {
					var tier = spl[3];
					if (config.tournotifroom && config.tournotifroom != '' && lastmessagetournotif > Date.now() - 4 * 60 * 1000) {
						this.say(connection, config.tournotifroom, 'Torneo **' + tier + '** creato nella room <<' + room + '>>');
					}
				}
				break;
		}
	},
	chatMessage: function(message, by, room, connection) {
		var cmdrMessage = '["' + room + '|' + by + '|' + message + '"]';
		message = message.trim();
		// auto accept invitations to rooms
		if (room.charAt(0) === ',' && message.substr(0,8) === '/invite ' && this.hasRank(by, '%@&~') && !(config.serverid === 'showdown' && toId(message.substr(8)) === 'lobby')) {
			return this.say(connection, '', '/join ' + message.substr(8));
		}
		var isCommand = message.substr(0, config.commandcharacter.length) === config.commandcharacter;
		if (room.charAt(0) === ',' && !isCommand) {
			by = by.substr(1);
			return this.say(connection, room, 'Ciao ' + by + '! Se hai bisogno di qualcosa invia un PM a un altro membro dello staff, io sono solo un bot. | Hi ' + by + '! I am a bot, please PM another staff member if you need help.');
		}
		if (!isCommand || toId(by) === toId(config.nick) || config.tourwatchrooms.indexOf(toId(room)) > -1) {
			return;
		}

		message = message.substr(config.commandcharacter.length);
		var index = message.indexOf(' ');
		var arg = '';
		if (index > -1) {
			var cmd = message.substr(0, index);
			arg = message.substr(index + 1).trim();
		} else {
			var cmd = message;
		}

		if (Commands[cmd]) {
			var failsafe = 0;
			while (typeof Commands[cmd] !== "function" && failsafe++ < 10) {
				cmd = Commands[cmd];
			}
			if (typeof Commands[cmd] === "function") {
				cmdr(cmdrMessage);
				Commands[cmd].call(this, arg, by, room, connection);
			} else {
				error("invalid command type for " + cmd + ": " + (typeof Commands[cmd]));
			}
		}
		
		
	},
	say: function(connection, room, text) {
		if (room.substr(0, 1) !== ',') {
			var str = (room !== 'lobby' ? room : '') + '|' + text;
			send(connection, str);
		} else {
			room = room.substr(1);
			var str = '|/pm ' + room + ', ' + text;
			send(connection, str);
		}
	},
	hasRank: function(user, rank) {
		var hasRank = (rank.split('').indexOf(user.charAt(0)) !== -1) || (config.excepts.indexOf(toId(user.substr(1))) !== -1);
		return hasRank;
	},
	canUse: function(cmd, room, user) {
		var canUse = false;
		var ranks = ' +%@&#~';
		if (!this.settings[cmd] || !(room in this.settings[cmd])) {
			canUse = this.hasRank(user, ranks.substr(ranks.indexOf((['spamadmin', 'autoban', 'banword'].indexOf(cmd) > -1) ? '#' : config.defaultrank)));
		} else if (this.settings[cmd][room] === true) {
			canUse = true;
		} else if (ranks.indexOf(this.settings[cmd][room]) > -1) {
			canUse = this.hasRank(user, ranks.substr(ranks.indexOf(this.settings[cmd][room])));
		}
		return canUse;
	},
	isBlacklisted: function(user, room) {
		return (this.settings.blacklist && this.settings.blacklist[room] && this.settings.blacklist[room].indexOf(user) > -1);
	},
	uploadToHastebin: function(con, room, by, toUpload, inChat) {
		var self = this;

		var reqOpts = {
			hostname: "hastebin.com",
			method: "POST",
			path: '/documents'
		};

		var req = require('http').request(reqOpts, function(res) {
			res.on('data', function(chunk) {
				try {
					var filename = JSON.parse(chunk.toString())['key'];
				}
				catch (e) {
					return self.say(con, room, "Errore nell'upload su Hastebin");
				}
				return self.say(con, room, (room.charAt(0) === ',' || inChat === true ? "" : "/pm " + by + ", ") + "hastebin.com/" + filename + ".txt");
			});
		});

		req.write(toUpload);
		req.end();
	},
	processChatData: function(user, room, connection, msg) {
		// NOTE: this is still in early stages
		if (config.tourwatchrooms.indexOf(toId(room)) > -1) return;
		if (toId(user.substr(1)) === toId(config.nick)) {
			this.ranks[room] = user.charAt(0);
			return;
		}
		user = toId(user);
		if (!user || room.charAt(0) === ',') return;
		room = toId(room);
		msg = msg.trim().replace(/[ \u0000\u200B-\u200F]+/g, " "); // removes extra spaces and null characters so messages that should trigger stretching do so
		var time = Date.now();
		if (!this.settings.chatData) this.settings.chatData = {};
		if (!this.settings.chatData[user]) this.settings.chatData[user] = {};
		var chatData = this.settings.chatData[user];
		if (!chatData[room]) chatData[room] = {times:[], points:0, lastAction:0};
		chatData = chatData[room];

		chatData.times.push(time);

		// this deals with punishing rulebreakers, but note that the bot can't think, so it might make mistakes
		if (config.allowmute && config.tourwatchrooms.indexOf(room) === -1 && this.hasRank(this.ranks[room] || ' ', '%@&#~') && config.whitelist.indexOf(user) === -1) {
			var useDefault = !(this.settings['modding'] && this.settings['modding'][room]);
			var pointVal = 0;
			var muteMessage = '';
			var modSettings = useDefault ? null : this.settings['modding'][room];

			// moderation for banned words
			if (useDefault || modSettings['bannedwords'] !== false && pointVal < 2) {
				var banphraseSettings = this.settings.banwords;
				var bannedPhrases = !!banphraseSettings ? (banphraseSettings[room] || []) : [];
				for (var i = 0; i < bannedPhrases.length; i++) {
					if (msg.toLowerCase().indexOf(bannedPhrases[i]) > -1) {
						pointVal = 2;
						muteMessage = ', Questa frase/parola è bannata';
						break;
					}
				}
			}
			// moderation for flooding (more than x lines in y seconds)
			var times = chatData.times;
			var isFlooding = (times.length >= FLOOD_MESSAGE_NUM && (time - times[times.length - FLOOD_MESSAGE_NUM]) < FLOOD_MESSAGE_TIME
				&& (time - times[times.length - FLOOD_MESSAGE_NUM]) > (FLOOD_PER_MSG_MIN * FLOOD_MESSAGE_NUM));
			if ((useDefault || modSettings['flooding'] !== false) && isFlooding) {
				if (pointVal < 2) {
					pointVal = 2;
					muteMessage = ', Scrivi tutto in un messaggio';
				}
			}
			// moderation for caps (over x% of the letters in a line of y characters are capital)
			var capsMatch = msg.replace(/[^A-Za-z]/g, '').match(/[A-Z]/g);
			var isCaps = capsMatch && capsMatch.length > MIN_CAPS_LENGTH && (capsMatch.length >= Math.floor(toId(msg).length * MIN_CAPS_PROPORTION));
			if ((useDefault || modSettings['caps'] !== false) && isCaps) {
				var isLongCaps = (toId(msg).length > MIN_CAPS_LENGTH * 2) ? true : false;
				if (pointVal < 1 || (isLongCaps && pointVal < 2)) {
					pointVal = isLongCaps ? 2 : 1;
					muteMessage = ', Non scrivere tutto in maiuscolo';
				}
			}
			// moderation for stretching (over x consecutive characters in the message are the same)
			var stretchMatch = msg.toLowerCase().match(/(.)\1{7,}/g) || msg.toLowerCase().match(/(..+)\1{4,}/g); // matches the same character (or group of characters) 8 (or 5) or more times in a row
			if ((useDefault || modSettings['stretching'] !== false) && stretchMatch) {
				isLongStretch = (stretchMatch.join("").length > 25) ? true : false;
				if (pointVal < 1 || (isLongStretch && pointVal < 2)) {
					pointVal = isLongStretch ? 2 : 1;
					muteMessage = ', Non scrivere così tante lettere uguali';
				}
			}

			if (pointVal > 0 && !(time - chatData.lastAction < ACTION_COOLDOWN)) {
				var cmd = 'mute';
				// defaults to the next punishment in config.punishVals instead of repeating the same action (so a second warn-worthy
				// offence would result in a mute instead of a warn, and the third an hourmute, etc)
				if (chatData.points >= pointVal && pointVal < 4) {
					chatData.points++;
					cmd = config.punishvals[chatData.points] || cmd;
				} else { // if the action hasn't been done before (is worth more points) it will be the one picked
					cmd = config.punishvals[pointVal] || cmd;
					chatData.points = pointVal; // next action will be one level higher than this one (in most cases)
				}
				if (config.privaterooms.indexOf(room) >= 0 && cmd === 'warn') cmd = 'mute'; // can't warn in private rooms
				// if the bot has % and not @, it will default to hourmuting as its highest level of punishment instead of roombanning
				if (chatData.points >= 4 && !this.hasRank(this.ranks[room] || ' ', '@&#~')) cmd = 'hourmute';
				chatData.lastAction = time;
				this.say(connection, room, '/' + cmd + ' ' + user + muteMessage);
			}
		}
	},

	writeSettings: (function() {
		var writing = false;
		var writePending = false; // whether or not a new write is pending
		var finishWriting = function() {
			writing = false;
			if (writePending) {
				writePending = false;
				this.writeSettings();
			}
		};
		return function() {
			if (writing) {
				writePending = true;
				return;
			}
			writing = true;
			var data = JSON.stringify(this.settings);
			fs.writeFile('settings.json.0', data, function() {
				// rename is atomic on POSIX, but will throw an error on Windows
				fs.rename('settings.json.0', 'settings.json', function(err) {
					if (err) {
						// This should only happen on Windows.
						fs.writeFile('settings.json', data, finishWriting);
						return;
					}
					finishWriting();
				});
			});
		};
	})(),
	uncacheTree: function(root) {
		var uncache = [require.resolve(root)];
		do {
			var newuncache = [];
			for (var i = 0; i < uncache.length; ++i) {
				if (require.cache[uncache[i]]) {
					newuncache.push.apply(newuncache,
						require.cache[uncache[i]].children.map(function(module) {
							return module.filename;
						})
					);
					delete require.cache[uncache[i]];
				}
			}
			uncache = newuncache;
		} while (uncache.length > 0);
	}
};
