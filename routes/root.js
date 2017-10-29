var router = require('express').Router();

//

//locales
//locales/:locale

//friends
//friends/signup
//friends/login
//friends/logout
//friends/:name
//friends/:name/portfolio
//friends/:name/watchlist
//friends/:name/trades
//friends/:name/trades/open
//friends/:name/trades/failed

//corps
//corps/register
//corps/:symbol
//corps/:symbol/chart
//corps/:symbol/profile
//corps/:symbol/holders
//corps/:symbol/financials
//corps/:symbol/conversations
//corps/:symbol/trade
//corps/:symbol/invest
//corps/:symbol/offer

//news
//news/post
//news/:id

//laws
//laws/propose
//laws/drafts
//laws/drafts/:id/vote
//laws/:code

//crimes
//crimes/impeach
//crimes/:id

global.url_ = (() => `/`);

global.url_locales = (() => `/locales`);
global.url_locales_locale = ((locale) => `/locales/${locale}`);

global.url_friends = (() => `/friends`);
global.url_friends_signup = (() => `/friends/signup`);
global.url_friends_login = (() => `/friends/login`);
global.url_friends_logout = (() => `/friends/logout`);
global.url_friends_name = ((name) => `/friends/${name}`);
global.url_friends_name_portfolio = ((name) => `/friends/${name}/portfolio`);
global.url_friends_name_watchlist = ((name) => `/friends/${name}/watchlist`);
global.url_friends_name_trades = ((name) => `/friends/${name}/trades`);
global.url_friends_name_trades_open = ((name) => `/friends/${name}/trades/open`);
global.url_friends_name_trades_failed = ((name) => `/friends/${name}/trades/failed`);

global.url_corps = (() => `/corps`);
global.url_corps_register = (() => `/corps/register`);
global.url_corps_symbol = ((symbol) => `/corps/${symbol}`);
global.url_corps_symbol_chart = ((symbol) => `/corps/${symbol}/chart`);
global.url_corps_symbol_profile = ((symbol) => `/corps/${symbol}/profile`);
global.url_corps_symbol_holders = ((symbol) => `/corps/${symbol}/holders`);
global.url_corps_symbol_financials = ((symbol) => `/corps/${symbol}/financials`);
global.url_corps_symbol_conversations = ((symbol) => `/corps/${symbol}/conversations`);
global.url_corps_symbol_trade = ((symbol) => `/corps/${symbol}/trade`);
global.url_corps_symbol_invest = ((symbol) => `/corps/${symbol}/invest`);
global.url_corps_symbol_offer = ((symbol) => `/corps/${symbol}/offer`);

global.url_news = (() => `/news`);
global.url_news_post = (() => `/news/post`);
global.url_news_id = ((id) => `/news/${id}`);

global.url_laws = (() => `/laws`);
global.url_laws_propose = (() => `/laws/propose`);
global.url_laws_drafts = (() => `/laws/drafts`);
global.url_laws_drafts_id_vote = ((id) => `/laws/drafts/${id}/vote`);
global.url_laws_code = ((code) => `/laws/${code}`);

global.url_crimes = (() => `/crimes`);
global.url_crimes_impeach = (() => `/crimes/impeach`);
global.url_crimes_id = ((id) => `/crimes/${id}`);

router.get('/', function(req, res, next) {
	res.render('index');
});

router.use('/locales', require('./locales/root'));
router.use('/friends', require('./friends/root'));
router.use('/corps', require('./corps/root'));
router.use('/news', require('./news/root'));

module.exports = router;
