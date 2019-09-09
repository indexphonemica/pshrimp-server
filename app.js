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

// Import web routes
app.set('view engine', 'ejs');
app.use('/', web_routes);
app.use('/api', api_routes);

// 404
app.use(function (req, res, next) {
	res.status(404).render('404');
})

client.connect()
 	.then(() => app.listen(port, () => console.log(`The great Pshrimp awaketh on port ${port}!`)))
 	.catch(e => console.error('connection error', e.stack))


process.on('exit', client.end);