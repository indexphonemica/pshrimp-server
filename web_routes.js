// Here's all the stuff for the main web application (i.e. not search).

const express = require('express'), router = express.Router();

const client = require('./db_client');
const utils = require('./utils'), wrapAsync = utils.wrapAsync;

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
		res.status(500).render('Error'); // TODO better errors
		return;
	}
	console.log(result.rows);
	res.render('languages/show', {language: result.rows});
}))

// ---------------
// -- Doculects --
// ---------------

module.exports = router;