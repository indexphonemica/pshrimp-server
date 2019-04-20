const express = require('express');
const app = express();
const port = process.env.PORT || 1337;

<<<<<<< HEAD
const client = require('./db_client');
=======
const { Client } = require('pg');
const client = new Client({
	connectionString: process.env.DATABASE_URL,

});
client.connect();
>>>>>>> 101d2f00617367d4f6640eeaa60132030089c6d2

const psentence = require('./parse');
const psherlock = require('./search');
const psegmentize = require('./psegmentizer');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/query/:query', async function (req, res) {
	const query_text = decode(req.params.query).replace(/lateral/g, 'lateralis'); // Postgres reserved keyword workaround
	const query = psentence.parse(query_text);
	const query_sql = psherlock.build_sql(query);
	try {
		var results = await client.query(query_sql);
	} catch (err) {
		res.status(500).json({"error": err.toString()});
		return;
	}

	// SQL will return one row per phoneme.
	// Aggregate these so there's a phonemes value with an array.
	// This relies on language rows always being contiguous!
	var new_results = [];
	var processed = new Set();
	for (let i of results.rows) {
		if (!processed.has(i.id)) {
			if (lang) new_results.push(lang);

			var {phoneme, ...lang} = i; // really weird destructuring syntax - `lang` ends up with all the row props except `phoneme` 
			processed.add(i.id);
			if (i.phoneme) lang.phonemes = [];
		}
		if (i.phoneme) lang.phonemes.push(i.phoneme);
	}
	new_results.push(lang);

	res.json(new_results);

})

app.get('/language/:language', async function (req, res) {
	try {
		var segments = await client.query(psherlock.inventory_sql, [req.params.language]);
		var language_data = await client.query(psherlock.language_sql, [req.params.language]);
	} catch (err) {
		res.status(500).send({"error": err.toString()});
	}

	if (segments != false && language_data != false) { // sic
		let segcharts = psegmentize(segments.rows);
		res.send(Object.assign(segcharts, language_data.rows[0]));
	} else {
		res.status(500).send({"error": 'No such language'});
	}
})

function decode(thing) {
	return decodeURIComponent(thing.replace(/\\e/g,'=').replace(/\\\+/g,'&').replace(/\\\\/g,'\\'));
}

client.connect()
 	.then(() => app.listen(port, () => console.log(`The great Pshrimp awaketh on port ${port}!`)))
 	.catch(e => console.error('connection error', e.stack))


process.on('exit', client.end);