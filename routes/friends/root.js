var debug = require('debug')('gskse:friends');
var router = require('express').Router();

var Friend = gskse.getModel('friend');

var friendController = gskse.getController('friendController');

router.get('/', function(req, res, next) {
	Friend.find({}).then(friends => {
		res.locals.friends = friends;

		res.render('friends/index');
	});
});

router.get('/login', function(req, res, next) {
	res.render('friends/login');
});

router.post('/login', function(req, res, next) {
	req.body.name = String(req.body.name);
	req.body.password = String(req.body.password);

	friendController.login(req.body.name, req.body.password).then(friend => {
		req.session.friend = friend.id;
		req.session.save(err => {
			res.redirect('/');
		});
	}).catch(err => next(err));
});

router.get('/signup', function(req, res, next) {
	res.render('friends/signup');
});

router.post('/signup', function(req, res, next) {
	req.body.name = String(req.body.name);
	req.body.password = String(req.body.password);
	req.body.password_confirm = String(req.body.password_confirm);
	if (req.body.password != req.body.password_confirm) throw gskse.status.bad_request;

	friendController.signup(req.body.name, req.body.password, req.files.avatar.data).then(friend => {
		res.redirect('/friends/login');
	}).catch(err => next(err));
});

router.get('/logout', function(req, res, next) {
	req.session.friend = null;
	req.session.save(err => {
		return res.redirect('/');
	});
});

module.exports = router;
