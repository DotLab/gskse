var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var helper = require('./helper');

var ReportSchema = new Schema({
	corp: 		helper.ref(),
	date: 		helper.date(),

	revenue: 	helper.number(),
	tax: 		helper.number(), 
	expense: 	helper.number(),
	earning: 	helper.number(),
});

ReportSchema.index({ corp: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Report', ReportSchema);