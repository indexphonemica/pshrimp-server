// Here's all the stuff for the main web application (i.e. not search).

const express = require('express'), router = express.Router();

const client = require('./db_client');
const utils = require('./utils'), wrapAsync = utils.wrapAsync;
const psherlock = require('./search');
const psegmentize = require('./psegmentizer');

// TODO: we should probably have an API for this stuff too

router.get('/', function (req, res) {
	res.render('index')
})

// ---------------
// -- Languages --
// ---------------

router.get('/languages', wrapAsync(async function (req, res) {
	try {
		var results = await client.query('SELECT * FROM languages');
	} catch (err) {
		res.status(500).render('Error'); // TODO better errors
		return;
	}
	res.render('languages/index', {languages: results.rows});
}));

router.get('/languages/:glottocode', wrapAsync(async function (req, res) {
	try {
		var result = await client.query(
			`SELECT * 
			 FROM languages
			 JOIN doculects ON languages.glottocode = doculects.glottocode
			 WHERE languages.glottocode = $1::text`, 
			 [req.params.glottocode]
		);
	} catch (err) {
		res.status(500).send(err.toString()); // TODO better errors
		return;
	}
	res.render('languages/show', {language: result.rows});
}));

// ---------------
// -- Doculects --
// ---------------

// TODO: no time to go ecosystem diving right now but I wonder if it'd be possible to use JSX
// as a server-side templating language - that way we don't have to duplicate any of this stuff
// I don't really want the main site to use JS though - unnecessary JS is a little antisocial
router.get('/doculects/:glottocode', wrapAsync(async function (req, res) {
	try {
		var doculect = await utils.get_doculect(client, psherlock, psegmentize, req.params.glottocode);
	} catch (err) {
		res.status(500).send(err.toString());
		return;
	}


	res.render('doculects/show', {doculect: doculect});
}));

module.exports = router;