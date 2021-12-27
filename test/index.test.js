var assert = require("assert");
var mdProcessor = require("markdown-it");
var plugin = require("../index");
var expect = require("expect.js");
var options;
describe("Array", function () {
	// Basic, let's make sure everything is working
	describe("#indexOf()", function () {
		it("should return -1 when the value is not present", function () {
			assert.equal([1, 2, 3].indexOf(4), -1);
		});
	});
});

describe("Plugin Initiation", function () {
	before(function () {
		// runs once before the first test in this block
		options = {
			html: true,
			breaks: true,
			linkify: true,
		};
	});
	it("should not initiate without an array", function () {
		expect(() => mdProcessor(options).use(plugin, {})).to.throwException(
			/Markdown-It-Find-and-Replace requires that options\.replaceRules be an array\./
		);
		expect(() =>
			mdProcessor(options).use(plugin, {
				defaults: false,
				replaceRules: {},
			})
		).to.throwException(
			/Markdown-It-Find-and-Replace requires that options\.replaceRules be an array\./
		);
	});
	it("should not initiate with malformed replaceRules pattern", function () {
		expect(() =>
			mdProcessor(options).use(plugin, {
				defaults: false,
				replaceRules: [
					{
						pattern: 1,
						replace: "probably",
					},
				],
			})
		).to.throwException(
			/Markdown-It-Find-and-Replace requires that patterns be `RegExp` or a string/
		);
	});
	it("should not initiate with malformed replaceRules replace", function () {
		expect(() =>
			mdProcessor(options).use(plugin, {
				defaults: false,
				replaceRules: [
					{
						pattern: new RegExp(/prob/g),
						replace: {},
					},
				],
			})
		).to.throwException(
			/Markdown-It-Find-and-Replace requires that replace arguments be a string/
		);
	});
	it("should initiate with default arguments", function () {
		expect(() => mdProcessor(options).use(plugin)).to.not.throwException();
		expect(() =>
			mdProcessor(options).use(plugin, {
				defaults: true,
			})
		).to.not.throwException();
	});
});

describe("Plugin Process Running as Expected", function () {
	before(function () {
		// runs once before the first test in this block
		options = {
			html: true,
			breaks: true,
			linkify: true,
		};
	});
	it("should properly replace using default patterns", function () {
		var md = mdProcessor(options).use(plugin, {
			defaults: true,
		});
		var renderResult = md.render("Prob this will work");
		assert.equal(
			renderResult,
			`<p data-wordfix="true">Probably this will work</p>\n`
		);
		var renderResultTwo = md.render("Prob this will transform a graf");
		assert.equal(
			renderResultTwo,
			`<p data-wordfix="true">Probably this will transform a paragraph</p>\n`
		);
		var renderResultThree = md.render(
			"Prob this will transform a graf\n\n and it will b/c this works."
		);
		assert.equal(
			renderResultThree,
			`<p data-wordfix="true">Probably this will transform a paragraph</p>\n<p data-wordfix="true">and it will because this works.</p>\n`
		);
	});
	it("should properly replace using custom patterns", function () {
		var md = mdProcessor(options).use(plugin, {
			defaults: false,
			replaceRules: [
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
					pattern: /(?<=[\t\s\( ])b\/c(?=[\?\.\,\s\r\n\!\) ])/gi,
					replace: "because",
				},
			],
		});
		var renderResult = md.render("Prob this will work");
		assert.equal(
			renderResult,
			`<p data-wordfix="true">Probably this will work</p>\n`
		);
		var renderResultTwo = md.render("Prob this will transform a graf");
		assert.equal(
			renderResultTwo,
			`<p data-wordfix="true">Probably this will transform a paragraph</p>\n`
		);
		var renderResultThree = md.render(
			"Prob this will transform a graf\n\n and it will b/c this works."
		);
		assert.equal(
			renderResultThree,
			`<p data-wordfix="true">Probably this will transform a paragraph</p>\n<p data-wordfix="true">and it will because this works.</p>\n`
		);
	});
	it("should properly replace using a mix of custom patterns and defaults", function () {
		var md = mdProcessor(options).use(plugin, {
			defaults: true,
			replaceRules: [
				{
					pattern: /(?<=[\t\s\( ])tform(?=[\?\.\,\s\r\n\!\) ]|$)/g,
					replace: "transform",
				},
			],
		});
		var renderResult = md.render("Prob this will work");
		assert.equal(
			renderResult,
			`<p data-wordfix="true">Probably this will work</p>\n`
		);
		var renderResultTwo = md.render("Prob this will tform a graf");
		assert.equal(
			renderResultTwo,
			`<p data-wordfix="true">Probably this will transform a paragraph</p>\n`
		);
		var renderResultThree = md.render(
			"Prob this will tform a graf\n\n and it will b/c this works."
		);
		assert.equal(
			renderResultThree,
			`<p data-wordfix="true">Probably this will transform a paragraph</p>\n<p data-wordfix="true">and it will because this works.</p>\n`
		);
	});
});
