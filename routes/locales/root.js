var debug = require('debug')('gskse:locales');
var router = require('express').Router();

router.get('/:locale', function(req, res, next) {
	req.session.locale = req.params.locale;
	req.session.save();
	
	res.redirect('back');
});

module.exports = router;