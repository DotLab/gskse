var debug = require('debug')('gskse:test:gskse');
var should = require('should');
var gskse = require('../config');

describe('gskse', function() {
	describe('::getCorpRevenue', function() {
		it('should be positive', function() {
			gskse.getCorpRevenue(1, 1).should.be.above(0);
		});
	});

	describe('::getCorpRevenueBreak', function() {
		it('should be positive', function() {
			debug(gskse.getCorpRevenueBreak(1000));
			var result = gskse.getCorpRevenueBreak(1000);
			result.tax.should.be.above(0);
			result.ceo.should.be.above(0);
			result.revenue.should.be.above(0);
			result.dividen.should.be.above(0);
		});
	});

	describe('::getTaxedSalary', function() {
		it('should be positive', function() {
			gskse.getTaxedSalary(1000).should.be.above(0);
		});
	});

	describe('::getOfferLockUp', function() {
		it('should be in future', function() {
			gskse.getOfferLockUp().should.be.above(Date.now());
		});
	});

	describe('::getOfferFund', function() {
		it('should be positive', function() {
			gskse.getOfferFund(1000).should.be.above(0);
		});
	});

	describe('::getOrderExpiration', function() {
		it('day should be in future', function() {
			gskse.getOrderExpiration('day').should.be.above(Date.now());
		});
		it('gtc should be in future', function() {
			gskse.getOrderExpiration('gtc').should.be.above(Date.now());
		});
		it('ioc should be in future', function() {
			gskse.getOrderExpiration('ioc').should.be.above(Date.now());
		});
		it('1m should be in future', function() {
			gskse.getOrderExpiration('1m').should.be.above(Date.now());
		});
		it('3m should be in future', function() {
			gskse.getOrderExpiration('3m').should.be.above(Date.now());
		});
		it('5m should be in future', function() {
			gskse.getOrderExpiration('5m').should.be.above(Date.now());
		});
	});
});

















