var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var helper = require('./helper');

var NewsSchema = new Schema({
	friend: 	helper.ref('Friend'),
	corp: 		helper.ref('Corp'),

	hero: 		helper.string(),
	title: 		helper.string(),
	source: 	helper.string(),
	content: 	helper.string(),

	posted: 	helper.date(),

	click: 		helper.unsigned(),
});

module.exports = mongoose.model('News', NewsSchema);