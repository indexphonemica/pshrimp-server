// Here's all the stuff for the main web application (i.e. not search).

const express = require('express'), router = express.Router();

const client = require('./db_client');
const utils = require('./utils'), wrapAsync = utils.wrapAsync;

// TODO: we should probably have an API for this stuff too
// TODO: get helper funcs for routes to stuff so we don't have to hardcode the paths
//   \_ I'm not sure if there's a good way to do this
//      cermati/route-label hasn't been updated in three years
//      alubbe/named-routes doesn't play nicely with separate routes files

router.get('/', function (req, res) {
	res.render('index')
})

// ---------------
// -- Languages --
// ---------------

router.get('/languages', wrapAsync(async function (req, res) {
	try {
		var results = await client.query('SELECT * FROM languages ORDER BY name ASC');
	} catch (err) {
		res.status(500).render('Error');
		console.error(err);
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
			 WHERE languages.glottocode = $1::text
			 ORDER BY LENGTH(doculects.inventory_id), doculects.inventory_id`, 
			 [req.params.glottocode]
		);
	} catch (err) {
		res.status(500).send(err.toString()); // TODO better errors
		console.error(err);
		return;
	}

	if (result.rows.length === 0) { // TODO write a get_or_404
		res.status(404).render('404');
		console.error(`404: /languages/${req.params.glottocode}`)
		return;
	}
	res.render('languages/show', {language: result.rows});
}));

// ---------------
// -- Doculects --
// ---------------

router.get('/doculects', wrapAsync(async function (req, res){ 
	try {
		var result = await client.query(`
			SELECT languages.*, d.*,
			  (
			    SELECT 
			      COUNT(segments.id) AS consonants
			    FROM
			      segments
			      JOIN doculect_segments ON segments.id = doculect_segments.segment_id
			      JOIN doculects ON doculect_segments.doculect_id = doculects.id
			    WHERE
			      doculects.id = d.id
			      AND segments.segment_class = 'consonant'
			  ),
			  (
			    SELECT 
			      COUNT(segments.id) AS vowels
			    FROM
			      segments
			      JOIN doculect_segments ON segments.id = doculect_segments.segment_id
			      JOIN doculects ON doculect_segments.doculect_id = doculects.id
			    WHERE
			      doculects.id = d.id
			      AND segments.segment_class = 'vowel'
			  ),
			  (
			    SELECT 
			      COUNT(segments.id) AS tones
			    FROM
			      segments
			      JOIN doculect_segments ON segments.id = doculect_segments.segment_id
			      JOIN doculects ON doculect_segments.doculect_id = doculects.id
			    WHERE
			      doculects.id = d.id
			      AND segments.segment_class = 'tone'
			  )
			FROM languages
			JOIN doculects AS d ON languages.glottocode = d.glottocode`)
	} catch (err) {
		res.status(500).send(err.toString());
		console.error(err);
		return;
	}

	if (result.rows.length === 0) {
		res.status(404).render('404'); // TODO: write a get_or_404
		console.error(`404: /doculects`)
		return;
	}

	res.render('doculects/index', {doculects: result.rows});
}))

// TODO: no time to go ecosystem diving right now but I wonder if it'd be possible to use JSX
// as a server-side templating language - that way we don't have to duplicate any of this stuff
// I don't really want the main site to use JS though - unnecessary JS is a little antisocial
router.get('/doculects/:glottocode', wrapAsync(async function (req, res) {
	try {
		var doculect = await utils.get_doculect(client, req.params.glottocode);
	} catch (err) {
		if (err.message === 'No such language') { // TODO: this is bad
			res.status(404).render('404');
			console.error(`404: /doculects/${req.params.glottocode}`)
			return;
		}
		res.status(500).send(err.toString());
		console.error(err);
		return;
	}

	res.render('doculects/show', {doculect: doculect});
}));

// --------------
// -- Segments --
// --------------

router.get('/segments', wrapAsync(async function (req, res) {
	try {
		var result = await client.query(`
			SELECT segments.phoneme AS segment, COUNT(doculects.id) AS frequency
			FROM segments
			JOIN doculect_segments ON doculect_segments.segment_id = segments.id 
			JOIN doculects ON doculects.id = doculect_segments.doculect_id
			GROUP BY segments.id
			ORDER BY COUNT(doculects.id) DESC
			`)
	} catch (err) {
		res.status(500).send(err.toString());
		console.error(err);
		return;
	}

	res.render('segments/index', {segments: result.rows});
}))

router.get('/segments/:segment', wrapAsync(async function (req, res) {
	try {
		var result = await client.query(`
			SELECT segments.phoneme AS segment, segments.*, doculects.inventory_id
			FROM segments
			JOIN doculect_segments ON doculect_segments.segment_id = segments.id
			JOIN doculects ON doculects.id = doculect_segments.doculect_id
			WHERE segments.phoneme = $1::text`, [req.params.segment]);
	} catch (err) {
		res.status(500).send(err.toString());
		console.error(err);
		return;
	}

	if (result.rows.length === 0) { // TODO: write a get_or_404
		res.status(404).render('404');
		console.error(`404: /segments/${req.params.segment}`)
		return;
	}

	// pull these out so we can display them without rooting around in listings

	const segment_props = {...result.rows[0]}; 
	delete segment_props.inventory_id;
	delete segment_props.glyph_id;
	delete segment_props.phoneme;

	res.render('segments/show', {
		listings: result.rows, 
		segment: req.params.segment, 
		segment_props: segment_props
	});
}));

module.exports = router;