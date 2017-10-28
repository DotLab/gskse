var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var helper = require('./helper');

var ReportSchema = new Schema({
	corp: 		helper.ref(),
	date: 		helper.date(),

	revenue: 	helper.unsigned(),
	tax: 		helper.unsigned(), 
	expense: 	helper.unsigned(),
	earning: 	helper.unsigned(),
});

ReportSchema.index({ corp: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Report', ReportSchema);