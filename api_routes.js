const client = require('./db_client');

const psentence = require('./parse');
const psherlock = require('./search');

const utils = require('./utils');
const wrapAsync = utils.wrapAsync;

const logging = require('./logging');

const express = require('express'), router = express.Router();

router.get('/query/:query', wrapAsync(async function (req, res) {
	const query_text = decode(req.params.query).replace(/lateral/g, 'lateralis'); // Postgres reserved keyword workaround

	logging.log_request("/query/:query", req);

	try {
		const query = psentence.parse(query_text);
		var results = await psherlock.search(query, client.query.bind(client));
	} catch (err) {
		res.status(500).json({"error": err.toString()});
		logging.error(err);
		return;
	}

	res.json(results);
}))

router.get('/language/:language', wrapAsync(async function (req, res) {
	logging.log_request("/language/:language", req)

	try {
		var doculect = await utils.get_doculect(client, req.params.language);
	} catch (err) {
		res.status(500).send({"error": err.toString()});
		console.error(err);
		return;
	}

	res.send(doculect);
}))

router.use(function (req, res, next) {
	logging.error("404 Not Found: " + JSON.stringify(req))
	res.status(404).send({"error": "404 Not Found"});
	return;
})

function decode(thing) {
	return decodeURIComponent(thing.replace(/\\e/g,'=').replace(/\\\+/g,'&').replace(/\\\\/g,'\\'));
}

module.exports = router;