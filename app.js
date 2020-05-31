const express = require('express');
const app = express();
const port = process.env.PORT || 1337;

const client = require('./db_client');

const psentence = require('./parse');
const psherlock = require('./search');
const psegmentize = require('./psegmentizer');

const web_routes = require('./web_routes');
const api_routes = require('./api_routes');

// helpers
app.locals.format_author_list = function (author_list_str) {
	// split into list of surnames
	// technically we should et al. on length > 3, but that takes up too much space
	const author_list_arr = author_list_str.split(';').map(s => s.split(',')[0].trim());
	if (author_list_arr.length > 2) {
		return `${author_list_arr[0]} et al.`;
	} else if (author_list_arr.length === 2) {
		return `${author_list_arr[0]} & ${author_list_arr[1]}`
	} else {
		return author_list_arr[0]
	}
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const utils = require('./utils');
const wrapAsync = utils.wrapAsync;

// so we don't have to rewrite the views every time
if (!!(+process.env.IS_IPHON)) {
	global.IPHON_VERSION = '0.5.0';
	global.IPHON_VERSION_RELEASE_DATE = '2020-05-30';
}

// Import web routes
app.set('view engine', 'ejs');
if (!!(+process.env.IS_IPHON)) app.use('/', web_routes); // PHOIBLE has its own site
if (!!(+process.env.IS_IPHON)) {
	app.use('/api', api_routes);
} else {
	app.use('/', api_routes);
}

// 404
app.use(function (req, res, next) {
	res.status(404).render('404');
})

client.connect()
 	.then(() => app.listen(port, () => console.log(`The great Pshrimp awaketh on port ${port}! IPHON: ${!!(+process.env.IS_IPHON)}`)))
 	.catch(e => console.error('connection error', e.stack))


process.on('exit', client.end);