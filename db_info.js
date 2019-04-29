/** Store information about the database.
 *    This is a little ugly, but something like it is needed in order to 
 *  separate segment information from doculect information when processing
 *  query results.
 *    Ideally it would be possible to just get Postgres to return the names
 *  of the tables that the columns are from, rather than just the names of
 *  the columns themselves.
 *    TODO find a better way to do this?
 *    It might also be reasonable to put configuration information here
 *  later - what's a feature query, what's a property query, etc.
 *  Especially now that property names are spread out across two tables...
 */

exports.columns = {
	'segments': new Set([
		'id',
		'phoneme',
		'glyph_id',
		'segment_class',
		'tone',
		'stress',
		'syllabic',
		'short',
		'long',
		'consonantal',
		'sonorant',
		'continuant',
		'delayed_release',
		'approximant',
		'tap',
		'trill',
		'nasal',
		'lateralis',
		'labial',
		'round',
		'labiodental',
		'coronal',
		'anterior',
		'distributed',
		'strident',
		'dorsal',
		'high',
		'low',
		'front',
		'back',
		'tense',
		'retracted_tongue_root',
		'advanced_tongue_root',
		'periodic_glottal_source',
		'epilaryngeal_source',
		'spread_glottis',
		'constricted_glottis',
		'fortis',
		'ejective',
		'implosive',
		'click'
	])
}