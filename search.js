const psegmentize = require('./psegmentizer'); // for process_results()
const db_info = require('./db_info');

class SearchError extends Error {};

/** Returns a set of search results, and maps the raw DB results to an array of JS objects,
    each object representing a doculect and containing, where appropriate:
    - a table (flattened SegmentInventory) of segments matched by the search result
    - an array of allophonic rules matched by the search result

    Unlike in previous iterations of PHOIBLE, this handles the actual DB querying.
    This is necessary, because we're no longer running one simple DB query that returns everything.
    Instead, we're running up to three separate DB queries:
    - one to build the list of doculects containing matches to the search
    - one to build the matching-segment inventories for those doculects
    - one to build the matching-allophonic-rule inventories for those doculects

    *** If you're messing with the innards of this, use maps instead of objects in most cases.
        doculects_by_id is a map with integer keys, and trying to look up the value of a string
        (such as a string you might get by iterating over the keys of an object) will fail.     ***
*/
exports.search = async function (qtree, run_query_fn) {
    // TODO: make sure any errors generated here are handled somewhere!
    const doculect_sql = build_doculect_sql(qtree);
    const doculect_results = await run_query_fn(doculect_sql);

    // If we don't have any results, we can save a lot of time and effort here...
    const drows = doculect_results.rows;
    if (drows.length === 0) return [];

    // Make a map of doculects to result objects
    var doculects_by_id = new Map();
    for (let row of drows) {
        doculects_by_id.set(+row.doculect_id, row);
    }

    // Collect matching doculect PKs for validity checking later (prob not necessary but may as well be paranoid)
    const doculect_pks = new Set(doculects_by_id.keys());

    // See if we need to collect segments
    const skip_segments = q => (q.kind === 'tree') ? 
        (skip_segments(q.left) && skip_segments(q.right)) : 
        (!is_contains(q));
    // If so, query the DB for them
    if (!skip_segments(qtree)) {
        const segment_sql = build_segment_sql(qtree);
        const segment_results = await run_query_fn(segment_sql);
        const segment_rows = segment_results.rows;

        // Collate segments
        // This has to be a map, because doculects_by_id is...
        // ...and that has to be a map in order to preserve the DB's ordering.
        // Since doculects_by_id is a map, its keys are ints.
        // And JS doesn't do automatic casting here. Surprise!
        var d_seg_collation = new Map();
        for (let row of segment_rows) {
            let d_id = row.doculect_id;
            if (!d_seg_collation.has(d_id)) d_seg_collation.set(d_id, []);
            d_seg_collation.get(d_id).push(row);
        }
        // Make sure the doculects we have here match up with the doculect results
        const seg_doculect_pks = new Set(d_seg_collation.keys());
        
        if (!setEq(seg_doculect_pks, doculect_pks)) { // this should never happen
            console.error('Doculect/segment mismatch');
            console.error(seg_doculect_pks);
            console.error(doculect_pks);
            console.error(qtree);
            throw new SearchError("Something has gone very wrong (doculect/segment mismatch) - please file an issue in the tracker");
        }

        // Now generate the tables and add them to the results
        for (let d_id of d_seg_collation.keys()) {
            doculects_by_id.get(d_id).phonemes = psegmentize(d_seg_collation.get(d_id)).flatten();
        }

    }

    return [...doculects_by_id.values()];
}

// https://stackoverflow.com/questions/31128855/comparing-ecma6-sets-for-equality
function setEq(a, b) {
    return a.size === b.size && [...a].every(value => b.has(value));
}

function build_segment_sql(qtree) {
    // Here we rerun get_sql. Could cache this instead, but probably unnecessary.
    // Note that we don't use the doculect pks here - we shouldn't need to.

    var segment_conditions = build_segment_conditions(qtree);

    return `
      SELECT 
        segments.*,
        doculect_segments.marginal,
        ${!!(+process.env.IS_IPHON) ? 'doculect_segments.loan, ' : ''}
        doculect_segments.doculect_id AS doculect_id
      FROM
        doculects
        JOIN doculect_segments ON doculect_segments.doculect_id = doculects.id
        JOIN segments ON segments.id = doculect_segments.segment_id
      WHERE
        ${get_sql(qtree)} AND (${segment_conditions})
      ORDER BY
        doculect_id
      ;`;
}

