// Here's all the stuff for the main web application (i.e. not search).

const express = require('express'), router = express.Router();

const client = require('./db_client');
const utils = require('./utils'), wrapAsync = utils.wrapAsync;

// TODO: we should probably have an API for this stuff too
// TODO: get helper funcs for routes to stuff so we don't have to hardcode the paths
//   \_ I'm not sure if there's a good way to do this
//      cermati/route-label hasn't been updated in three years
//      alubbe/named-routes doesn't play nicely with separate routes files

router.get('/', wrapAsync(async function (req, res) {
	const languages  = await client.query('SELECT COUNT(DISTINCT glottocode) FROM languages');
	const doculects  = await client.query('SELECT COUNT(DISTINCT inventory_id) FROM doculects');
	const segments   = await client.query(`SELECT COUNT(DISTINCT segments.id) FROM segments
		                                   JOIN doculect_segments ON doculect_segments.segment_id = segments.id`)
	// const total_segs = await client.query('SELECT COUNT(DISTINCT id) FROM segments');
	const rules      = await client.query('SELECT COUNT(*) FROM allophones');

	// For segments, we want to exclude the ones that only appear as allophones.
	// This is a little arbitrary, but I think it makes sense.

	get_count = x => x.rows[0].count

	res.render('index', { languages:  get_count(languages)
						, doculects:  get_count(doculects)
						, segments:   get_count(segments)
	//					, total_segs: get_count(total_segs)
						, rules:      get_count(rules)})
}));

// ---------------
// -- Languages --
// ---------------

router.get('/languages', wrapAsync(async function (req, res) {
	try {
		var results = await client.query(
			`SELECT languages.*, COUNT(doculects.id) AS doculect_count
			 FROM languages 
			 JOIN doculects ON languages.glottocode = doculects.glottocode
			 GROUP BY languages.id
			 ORDER BY name ASC;
			`);
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

// seg is lazy: /l/abau -> /languages/abau1245
router.get('/l/:langname', wrapAsync(async function (req, res) {
	// get Xârâcùù from xaracuu in addition to xrc

	try {
		var result = await client.query(
			`SELECT languages.glottocode
             FROM languages
             WHERE UPPER(REGEXP_REPLACE(languages.name, '[^A-Za-z]', '', 'g')) =
                   UPPER(REGEXP_REPLACE($1,             '[^A-Za-z]', '', 'g'))
             OR    UPPER(REGEXP_REPLACE(unaccent(languages.name), '[^A-Za-z]', '', 'g')) =
                   UPPER(REGEXP_REPLACE($1,                       '[^A-Za-z]', '', 'g'));`,
             [req.params.langname]
		);
	} catch (err) {
		res.status(500).send(err.toString());
		console.error(err);
		return;
	}

	if (result.rows.length === 0) {
		res.status(404).render('404');
		console.error(`404: /l/${req.params.langname}`);
		return;
	} else if (result.rows.length > 1) {
		// deal with this case later
	}
	lang_glottocode = result.rows[0].glottocode;
	res.redirect('/languages/' + lang_glottocode);
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