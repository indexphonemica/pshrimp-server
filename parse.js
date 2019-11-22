const query = require('./query');
const props = require('./props');

ParserError = class ParserError extends Error {}

exports.parse = function parse(s) {
	var tokens = Stream(s.split(' ').filter(x => x !== ''));
	var query_stack = [];

	while (!tokens.eof()) {
		var curr = tokens.peek();
		if (is_qualifier(curr)) {
			var [gtlt, num] = parse_qualifier(tokens.next());
			if (is_qualificand(tokens.peek())) {
				var term = parse_qualificand(tokens.next());
				query_stack.push(new query.Query(
					is_contains(gtlt, num)
				,	term
				,	num
				,   gtlt || '='
				))
			} else if (is_phoneme(tokens.peek())) {
				var phoneme = parse_phoneme(tokens.next());
				query_stack.push(new query.Query(
					num > 0
				,	phoneme
				))
			} else {
				throw new ParserError(`Qualifier ${curr} followed by non-qualificand/phoneme ${tokens.peek()}`);
			}
		} else if (is_phoneme(curr)) {
			query_stack.push(new query.Query(true, parse_phoneme(tokens.next())));
		} else if (is_conjunction(curr)) {
			var r = query_stack.pop();
			var l = query_stack.pop();
			var relation = {'AND': 'AND', '&': 'AND', 'OR': 'OR', '|': 'OR'}[curr.toUpperCase()];
			query_stack.push(new query.QueryTree(l, relation, r));
			tokens.next();
		} else if (is_property(tokens.peek())) {
			var [prop_name, prop_value, contains] = parse_property(tokens.next());
			query_stack.push(new query.PropertyQuery(
				props.column(prop_name)
			,	prop_value
			,	props.table(prop_name)
			,	contains
			));
		} else if (is_filter(curr)) {
			var last = query_stack.pop();
			if (!(last.kind === 'query')) throw new ParserError(`Filter ${curr} applied to non-query`)
			var filter_mapping = {'-m': 'marginal', '-l': 'loan'};
			last['include_' + filter_mapping[tokens.peek()]] = false;
			query_stack.push(last);
			tokens.next();
		} else {
			throw new ParserError(`Invalid token ${curr}`);
		}
	}
	return query_stack[0]
}

// -------------
// -- private --
// -------------

function is_contains(gtlt, num) {
	return num > 0 || (num == 0 && gtlt == '>');
}

function Stream(arr) {
	return {
		next: next
	,	peek: peek
	,	eof: eof
	}
	function next() {
		return arr.shift();
	}
	function peek() {
		return arr[0];
	}
	function eof() {
		return arr.length == 0;
	}
}

function is_qualifier(s) {
	if (s === 'no') return true;
	if (s === 'any') return true;
	return s.search(/^[<>]?[0-9]+$/) == 0;
}
function is_qualificand(s) {
	var t = s.replace(/,/g, '');
	return t.search(/[+-]+[a-z_]+/) == 0;
}
function is_property(s) {
	return s.search(/\:/) > -1;
}
function is_phoneme(s) {
	return s.search(/\/[^\/]+\//) == 0;
}
function is_conjunction(s) {
	if (s === 'and' || s === 'or' || s === '&' || s === '|') return true;
	return false;
}
function is_filter(s) {
	if (s === '-m' || s === '-l') return true;
	return false;
}

// sanitization stuff - hopefully this works. also replace IPA lookalikes so you can search for /g/ instead of the ridiculous one-story ɡ
// TODO: it would be ideal to split this out into a different file
// since parse.js shouldn't vary between IPHON and PHOIBLE
const not_a_phoneme = /[^A-Za-zÀ-ÖØ-öø-ÿ\u0100-\u02FF\u03B0-\u03FF\u1D00-\u1DBF\uA270-\uA2FF\u2C60-\u2C7F\u0300-\u03FF\u207F\u2193]/g;
const not_a_property = /[^A-Za-z0-9_]/g
function sanitize_property(s) {
	return s.replace(not_a_property, '');
}
function fix_ipa_lookalikes(s) {
	// IPHON stores ASCII <g>; PHOIBLE uses the Unicode single-story ɡ.
	// So we need to check which DB we're running on, to see if we need to replace ASCII <g> or not.
	// Here we also replace ! | with their corresponding click letters,
	// ' with MODIFIER LETTER APOSTROPHE (sometimes used for glottalization in PHOIBLE), 
	// and : with the IPA length modifier
	const res = s.replace(/\!/g,'\u01C3').replace(/\|/g,'\u01c0').replace(/\'/g,'\u02BC').replace(/:/g,'\u02d0');
	if (process.env.IS_IPHON) {
		return res
	} else {
		return res.replace(/g/g,'\u0261');
	}
}

function parse_qualifier(s) {
	if (s === 'no') return [null, 0];
	if (s === 'any') return ['>', 0];
	var gtlt = null;
	if (s[0] == '>' || s[0] == '<') {
		gtlt = s[0];
		s = s.slice(1, s.length);
	}
	var num = +s;
	return [gtlt, num]
}
function parse_phoneme(s) {
	return fix_ipa_lookalikes(s.replace(/\//g, '')).replace(not_a_phoneme, '');
}
function parse_qualificand(s) {
	var term = {};
	var s_split = s.split(';');
	for (let section_key in s_split) {
		let section = s_split[section_key];
		let feature_vals = section.replace(/,/g,'').match(/[+-]+/)[0];
		feature_vals = feature_vals.split('').join(',');
		let feature = section.match(/[a-z_]+/)[0];
		term[feature] = feature_vals;
	}
	return term;
}
function parse_property(s) {
	if (s.split(':').length == 2) {
		var arr = s.split(':');
		var contains = true;
		if (arr[0][0] === '!') {
			contains = false;
			arr[0] = arr[0].slice(1);
		}
		return [sanitize_property(arr[0]), sanitize_property(arr[1]).replace(/_/g,' '), contains]
	} else {
		throw new ParserError(`Invalid property ${s}`);
	}
}