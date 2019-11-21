const psegmentize = require('./psegmentizer'); // for process_results()
const db_info = require('./db_info');

class SearchError extends Error {};

exports.build_sql = function(qtree) {
    // We go through the query tree twice - first to pull all the contains queries
    // so we can display the segments, and then to generate the actual SQL.
    // The actual SQL is generated in get_sql().
    var segment_conditions = build_segment_conditions(qtree);

    // Special case: don't return any segments if it's an entirely negative query
    // (because otherwise you're returning the entire inventory of the doculect)
    function is_negative(q) {
        if (q.kind === 'tree') {
            return is_negative(q.left) && is_negative(q.right);
        } else {
            return !is_contains(q);
        }
    }

    // This is a little lazy, but it means we have to make sure segments.id doesn't overlap with doculect.id.
    var do_segments = 'segments.*, doculect_segments.marginal';
    if (is_negative(qtree)) do_segments = false;

    if (!!(+process.env.IS_IPHON)) {
        // IPHON and PHOIBLE store sources differently.
        var sources = `doculects.source_bibkey, doculects.source_url, doculects.source_author,
                       doculects.source_title, doculects.source_year`;

        // Unification isn't quite done yet; should fix eventually. TODO
        var name    = 'languages.name';

        // IPHON stores doculect info.
        var dialect = `doculects.dialect, doculects.dialect_name,`;

        // IPHON stores information on whether a segment is a loan.
        if (do_segments) do_segments += ', doculect_segments.loan'
    } else {
        var sources = 'doculects.source';
        var name    = 'doculects.language_name';
        var dialect = '';
    }


    // For sources: for now, only pull author+title+year and bibkey + url.
    // TODO: we should figure out a good format for source citation.
    return `
        SELECT doculects.id AS doculect_id, doculects.inventory_id,
        doculects.language_name, ${dialect}
        languages.glottocode${do_segments ? ', ' + do_segments : ''},
        ${sources}, ${name}, languages.latitude, languages.longitude
        FROM doculects
        ${do_segments ? `JOIN doculect_segments ON doculects.id = doculect_segments.doculect_id
        JOIN segments ON doculect_segments.segment_id = segments.id` : ''}
        JOIN languages ON doculects.glottocode = languages.glottocode
        WHERE ${get_sql(qtree)} ${segment_conditions && do_segments ? 'AND (' + segment_conditions + ')' : ''}
        ORDER BY doculects.id
        ;`;
}

/** Processes raw SQL results into something suitable for returning.
 *  Specifically, it takes SQL results of the form
 *    language | language_prop | segment | segment_prop
 *    language | language_prop | segment | segment_prop ...
 *  and turns them into 
 *    language | language_prop | [phoneme, phoneme...]
 *  with one row per language.
 *  Note that this relies on language results always being contiguous.
 */
exports.process_results = function(results) {
    // If we didn't fetch any segments from the DB, there's nothing we need to do here except extract the rows
    // and rename doculect_id to id.
    if (results.rows.length === 0) return [];
    if (!results.rows[0].hasOwnProperty('phoneme')) return results.rows.map(a => {
        a.id = a.doculect_id;
        delete a.doculect_id;
        return a
    });


    /** Splits a DB result row into segment properties and language properties.
    *   We use db_info here to see what's a segment property,
    *   but I'm not sure if marginal and loan belong in db_info.
    *   So we'll special-case them for now.
    *   Note that if we don't do this, we can't display marginal and loan info
    *   in the search results table.
    */
    function destructure(row) {
        var segment = {};
        var lang = {};
        for (let i in row) {
            if (db_info.columns.segments.has(i) || i === 'marginal' || i === 'loan') {
                segment[i] = row[i];
            } else if (i === 'doculect_id') {
                lang['id'] = row[i];
            } else {
                lang[i] = row[i];
            }
        }
        return [segment, lang];
    }

    function add_to_new_results(lang) {
        lang.phonemes = psegmentize(lang.segments).flatten();
        delete lang.segments;
        new_results.push(lang);
    }

    var new_results = [];
    var processed = new Set();
    var curr_lang = null;

    for (let row of results.rows) {
        var [segment, lang_props] = destructure(row);

        if (!processed.has(lang_props.id)) {
            if (curr_lang) add_to_new_results(curr_lang);
            curr_lang = lang_props;
            curr_lang.segments = [];
            processed.add(lang_props.id);
        }

        curr_lang.segments.push(segment);
    }
    add_to_new_results(curr_lang)

    return new_results;
}

// For IPHON we use the inventory_id for everything.
// For PHOIBLE we use the DB ID, for now.
// TODO: unify on inventory_id

