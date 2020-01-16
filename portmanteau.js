
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

		return this.message.content.split(/\W+/g);
	}


	/**
	 * Is a single word worthy of being made into a portmanteau?
	 *
	 * @param {string} word
	 * @return {boolean}
	 */
	isInputWordWorthy(word) {
		if (!word || word.length < 3) {
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
		// make sure the merged word isn't too short (based on shorter input word)
		if (result[2].length < Math.min(result[0].length, result[1].length)) {
			return false;
		}

		// if the output has 3+ of the same character in a row, fail
		let i;
		if (/(\w)\1{2}/i.test(result[2])) {
			return false;
		}

		// if the output is the same as one of the inputs, fail
		if (result[2].toLowerCase() === result[0].toLowerCase() || result[2].toLowerCase() === result[1].toLowerCase()) {
			return false;
		}

		return true;
	}


	getWordChunks(word, numberOfLetters) {
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
		let i;
		let ilen;

		// check for matches at the end of FW and the beginning of SW
		// must have between 2 & minlength-1 characters matching

		ilen = Math.min(firstWord.length, secondWord.length);
		for (i = 2; i < ilen; i++) {
			if (firstWord.substr(-1 * i) === secondWord.substr(0, i)) {
				return firstWord + secondWord.substr(i);
			}
		}

		// is there an easy three-character overlap to be found?

		let firstChunks = this.getWordChunks(firstWord, 3);
		let secondChunks = this.getWordChunks(secondWord, 3);

		ilen = firstChunks.length;
		for (i = 0; i < ilen; i++) {
			let j = secondChunks.indexOf(firstChunks[i]);
			if (j !== -1) {
				// gottem
				return firstWord.substr(0, i) + secondWord.substr(j);
			}
		}

		let clean = (a) => {
			return a;
		};

		// look for vowel matches
		// prefer double-match

		const vowelifier = /([aeiou]+)/g;
		let firstSplit = firstWord.toLowerCase().split(vowelifier).filter(clean);
		let secondSplit = secondWord.toLowerCase().split(vowelifier).filter(clean);

		ilen = firstSplit.length;
		for (i = 0; i < ilen; i++) {
			if (!(vowelifier.test(firstSplit[i]))) {
				continue;
			}
			let k = secondSplit.indexOf(firstSplit[i]);
			if (k === -1) {
				continue;
			}
			if (secondSplit[k + 2] && secondSplit[k + 2] === firstSplit[i + 2]) {
				return ([]
					.concat(firstSplit.slice(0, i + 1))
					.concat(secondSplit.slice(k + 1))
				).join('');
			}
		}

		// look for any vowel match
		// prefer end of first word, beginning of second
		let m;
		let n;
		let mlen = firstSplit.length;
		let nlen = secondSplit.length;

		for (m = mlen - 1; m >= 0; m--) {
			if (m < mlen / 2) {
				continue;
			}
			if (!vowelifier.test(firstSplit[m])) {
				continue;
			}
			for (n = 0; n < nlen; n++) {
				if (n > nlen / 2) {
					continue;
				}
				if (!vowelifier.test(secondSplit[n])) {
					continue;
				}

				if (firstSplit[m] === secondSplit[n]) {
					return ([]
						.concat(firstSplit.slice(0, m))
						.concat(secondSplit.slice(n))
					).join('');
				}
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

			// make sure we aren't merging the same thing to itself
			if (content[i].toLowerCase() === content[i + 1].toLowerCase()) {
				continue;
			}

			// find output
			let result = this.checkWordPair(content[i], content[i + 1]);
			if (result && this.isOutputWorthy([content[i], content[i + 1], result])) {
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
			(process.env.TEST ? '[test] ' : '') +
			mergedWord
		);
	}

}

module.exports = portmanteau;


