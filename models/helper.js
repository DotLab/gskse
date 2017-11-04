var debug = require('debug')('gskse:models');
var ObjectId = require('mongoose').Schema.Types.ObjectId;

exports.localeOption = [ 'en', 'ja', 'zh-hans', 'zh-hant' ];

exports.orderAction = [ 'buy', 'sell' ];
exports.orderType = [ 'private', 'limit', 'market' ];
exports.orderDuration = [ 'day', 'gtc', 'ioc', '1m', '3m', '5m' ];

exports.locale = function(schema) {
	return exports.localeOption.reduce(function(obj, value) {
		obj[value] = schema;

		return obj;
	}, {});
};

exports.unsigned = function() {
	return { type: Number, required: true, min: 0 };
};

exports.signed = function() {
	return { type: Number, required: true };
};

exports.boolean = function() {
	return { type: Boolean, required: true };
};

exports.date = function() {
	return { type: Date, required: true };
};

exports.ref = function(name) {
	return { type: ObjectId, ref: name, required: true };
};

exports.string = function() {
	return { type: String, required: true };
};

exports.stringMatch = function(regexp) {
	return { type: String, required: true, match: regexp };
};

exports.stringEnum = function(arr) {
	return { type: String, required: true, enum: arr };
};

exports.stringMatch = function(regexp) {
	return { type: String, required: true, match: regexp };
};

exports.stringUnique = function() {
	return { type: String, required: true, index: true, unique: true };
};

exports.stringUniqueMatch = function(regexp) {
	return { type: String, required: true, index: true, unique: true, match: regexp };
};

