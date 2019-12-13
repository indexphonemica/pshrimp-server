const psegmentize = require('./psegmentizer');
const db_info = require('./db_info'); // we don't use this anymore; delete later (TODO)
                                      // but we probably should

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
    const doculect_results = await try_run(doculect_sql, run_query_fn);

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
    if (any_in_tree(qtree, is_contains)) {
        // Query the DB for segments
        const segment_sql = build_segment_sql(qtree);
        const segment_results = await try_run(segment_sql, run_query_fn);
        const segment_rows = segment_results.rows;

        // Collate segments
        // This has to be a map, because doculects_by_id is...
        // ...and that has to be a map in order to preserve the DB's ordering.
        // Since doculects_by_id is a map, its keys are ints.
        // And JS doesn't do automatic casting here. Surprise!
        let segments = collate(segment_rows);
        be_paranoid(segments, doculect_pks, 'segment');

        // Now generate the tables and add them to the results
        for (let d_id of segments.keys()) {
            doculects_by_id.get(d_id).phonemes = psegmentize(segments.get(d_id)).flatten();
        }
    }

    // See if we need to collect allophonic rules
    if (any_in_tree(qtree, q => q.kind === 'allophonequery')) {
        // Query the DB for allophones
        const allophone_sql = build_allophone_sql(qtree);
        const allophone_results = await try_run(allophone_sql, run_query_fn);
        const allophone_rows = allophone_results.rows;
        
        // Collate allophones - as above, this has to be a map
        let allophones = collate(allophone_rows);
        be_paranoid(allophones, doculect_pks, 'allophone');

        // Lame hack - TODO: fix this 
        // Really we should be thinking in terms of input and output...
        // Also should DRY all the rule object-relational stuff
        function handle_compounds(rule) {
            if (rule.compound) rule.phoneme = rule.compound;
            return rule;
        }

        // Now generate the tables and add them to the results
        for (let d_id of allophones.keys()) {
            doculects_by_id.get(d_id).allophones = allophones.get(d_id).map(handle_compounds);
        }
    }

    return [...doculects_by_id.values()];
}

async function try_run(sql, run_query_fn) {
    try {
        const res = await run_query_fn(sql);
        return res;
    } catch (e) {
        console.error(e);
        console.error(sql);
        throw e;
    }
}

// *****************************
// *** SQL exports for utils ***
// *****************************

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


// ***************************
// *** Collation utilities ***
// ***************************

function collate(rows) {
    let collation = new Map();
    for (let row of rows) {
        let d_id = row.doculect_id;
        if (!collation.has(d_id)) collation.set(d_id, []);
        collation.get(d_id).push(row);
    }
    return collation;
}

// https://stackoverflow.com/questions/31128855/comparing-ecma6-sets-for-equality
function setEq(a, b) {
    return a.size === b.size && [...a].every(value => b.has(value));
}

function any_in_tree(node, func) {
    return (node.kind === 'tree') ? (any_in_tree(node.left, func) || any_in_tree(node.right, func)) : func(node);
}

/** Makes absolutely sure that there's no mismatch between results.
    There never should be, and this check is probably unnecessary.
    But it can't hurt.

    collation :: Map, doculect_pks :: Map, name_of_collated_thing :: str
*/
function be_paranoid(collation, doculect_pks, name_of_collated_thing) {
    const collation_pks = new Set(collation.keys());
    if (!setEq(collation_pks, doculect_pks)) {
        console.error('Doculect/segment mismatch');
        console.error(collation_pks);
        console.error(doculect_pks);
        console.error(qtree);
        throw new SearchError(`Something has gone very wrong (doculect/${name_of_collated_thing} mismatch)`);
    }
}

// ********************
// *** SQL builders ***
// ********************

function build_doculect_sql(qtree) {
    // We go through the query tree twice - first to pull all the contains queries
    // so we can display the segments, and then to generate the actual SQL.
    // The actual SQL is generated in get_sql().

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

function build_allophone_sql(qtree) {
    // Here we rerun get_sql. Could cache this instead, but probably unnecessary.
    // Note that we don't use the doculect pks here - we shouldn't need to.

    var allophone_conditions = build_allophone_conditions(qtree);

    return `
        SELECT
          allophones.*, phonemes.phoneme AS phoneme, realizations.phoneme AS realization,
          doculect_segments.doculect_id AS doculect_id
        FROM
          doculects
          JOIN doculect_segments ON doculect_segments.doculect_id = doculects.id
          JOIN allophones ON allophones.doculect_segment_id = doculect_segments.id
          JOIN segments phonemes ON phonemes.id = doculect_segments.segment_id
          ${realization_term()}
        WHERE
          ${get_sql(qtree)} AND (${allophone_conditions})
        ORDER BY
          doculect_id
    ;`;
}

function build_segment_conditions(qtree) {
    var query_stack = [];
    var contains_queries = [];

    var process_node = function (node) {
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

function build_allophone_conditions(qtree) {
    var query_stack = [];
    var allophone_queries = [];

    var process_node = function (node) {
        if (node.kind === 'tree') {
            query_stack.push(node.left);
            query_stack.push(node.right);
        } else if (node.kind === 'allophonequery') {
            allophone_queries.push(allophone_condition(node));
        }
    }
    process_node(qtree);
    while (query_stack.length > 0) {
        process_node(query_stack.pop());
    }
    return allophone_queries.join(' OR ');
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

function allophone_condition(term) {
    // Our copy of PHOIBLE data stores allophones as fkey doculect_segment_id, string allophone.
    // IPHON, otoh, stores allophones as fkey doculect_segment_id, fkey(segments) allophone_id.
    // As a consequence, right-hand feature bundles aren't supported for PHOIBLE.
    // And we need separate handling for realizations for PHOIBLE vs. IPHON.

    var left_term, right_term;

    left_term = segment_condition(term.left, 'phonemes');
    if (!!(+process.env.IS_IPHON)) {
        right_term = segment_condition(term.right, 'realizations');
    } else {
        right_term = segment_condition(term.right, 'allophones', 'allophone');
    }
    return `(${left_term} AND ${right_term})`
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
    return `
        doculects.id IN (
            SELECT doculects.id
            FROM doculects
            JOIN doculect_segments ON doculect_segments.doculect_id = doculects.id
            JOIN allophones ON allophones.doculect_segment_id = doculect_segments.id
            JOIN segments phonemes ON phonemes.id = doculect_segments.segment_id
            ${realization_term()}
            WHERE ${allophone_condition(term)}
        )`;
}
function realization_term() {
    if (!!(+process.env.IS_IPHON)) {
        return 'JOIN segments realizations ON realizations.id = allophones.allophone_id';
    }
    return '';
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
