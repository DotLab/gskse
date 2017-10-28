module.exports = {
	epoch: new Date(0),
	ghost: require('mongoose').Types.ObjectId('000000000000000000000000'),
	
	startFund: 10000,

	avatarWidth: 128,
	avatarHeight: 128,

	heroWidth: 256,
	heroHeight: 144,

	corpLegalFees: 300,
	
	corpTaxRate: 0.2,
	corpCeoCut: 0.05,
	corpRevenueCut: 0.5,
	corpDividenCut: 0.25,  // 1 - corpTaxRate - corpCeoCut - corpRevenueCut

	salaryTaxRate: 0.2,

	offerRevenueThreshold: 100000000,
	offerLockUpDays: 3,
	offerFees: 5000000,
	offerCut: 0.08,

	getCorpRevenue: (g, c) => g * c ** 2 * 3000,
	getCorpRevenueBreak: r => {
		var tax = Math.round(r * gskse.corpTaxRate);
		var ceo = Math.round(r * gskse.corpCeoCut);
		var revenue = Math.round(r * gskse.corpRevenueCut);
		var dividen = r - tax - ceo - revenue;
		return { tax: tax, ceo: ceo, revenue: revenue, dividen: dividen };
	},

	getSalary: s => Math.round(s * (1 - gskse.salaryTaxRate)),

	getOfferLockUp: () => {
		var lockUp = new Date(Date.now());
		lockUp.setDate(lockUp.getDate() + gskse.offerLockUpDays);
		return lockUp;
	},

	getOfferFund: f => Math.round(f * (1 - gskse.offerCut)),

	getOrderExpiration: d => {
		var date = new Date(Date.now());
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
	},

	status: {
		bad_request: 	{ status: 400, name: 'Bad Request', message: 'The server cannot or will not process the request due to an apparent client error (e.g., malformed request syntax, size too large, invalid request message framing, or deceptive request routing).' },
		unauthorized: 	{ status: 401, name: 'Unauthorized', message: 'Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided. You do not have the necessary credentials.' },
		too_poor: 		{ status: 402, name: 'Payment Required', message: 'You are too poor to complete the transaction.' },
		forbidden: 		{ status: 403, name: 'Forbidden', message: 'The request was valid, but the server is refusing action. You might not have the necessary permissions for a resource, or may need an account of some sort.' },
		not_found: 		{ status: 404, name: 'Not Found', message: 'The requested resource could not be found but may be available in the future. Subsequent requests by the client are permissible.' },
		confilct: 		{ status: 409, name: 'Conflict', message: 'The request could not be processed because of conflict in the request, such as an edit conflict between multiple simultaneous updates.' },

		not_implemented: 	{ status: 501, name: 'Not Implemented', message: 'The server either does not recognize the request method, or it lacks the ability to fulfill the request. Usually this implies future availability (e.g., a new feature of a web-service API).' },
		unavailable: 		{ status: 503, name: 'Service Unavailable', message: 'The server is currently unavailable (because it is overloaded or down for maintenance). Generally, this is a temporary state.' },
	},
};