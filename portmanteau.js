
class portmanteau {

	constructor(msg) {
		this.message = msg;
	}


	/**
	 * Main; call other functions
	 * Returns a formatted reply message if found;
	 * otherwise returns null
	 *
	 * @returns {string}
	 */
	parse() {
		let split = this.getSplitContent();
		if (!split) {
			return null;
		}

		let found = this.findPortmanteau(split);
		if (!found) {
			return null;
		}

		return this.formatReply.apply(this, found);
	}


	/**
	 * Get the content of the message, split into words
	 *
	 * @returns {Array.<string>}
	 */
	getSplitContent() {
		if (!this.message || !this.message.content) {
			return [];
		}

		return this.message.content.split(/\s+/g);
	}


	/**
	 * Is a single word worthy of being made into a portmanteau?
	 *
	 * @param {string} word
	 * @return {boolean}
	 */
	isInputWordWorthy(word) {
		if (!word || word.length < 5) {
			return false;
		}

		let bad = [
			/ing^/i
		];

		let i;
		for (i = 0; i < bad.length; i++) {
			if (bad[i].test(word)) {
				return false;
			}
		}

		return true; // A WORTHY SACRIFICE
	}


	/**
	 * Good bot, or bad bot?
	 *
	 * @param {boolean} result
	 */
	isOutputWorthy(result) {
		if (result[2].length > Math.min(result[0].length, result[1].length)) {
			return false;
		}

		return true; // todo more control on output
	}


	splitWord(word, numberOfLetters) {
		let splits = [];
		let i;
		for (i = 0; i < word.length - numberOfLetters + 1; i++) {
			splits.push(word.substr(i, numberOfLetters).toLowerCase());
		}
		return splits;
	}


	/**
	 * Can this word pair be made into a portmanteau?
	 * If not, returns null;
	 * If so, returns the portmanteau
	 *
	 * @param {string} firstWord
	 * @param {string} secondWord
	 * @returns {?string}
	 */
	checkWordPair(firstWord, secondWord) {
		// is there an easy overlap to be found?
		let firstSplit = this.splitWord(firstWord, 3);
		let secondSplit = this.splitWord(secondWord, 3);

		let i;
		for (i = 0; i < firstSplit.length; i++) {
			let j = secondSplit.indexOf(firstSplit[i]);
			if (j !== -1) {
				// gottem
				return firstWord.substr(0, i) + secondWord.substr(j);
			}
		}

		return null;
	}


	/**
	 * Finds the first available portmanteau in a list of word-strings
	 * If none are found, returns null
	 * If one is found, returns an array of strings containing:
	 * - 0 - the first input word
	 * - 1 - the second input word
	 * - 2 - the merged word
	 *
	 * @param {array.<string>} content
	 * @returns {?array.<string>}
	 */
	findPortmanteau(content) {
		if (content.length < 2) {
			return null;
		}

		let i;
		for (i = 0; i < content.length - 1; i++) {
			// check input words
			if (!this.isInputWordWorthy(content[i])) {
				continue;
			}
			if (!this.isInputWordWorthy(content[i + 1])) {
				i++;
				continue; // continue 2
			}

			// find output
			let result = this.checkWordPair(content[i], content[i + 1]);
			if (result && this.isOutputWorthy(result)) {
				return [
					content[i],
					content[i + 1],
					result
				];
			}
		}

		return null;
	}


	/**
	 * Take the results and put them into an actual markdown response
	 *
	 * @param {string} firstWord
	 * @param {string} secondWord
	 * @param {string} mergedWord
	 *
	 * @returns {string}
	 */
	formatReply(firstWord, secondWord, mergedWord) {
		return (
			'\n> ' +
			firstWord + ' ' + secondWord +
			'\n' +
			mergedWord
		);
	}

}

module.exports = portmanteau;


