var path = require('path');

exports.appRoot = path.resolve(__dirname);
exports.getPath = function() { return Array.prototype.reduce.call(arguments, (a, b) => path.join(a, b), exports.appRoot); };
exports.getUploadPath = file => exports.getPath('public', 'upload', file);
exports.getModel = model => require(exports.getPath('models', model));
exports.getController = model => require(exports.getPath('controllers', model));
exports.getJob = job => require(exports.getPath('jobs', job));

exports.getLastMidnight = function() { 
	var d = new Date(); 
	d.setHours(0, 0, 0, 0); 
	return d; 
};
exports.getWeeksAgo = function(n) { 
	var d = new Date(); 
	d.setDate(d.getDate() - 7 * n); 
	d.setHours(0, 0, 0, 0); 
	return d; 
};
exports.get52WeekAgo = () => exports.getWeeksAgo(52);
exports.get1WeekAgo = () => exports.getWeeksAgo(1);

exports.getCurrentMinute = function() {
	var d = new Date(); 
	d.setSeconds(60, 0);
	return d; 
};
exports.getCurrentHour = function() {
	var d = new Date(); 
	d.setMinutes(60, 0, 0); 
	return d; 
};
exports.getCurrentDay = function() {
	var d = new Date(); 
	d.setHours(24, 0, 0, 0); 
	return d; 
};

exports.epoch = new Date(0);
exports.ghost = require('mongoose').Types.ObjectId('000000000000000000000000');

exports.startFund = 10000;

exports.avatarWidth = 128;
exports.avatarHeight = 128;

exports.heroWidth = 256;
exports.heroHeight = 144;

exports.corpLegalFees = 300;

exports.corpTaxRate = 0.2;
exports.corpCeoCut = 0.05;
exports.corpRevenueCut = 0.5;
exports.corpDividenCut = 0.25;  // 1 - corpTaxRate - corpCeoCut - corpRevenueCut

exports.salaryTaxRate = 0.2;

exports.offerRevenueThreshold = 100000000;
exports.offerLockUpDays = 3;
exports.offerFees = 5000000;
exports.offerCut = 0.08;

exports.getCorpRevenue = (g, c) => g * Math.pow(c, 2) * 3000;

exports.getCorpRevenueBreak = r => {
	var tax = Math.round(r * exports.corpTaxRate);
	var ceo = Math.round(r * exports.corpCeoCut);
	var revenue = Math.round(r * exports.corpRevenueCut);
	var dividen = r - tax - ceo - revenue;
	return { tax: tax, ceo: ceo, revenue: revenue, dividen: dividen };
};

exports.getTaxedSalary = s => Math.round(s * (1 - exports.salaryTaxRate));

exports.getOfferLockUp = () => {
	var lockUp = new Date(Date.now());
	lockUp.setDate(lockUp.getDate() + exports.offerLockUpDays);
	return lockUp;
};

exports.getOfferFund = f => Math.round(f * (1 - exports.offerCut));

exports.getOrderExpiration = d => {
	var date = new Date();
	switch (d) {
		case 'day':
			date.setDate(date.getDate() + 1);
			return date;
		case 'gtc':
			date.setDate(date.getDate() + 30);
			return date;
		case 'ioc':  // fall through
		case '1m':
			date.setMinutes(date.getMinutes() + 1);
			return date;
		case '3m':
			date.setMinutes(date.getMinutes() + 3);
			return date;
		case '5m':
			date.setMinutes(date.getMinutes() + 5);
			return date;
	}
};

exports.status = {
	bad_request: 	() => { var err = { status: 400, name: 'Bad Request', message: 'The server cannot or will not process the request due to an apparent client error (e.g., malformed request syntax, size too large, invalid request message framing, or deceptive request routing).' }; Error.captureStackTrace(err); return err; },
	unauthorized: 	() => { var err = { status: 401, name: 'Unauthorized', message: 'Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided. You do not have the necessary credentials.' }; Error.captureStackTrace(err); return err; },
	too_poor: 		() => { var err = { status: 402, name: 'Payment Required', message: 'You are too poor to complete the transaction.' }; Error.captureStackTrace(err); return err; },
	forbidden: 		() => { var err = { status: 403, name: 'Forbidden', message: 'The request was valid, but the server is refusing action. You might not have the necessary permissions for a resource, or may need an account of some sort.' }; Error.captureStackTrace(err); return err; },
	not_found: 		() => { var err = { status: 404, name: 'Not Found', message: 'The requested resource could not be found but may be available in the future. Subsequent requests by the client are permissible.' }; Error.captureStackTrace(err); return err; },
	confilct: 		() => { var err = { status: 409, name: 'Conflict', message: 'The request could not be processed because of conflict in the request, such as an edit conflict between multiple simultaneous updates.' }; Error.captureStackTrace(err); return err; },

	not_implemented: 	() => { var err = { status: 501, name: 'Not Implemented', message: 'The server either does not recognize the request method, or it lacks the ability to fulfill the request. Usually this implies future availability (e.g., a new feature of a web-service API).' }; Error.captureStackTrace(err); return err; },
	unavailable: 		() => { var err = { status: 503, name: 'Service Unavailable', message: 'The server is currently unavailable (because it is overloaded or down for maintenance). Generally, this is a temporary state.' }; Error.captureStackTrace(err); return err; },
};