function build_doculect_sql(qtree) {
    // We go through the query tree twice - first to pull all the contains queries
    // so we can display the segments, and then to generate the actual SQL.
    // The actual SQL is generated in get_sql().
    // var segment_conditions = build_segment_conditions(qtree);

    // // Special case: don't return any segments if it's an entirely negative query
    // // (because otherwise you're returning the entire inventory of the doculect)
    // function is_negative(q) {
    //     if (q.kind === 'tree') {
    //         return is_negative(q.left) && is_negative(q.right);
    //     } else if (q.kind === 'allophonequery') {
    //         // Not really sure how this should be handled. Probably want to return the *allophones* later.
    //         // Technically we don't even need this, because is_contains(q) will return false...
    //         // ...since allophone queries don't *have* `contains` or `gtlt` properties.
    //         // But for clarity, we'll include it here for now.
    //         // TODO
    //         return true;
    //     } else {
    //         return !is_contains(q);
    //     }
    // }

    // // This is a little lazy, but it means we have to make sure segments.id doesn't overlap with doculect.id.
    // var do_segments = 'segments.*, doculect_segments.marginal';
    // if (is_negative(qtree)) do_segments = false;

    if (!!(+process.env.IS_IPHON)) {
        // IPHON and PHOIBLE store sources differently.
        var sources = `doculects.source_bibkey, doculects.source_url, doculects.source_author,
                       doculects.source_title, doculects.source_year`;

        // Unification isn't quite done yet; should fix eventually. TODO
        var name    = 'languages.name';

        // IPHON stores doculect info.
        var dialect = `doculects.dialect, doculects.dialect_name,`;

        // IPHON stores information on whether a segment is a loan.
        // if (do_segments) do_segments += ', doculect_segments.loan'
    } else {
        var sources = 'doculects.source';
        var name    = 'doculects.language_name';
        var dialect = '';
    }


    // For sources: for now, only pull author+title+year and bibkey + url.
    // TODO: we should figure out a good format for source citation.
    var res =  `
        SELECT doculects.id AS doculect_id, doculects.inventory_id,
        doculects.language_name, ${dialect}
        languages.glottocode, ${sources}, ${name}, languages.latitude, languages.longitude
        FROM doculects
        JOIN languages ON doculects.glottocode = languages.glottocode
        WHERE ${get_sql(qtree)}
        ORDER BY doculects.id
        ;`;
    
    return res;
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
    SELECT segments.*, doculect_segments.marginal${!!(+process.env.IS_IPHON) ? ', doculect_segments.loan' : ''}
    FROM doculects 
    JOIN doculect_segments ON doculects.id = doculect_segments.doculect_id
    JOIN segments ON doculect_segments.segment_id = segments.id
    WHERE ${id_col} = $1;`;

exports.language_sql = `
    SELECT doculects.*, languages.*
    FROM doculects
    JOIN languages ON doculects.glottocode = languages.glottocode
    WHERE ${id_col} = $1;`;

// TODO: allophone display for PHOIBLE?
// This is used to get allophone data for detail display.
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
} else {
    exports.allophone_sql = `
        SELECT allophones.allophone, segments.*
        FROM allophones
        JOIN doculect_segments ON allophones.doculect_segment_id = doculect_segments.id
        JOIN segments ON doculect_segments.segment_id = segments.id
        JOIN doculects ON doculect_segments.doculect_id = doculects.id
        WHERE doculects.id = $1;`
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
        } else if (node.kind === 'allophonequery') {
            // do nothing here too
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

function segment_condition(term, table='segments', col='phoneme') {
    if (typeof(term) === 'object') {
        var arr = [];
        for (let k in term) {
            arr.push(`${table}.${k} = '${term[k]}'`);
        }
        return arr.join(' AND ');
    } else if (typeof(term) === 'string') {
        return `${table}.${col} LIKE '${term}'`;
    } else {
        throw new SearchError(`Bad segment condition ${term}`);
    }
}

function contains_query(term, include_marginal, include_loan, num = null, gtlt = '=') {
    var term_cond = segment_condition(term);
    var num_cond = '';

    if (num !== null) {
        num_cond = `HAVING count(*) ${gtlt} ${num}`;
    }

    return `
        doculects.id IN (
            SELECT doculects.id
            FROM doculects
                JOIN doculect_segments ON doculects.id = doculect_segments.doculect_id
                JOIN segments ON doculect_segments.segment_id = segments.id
            WHERE ${term_cond} ${handle_marginal_loan(include_marginal, include_loan)}
            GROUP BY doculects.id
            ${num_cond}
        )`;
}

function does_not_contain_query(term, include_marginal, include_loan) {
    var term_cond = segment_condition(term);

    return `
        doculects.id NOT IN (
            SELECT doculects.id
            FROM doculects
                JOIN doculect_segments ON doculects.id = doculect_segments.doculect_id
                JOIN segments ON doculect_segments.segment_id = segments.id
            WHERE ${term_cond} ${handle_marginal_loan(include_marginal, include_loan, true)}
            GROUP BY doculects.id
        )`;
}

function handle_marginal_loan(include_marginal, include_loan, is_does_not_contain = false) {
    var marginal_cond = '', loan_cond = ''; 

    // PHOIBLE doesn't store loan info, so -l is a nop if we're running on that.
    if (!(+process.env.IS_IPHON)) include_loan = true;

    if (!include_marginal) marginal_cond = 'AND doculect_segments.marginal = FALSE';

    if (!include_loan) loan_cond = 'AND doculect_segments.loan = FALSE';

    // If it's a does_not_contain query, you also have to test for nulls.
    if (is_does_not_contain) {
        if (!include_marginal) marginal_cond += ' OR doculect_segments.marginal IS NULL';
        if (!include_loan)     loan_cond     += ' OR doculect_segments.loan IS NULL';
    }

    return `${marginal_cond} ${loan_cond}`;
}

function prop_query(term) {
    // TODO: this duplicates the `not_a_property` regex... (2019-11-22: does it? added 0-9 for glottocodes)
    // DOI and URL matching aren't exact but this shouldn't be a problem in practice
    return `
        doculects.id ${term.contains ? '' : 'NOT'} IN (
            SELECT doculects.id 
            FROM doculects
            JOIN languages ON doculects.glottocode = languages.glottocode
            JOIN languages_countries ON languages.id = languages_countries.language_id
            JOIN countries ON languages_countries.country_id = countries.id
            WHERE UPPER(REGEXP_REPLACE(${term.table}.${term.column}, '[^A-Za-z0-9]', '', 'g')) = 
                UPPER(REGEXP_REPLACE('${term.value}', '[^A-Za-z0-9]', '', 'g'))
        )`;
}

function allophone_query(term) {
    // Our copy of PHOIBLE data stores allophones as fkey doculect_segment_id, string allophone.
    // IPHON, otoh, stores allophones as fkey doculect_segment_id, fkey(segments) allophone_id.
    // As a consequence, right-hand feature bundles aren't supported for PHOIBLE.
    // And we need separate handling for realizations for PHOIBLE vs. IPHON.

    var left_term, right_term;

    left_term = segment_condition(term.left, 'underlying_segments');
    if (!!(+process.env.IS_IPHON)) {
        right_term = segment_condition(term.right, 'realization_segments');
    } else {
        right_term = segment_condition(term.right, 'allophones', 'allophone');
    }

    var realization_term = '';
    if (!!(+process.env.IS_IPHON)) {
        realization_term = 'JOIN segments realization_segments ON realization_segments.id = allophones.allophone_id';
    }

    return `
        doculects.id IN (
            SELECT doculects.id
            FROM doculects
            JOIN doculect_segments ON doculect_segments.doculect_id = doculects.id
            JOIN allophones ON allophones.doculect_segment_id = doculect_segments.id
            JOIN segments underlying_segments ON underlying_segments.id = doculect_segments.segment_id
            ${realization_term}
            WHERE ${left_term} AND ${right_term}
        )`;
}

function get_sql(q) {
    if (q.kind === 'tree') {
        return `(${get_sql(q.left)} ${q.relation} ${get_sql(q.right)})`;
    }
    if (q.kind === 'query') {
        if (is_contains(q)) {
            return contains_query(q.term, q.include_marginal, q.include_loan, q.num, q.gtlt);
        } else {
            return does_not_contain_query(q.term, q.include_marginal, q.include_loan);
        }
    }
    if (q.kind === 'propertyquery') {
        return prop_query(q);
    }
    if (q.kind === 'allophonequery') {
        return allophone_query(q);
    }
}

function is_contains(q) {
    return q.contains || q.gtlt === '<';
}
