"use strict";

const isInline = (token) => token && token.type === "inline";
const hasMyWords = (token, myWords) => {
	if (token) {
		// myWords().forEach((word) => {
		for (let i = 0; i < myWords.length; i++) {
			if (myWords[i].pattern.test(token.content)) {
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

function isMyWords(tokens, index, myWords) {
	return isInline(tokens[index]) && hasMyWords(tokens[index], myWords);
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

function fixWordify(token, TokenConstructor, myWords) {
	// const { betterWord, wordChoice } = fixMyWords(token, TokenConstructor);
	// token.children.unshift(betterWord);
	if (!token || !token.content) return false;
	//const sliceIndex = wordChoice.length;
	const replaceMe = myWords;
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

module.exports = (
	md,
	options = {
		defaults: true,
		replaceRules: [],
	}
) => {
	if (options.defaults && !options.hasOwnProperty("replaceRules")) {
		options.replaceRules = [];
	}
	if (!Array.isArray(options.replaceRules)) {
		throw new Error(
			"Markdown-It-Find-and-Replace requires that options.replaceRules be an array."
		);
	}
	if (options.defaults) {
		options.replaceRules.push(
			...[
				{
					pattern: /(?<=[\t\s\S\( ])11ty(?=[\?\.\,\s\r\n\!\) ]|$)/gi,
					replace: "Eleventy",
				},
				{
					pattern: /(?<=[\t\s\( ])prob(?=[\?\.\,\s\r\n\!\) ]|$)/g,
					replace: "probably",
				},
				{
					pattern: /(?<=[\t\s\( ]|^)Prob(?=[\?\.\,\s\r\n\!\) ])/g,
					replace: "Probably",
				},
				{
					pattern: /(?<=[\t\s\( ])graf(?=[\?\.\,\s\r\n\!\) ]|$)/g,
					replace: "paragraph",
				},
				{
					pattern: /(?<=[\t\s\( ]|^)Graf(?=[\?\.\,\s\r\n\!\) ])/g,
					replace: "Paragraph",
				},
				{
					pattern: /(?<=[\t\s\( ])b\/c(?=[\?\.\,\s\r\n\!\) ]|$)/g,
					replace: "because",
				},
				{
					pattern: /(?<=[\t\s\( ]|^)B\/c(?=[\?\.\,\s\r\n\!\) ])/g,
					replace: "Because",
				},
				{
					pattern: /(?<=[\t\s\( ])def(?=[\?\.\,\s\r\n\!\) ]|$)/g,
					replace: "definitely",
				},
				{
					pattern: /(?<=[\t\s\( ]|^)Def(?=[\?\.\,\s\r\n\!\) ])/g,
					replace: "Definitely",
				},
				{
					pattern: /(?<=[\t\s\( ])tho(?=[\?\.\,\s\r\n\!\) ]|$)/g,
					replace: "though",
				},
				{
					pattern: /(?<=[\t\s\( ]|^)Tho(?=[\?\.\,\s\r\n\!\) ])/g,
					replace: "Though",
				},
			]
		);
	}
	if (options.replaceRules.length) {
		options.replaceRules.forEach((wordRule) => {
			if (
				!wordRule.hasOwnProperty("pattern") ||
				(!(wordRule.pattern instanceof RegExp) &&
					!(typeof wordRule.pattern === "string"))
			) {
				console.log("Broken wordRule", wordRule);
				throw new Error(
					"Markdown-It-Find-and-Replace requires that patterns be `RegExp` or a string"
				);
			}
			if (
				!wordRule.hasOwnProperty("replace") ||
				!(typeof wordRule.replace === "string")
			) {
				console.log("Broken wordRule", wordRule);
				throw new Error(
					"Markdown-It-Find-and-Replace requires that replace arguments be a string"
				);
			}
		});
		let myWords = options.replaceRules;
		md.core.ruler.after("inline", "find-and-replace", (state) => {
			const tokens = state.tokens;
			for (let i = 0; i < tokens.length; i++) {
				if ((tokens, isMyWords(tokens, i, myWords))) {
					// console.log("Trying to fix some words!");
					fixWordify(tokens[i], state.Token, myWords);
					setAttr(tokens[i - 1], "data-wordfix", "true");
				}
			}
		});
	}
};