if (!!(+process.env.IS_IPHON)) {
    var id_col = 'doculects.inventory_id';
} else {
    var id_col = 'doculects.id';
}

exports.inventory_sql = `
    SELECT segments.*, doculect_segments.marginal, doculect_segments.loan
    FROM doculects 
    JOIN doculect_segments ON doculects.id = doculect_segments.doculect_id
    JOIN segments ON doculect_segments.segment_id = segments.id
    WHERE ${id_col} = $1;`;

exports.language_sql = `
    SELECT doculects.*, languages.*
    FROM doculects
    JOIN languages ON doculects.glottocode = languages.glottocode
    WHERE ${id_col} = $1;`;

// TODO: allophone search for PHOIBLE?
if (!!(+process.env.IS_IPHON)) {
    exports.allophone_sql = `
        SELECT allophones.variation, allophones.compound, allophones.environment, 
            phonemes.phoneme AS phoneme, realizations.phoneme AS realization,
            phonemes.*
        FROM allophones
        JOIN doculect_segments ON allophones.doculect_segment_id = doculect_segments.id
        JOIN doculects ON doculect_segments.doculect_id = doculects.id
        JOIN segments AS phonemes ON doculect_segments.segment_id = phonemes.id
        JOIN segments AS realizations ON allophones.allophone_id = realizations.id
        WHERE doculects.inventory_id = $1;`;
}

function build_segment_conditions(qtree) {
    var query_stack = [];
    var contains_queries = [];

    function process_node(node) {
        if (node.kind === 'tree') {
            query_stack.push(node.left);
            query_stack.push(node.right);
        } else if (node.kind === 'query') {
            if (is_contains(node)) {
                contains_queries.push(segment_condition(node.term));
            }
        } else if (node.kind === 'propertyquery') {
            // do nothing
        } else {
            throw new SearchError(`Bad query tree term ${node}`);
        }
    }
    process_node(qtree);
    while (query_stack.length > 0) {
        process_node(query_stack.pop());
    }
    return contains_queries.join(' OR ');
}

function segment_condition(term) {
    if (typeof(term) === 'object') {
        var arr = [];
        for (let k in term) {
            arr.push(`segments.${k} = '${term[k]}'`);
        }
        return arr.join(' AND ');
    } else if (typeof(term) === 'string') {
        return `segments.phoneme LIKE '${term}'`;
    } else {
        throw new SearchError(`Bad segment condition ${term}`);
    }
}

function contains_query(term, num = null, gtlt = '=') {
    var term_cond = segment_condition(term);
    var num_cond = '';

    if (num !== null) {
        num_cond = `HAVING count(*) ${gtlt} ${num}`;
    }

    return `doculects.id IN (
        SELECT doculects.id
        FROM doculects
            JOIN doculect_segments ON doculects.id = doculect_segments.doculect_id
            JOIN segments ON doculect_segments.segment_id = segments.id
            WHERE ${term_cond}
            GROUP BY doculects.id
            ${num_cond}
        )`;
}

function does_not_contain_query(term) {
    var term_cond = segment_condition(term);
    return `
        doculects.id NOT IN
        (SELECT doculects.id
        FROM doculects
            JOIN doculect_segments ON doculects.id = doculect_segments.doculect_id
            JOIN segments ON doculect_segments.segment_id = segments.id
        WHERE ${term_cond}
        GROUP BY doculects.id
        )`;
}

function prop_query(term) {
    // TODO: this duplicates the `not_a_property` regex...
    return `
        doculects.id ${term.contains ? '' : 'NOT'} IN (
            SELECT doculects.id 
            FROM doculects
            JOIN languages ON doculects.glottocode = languages.glottocode
            JOIN languages_countries ON languages.id = languages_countries.language_id
            JOIN countries ON languages_countries.country_id = countries.id
            WHERE UPPER(REGEXP_REPLACE(${term.table}.${term.column}, '[^A-Za-z_]', '', 'g')) = 
                UPPER(REGEXP_REPLACE('${term.value}', '[^A-Za-z_]', '', 'g'))
        )`;
}

function get_sql(q) {
    if (q.kind === 'tree') {
        return `(${get_sql(q.left)} ${q.relation} ${get_sql(q.right)})`;
    }
    if (q.kind === 'query') {
        if (is_contains(q)) {
            return contains_query(q.term, q.num, q.gtlt);
        } else {
            return does_not_contain_query(q.term);
        }
    }
    if (q.kind === 'propertyquery') {
        return prop_query(q);
    }
}

function is_contains(q) {
    return q.contains || q.gtlt === '<';
}
