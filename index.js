"use strict";

/**
const Plugin = require("../markdown-it-regexp");

module.exports = Plugin(/s11tys/g, (match, utils) => {
	console.log("Markdown It shorthand match", match);
	return String(` Eleventy `);
});
 */

// A nice reference on this - https://docs.joshuatz.com/cheatsheets/node-and-npm/markdown-it/

const myWords = () => {
	return [
		{
			pattern: /(?<=[\t\s\S\( ])11ty(?=[\?\.\,\s\r\n\!\) ])/gi,
			replace: "Eleventy",
		},
		{
			pattern: /(?<=[\t\s\( ])prob(?=[\?\.\,\s\r\n\!\) ])/gi,
			replace: "probably",
		},
		{
			pattern: /(?<=[\t\s\( ])graf(?=[\?\.\,\s\r\n\!\) ])/gi,
			replace: "paragraph",
		},
		{
			pattern: /(?<=[\t\s\( ])b\/c(?=[\?\.\,\s\r\n\!\) ])/gi,
			replace: "because",
		},
		{
			pattern: /(?<=[\t\s\( ])def(?=[\?\.\,\s\r\n\!\) ])/gi,
			replace: "definitely",
		},
	];
};

const isInline = (token) => token && token.type === "inline";
const hasMyWords = (token) => {
	if (token) {
		// myWords().forEach((word) => {
		for (let i = 0; i < myWords().length; i++) {
			if (myWords()[i].pattern.test(token.content)) {
				// console.log("Word Replacement Time");
				return true;
			}
		}
	}
	return false;
};

function setAttr(token, name, value) {
	const index = token.attrIndex(name);
	const attr = [name, value];

	if (index < 0) {
		token.attrPush(attr);
	} else {
		token.attrs[index] = attr;
	}
}

function isMyWords(tokens, index) {
	return (
		isInline(tokens[index]) &&
		// isParagraph(tokens[index - 1]) &&
		hasMyWords(tokens[index])
	);
}

function fixMyWords(wordReplace, token, TokenConstructor) {
	if (token.tag == "code") {
		// Don't change text inside codeblocks
		// console.log("do not replace text in code", token.type, token.tag);
		return;
	}
	const betterWord = new TokenConstructor("inline", "", 0);
	const replaced = token.content.replace(
		wordReplace.pattern,
		wordReplace.replace
	);
	if (replaced) {
		// console.log(token);
		betterWord.content = replaced;
		token.content = betterWord.content;
	}
}

function fixWordify(token, TokenConstructor) {
	// const { betterWord, wordChoice } = fixMyWords(token, TokenConstructor);
	// token.children.unshift(betterWord);
	if (!token || !token.content) return false;
	//const sliceIndex = wordChoice.length;
	const replaceMe = myWords();
	try {
		// console.log("Run Replacement.");
		replaceMe.forEach((wordReplace) => {
			fixMyWords(wordReplace, token, TokenConstructor);
			for (let i = 0; i < token.children.length; i++) {
				fixMyWords(wordReplace, token.children[i], TokenConstructor);
			}
			/**
			const betterWord = new TokenConstructor("inline", "", 0);
			const replaced = token.content.replace(
				wordReplace.pattern,
				wordReplace.replace
			);
			if (replaced) {
				betterWord.content = replaced;
				token.content = betterWord.content;
				token.children[0].content = betterWord.content;
			}
			*/
			// console.log("token:", token);
		});
	} catch (e) {
		console.log(
			"Could not replace content in token: ",
			token.content,
			token.children[0].content,
			token
		);
		console.log(e);
	}
	//token.content = token.content.replace(wordChoice, betterWord.content);
	//const fixedContent = new TokenConstructor("inline", "", 0);
	//fixedContent.content = token.content;
	// token.children[0].content = token.children[0].content.replace(
	//	wordChoice,
	//	betterWord.content
	// );
	// token.children[0].content = fixedContent.content;
	// console.log("token:", token);
}

module.exports = (md) => {
	md.core.ruler.after("inline", "short-phrase-fixer", (state) => {
		const tokens = state.tokens;
		// console.log("Walking through possible words to fix3");
		for (let i = 0; i < tokens.length; i++) {
			if ((tokens, isMyWords(tokens, i))) {
				// console.log("Trying to fix some words!");
				fixWordify(tokens[i], state.Token);
				setAttr(tokens[i - 1], "data-wordfix", "true");
			}
		}
	});
};

/**
module.exports = (markdownSetup) => {
	var defaultRender =
		markdownSetup.renderer.rules.fix_my_words ||
		function (tokens, idx, options, env, self) {
			return self.renderToken(tokens, idx, options);
		};
	markdownSetup.renderer.rules.fix_my_words = function (
		tokens,
		idx,
		options,
		env,
		self
	) {
		for (let i = 0; i < tokens.length; i++) {
			if (isMyWords(tokens, i)) {
				console.log("Trying to fix some words!");
				fixWordify(tokens[i], tokens);
				setAttr(tokens[i - 1], "data-wordfix", "true");
			}
		}

		// pass token to default renderer.
		return defaultRender(tokens, idx, options, env, self);
	};
};
*/
