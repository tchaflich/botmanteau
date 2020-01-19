require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const portmanteau = require('./portmanteau');

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});


/**
 * Issue a reply, if applicable
 *
 * @param {object} message
 */
function parseMessage(message) {


	let porter = new portmanteau();
	let reply = porter.parse(message.content);
	if (reply) {
		message.channel.send(reply);
	}
};

/**
 * If possible, send a canned reply to the channel
 *
 * @param {object} message
 * @returns {boolean} If a canned reply was sent
 */
function sendCannedReply(message) {
	let standard = {
		'bad bot': ':sob: https://github.com/tchaflich/botmanteau/issues',
		'good bot': 'Thanks, I do my best :thumbsup:',
	};

	if (message.content && message.content.toLowerCase() in standard) {
		message.channel.send(standard[message.content.toLowerCase()]);
		return true;
	}

	return false;
}


/**
 * Using a message list, find out if the bot sent
 * any responses recently
 *
 * If it has, the cooldown applies (return true)
 *
 * @param {array} messages
 * @returns {boolean}
 */
function doesCooldownApply(messages, cooldownMinutes) {
	const now = new Date().getTime();
	const cooldown = cooldownMinutes * 60 * 1000;

	let applicable = messages.find((m) => {
		if (m.author.id !== client.user.id) {
			return false;
		}
		if (m.createdTimestamp < (now - cooldown)) {
			return false;
		}
		return true;
	});

	if (applicable) {
		return true;
	}

	return false;
}


/**
 * Was the sent message address to this bot?
 *
 * @param {object} message
 */
function isAddressedToBot(message) {
	return !!(message && message.mentions && message.mentions.users && message.mentions.users.find((u) => {
		return u.id === client.user.id;
	}));
}


client.on('message', message => {
	// cannot reply to non-authored or bot messages

	if (!(message && message.author && !message.author.bot)) {
		return;
	}

	// check cooldown (not for direct messages)

	if (message.channel.type === 'dm' || isAddressedToBot(message)) {
		if (sendCannedReply(message)) {
			return;
		}
		parseMessage(message);
	} else {
		message.channel.fetchMessages().then((messages) => {
			// only send standard responses after 5 minutes;
			// canned responses must have a bot message within the past minute,
			// otherwise it's probably addressed to some other bot
			if (!doesCooldownApply(messages, 5)) {
				parseMessage(message);
			} else if (doesCooldownApply(messages, 1)) {
				sendCannedReply(message);
			}
		});
	}
});

client.login(process.env.APIToken);
