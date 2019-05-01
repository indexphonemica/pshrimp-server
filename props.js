// This could stand to be automated.
// See also: db_info.js

// Structure: 'field_name': ['table', 'column'] if the column name isn't the field name
//            'field_name': 'column' if the column name isn't the field name
const PROP_COLUMNS = {
	'id':            'doculects'
,	'source':        'doculects'
,	'glottocode':    'doculects'
,	'iso6393':       'doculects'
,   'language_name': 'doculects'
,   'family':        'languages'
,   'genus':         'languages'
,   'area':          'languages'
,   'country_id':    ['countries', 'id']
,   'country':       ['countries', 'name']
}

/** Finds the table that contains information on a given property name.
    Pshrimp abstracts away from tables, so each propqueryable column should have a different name.
*/
module.exports.table = function (prop_name) {
	if (typeof PROP_COLUMNS[prop_name] === 'string') return PROP_COLUMNS[prop_name];
	if (typeof PROP_COLUMNS[prop_name] === 'object') return PROP_COLUMNS[prop_name][0];
	throw new Error('Undefined property table'); // TODO define an error for this?
}

/** Finds the column name that contains information on a given property name.
*/
module.exports.column = function (prop_name) {
	if (typeof PROP_COLUMNS[prop_name] === 'string') return prop_name;
	if (typeof PROP_COLUMNS[prop_name] === 'object') return PROP_COLUMNS[prop_name][1];
	throw new Error('Undefined property column');
}