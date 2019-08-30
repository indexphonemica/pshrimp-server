const client = require('./db_client');

const psentence = require('./parse');
const psherlock = require('./search');
const psegmentize = require('./psegmentizer');

const utils = require('./utils');
const wrapAsync = utils.wrapAsync;

const express = require('express'), router = express.Router();

router.get('/query/:query', wrapAsync(async function (req, res) {
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

router.get('/language/:language', wrapAsync(async function (req, res) {
	try {
		var doculect = await utils.get_doculect(client, psherlock, psegmentize, req.params.language);
	} catch (err) {
		res.status(500).send({"error": err.toString()});
	}

	res.send(doculect);
}))

function decode(thing) {
	return decodeURIComponent(thing.replace(/\\e/g,'=').replace(/\\\+/g,'&').replace(/\\\\/g,'\\'));
}

module.exports = router;