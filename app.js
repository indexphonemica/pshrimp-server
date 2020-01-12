const express = require('express');
const app = express();
const port = process.env.PORT || 1337;

const client = require('./db_client');

const psentence = require('./parse');
const psherlock = require('./search');
const psegmentize = require('./psegmentizer');

const web_routes = require('./web_routes');
const api_routes = require('./api_routes')

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const utils = require('./utils');
const wrapAsync = utils.wrapAsync;

// so we don't have to rewrite the views every time
if (!!(+process.env.IS_IPHON)) {
	global.IPHON_VERSION = '0.4.0';
	global.IPHON_VERSION_RELEASE_DATE = '2020-01-12';
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