const express = require('express');
const app = express();
const port = 1337;

const client = require('./db_client');

const psentence = require('./parse');
const psherlock = require('./search');
const psegmentize = require('./psegmentizer');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/query/:query', async function (req, res) {
	const query_text = decode(req.params.query).replace(/lateralis/g, 'lateral'); // Postgres reserved keyword workaround
	const query = psentence.parse(query_text);
	const query_sql = psherlock.build_sql(query);
	try {
		const results = await client.query(query_sql);
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
		const segments = await client.query(psherlock.inventory_sql, [req.params.language]);
		const language_data = await client.query(psherlock.language_sql, [req.params.language]);
	} catch (err) {
		res.status(500).json({"error": err.toString()});
		return;
	}
	if (segments != false && language_data != false) { // sic
		let segcharts = psegmentize(segments.rows);
		res.send(Object.assign(segcharts, language_data.rows[0]));
	} else {
		res.send({"error": 'No such language'});
	}
})

function decode(thing) {
	return decodeURIComponent(thing.replace(/\\e/g,'=').replace(/\\\+/g,'&').replace(/\\\\/g,'\\'));
}

client.connect()
 	.then(() => app.listen(port, () => console.log(`The great Pshrimp awaketh on port ${port}!`)),
 		  (e) => console.log(e));


process.on('exit', client.end);