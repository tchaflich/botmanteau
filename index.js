
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config');
const portmanteau = require('./portmanteau');

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

let canReply = function(message) {
	// reply to all except bots
	return (message && message.author && !message.author.bot);
};

let parseMessage = function(message) {
	const p = new portmanteau(message);
	return p.parse();
};

client.on('message', msg => {
	if (!canReply(msg)) {
		return;
	}

	let standard = {
		'ping': 'pong',
		'marco': 'polo',
		'bad bot': ':sob:',
		'good bot': ':smiley:',
	};

	if (msg.content && msg.content.toLowerCase() in standard) {
		msg.reply(standard[msg.content.toLowerCase()]);
		return;
	}

	let reply = parseMessage(msg);
	if (reply) {
		msg.reply(reply);
	}
});

client.login(config.APIToken);