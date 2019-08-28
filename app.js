const express = require('express');
const app = express();
const port = process.env.PORT || 1337;

const client = require('./db_client');

const psentence = require('./parse');
const psherlock = require('./search');
const psegmentize = require('./psegmentizer');

const web_routes = require('./web_routes');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const utils = require('./utils');
const wrapAsync = utils.wrapAsync;

// Import web routes - TODO: put this stuff at / and move the api to api/
app.set('view engine', 'ejs');
app.use('/w', web_routes);


app.get('/query/:query', wrapAsync(async function (req, res) {
	const query_text = decode(req.params.query).replace(/lateral/g, 'lateralis'); // Postgres reserved keyword workaround

	try {
		const query = psentence.parse(query_text);
		const query_sql = psherlock.build_sql(query);
		var results = await client.query(query_sql);
	} catch (err) {
		res.status(500).json({"error": err.toString()});
		return;
	}

	const new_results = psherlock.process_results(results);

	res.json(new_results);
}))

app.get('/language/:language', wrapAsync(async function (req, res) {
	try {
		var segments = await client.query(psherlock.inventory_sql, [req.params.language]);
		var language_data = await client.query(psherlock.language_sql, [req.params.language]);
	} catch (err) {
		res.status(500).send({"error": err.toString()});
	}

	if (segments != false && language_data != false) { // sic
		let segcharts = psegmentize(segments.rows).to_json();
		res.send(Object.assign(segcharts, language_data.rows[0]));
	} else {
		res.status(500).send({"error": 'No such language'});
	}
}))

function decode(thing) {
	return decodeURIComponent(thing.replace(/\\e/g,'=').replace(/\\\+/g,'&').replace(/\\\\/g,'\\'));
}

client.connect()
 	.then(() => app.listen(port, () => console.log(`The great Pshrimp awaketh on port ${port}!`)))
 	.catch(e => console.error('connection error', e.stack))


process.on('exit', client.end);