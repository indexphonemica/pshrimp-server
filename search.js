class SearchError extends Error {};

exports.build_sql = function (qtree) {
    // We go through the query tree twice - first to pull all the contains queries
    // so we can display the segments, and then to generate the actual SQL.
    // The actual SQL is generated in get_sql().
    var segment_conditions = build_segment_conditions(qtree)

    // Special case: don't return any segments if it's an entirely negative query
    // (because otherwise you're returning the entire inventory of the doculect)
    function is_negative(q) {
        if (q.kind === 'tree') {
            return is_negative(q.left) && is_negative(q.right);
        } else {
            return !is_contains(q);
        }
    }
    var do_segments = 'segments.phoneme';
    if (is_negative(qtree)) do_segments = false;

    return `
        SELECT doculects.id, doculects.language_name, doculects.source, doculects.glottocode${do_segments ? ', ' + do_segments : ''}
        FROM doculects
        ${do_segments ? `JOIN doculect_segments ON doculects.id = doculect_segments.doculect_id
        JOIN segments ON doculect_segments.segment_id = segments.id` : ''}
        WHERE ${get_sql(qtree)} ${segment_conditions && do_segments ? 'AND (' + segment_conditions + ')' : ''}
        ORDER BY doculects.id
        ;`;
}

exports.inventory_sql = `
    SELECT segments.*
    FROM doculects 
    JOIN doculect_segments ON doculects.id = doculect_segments.doculect_id
    JOIN segments ON doculect_segments.segment_id = segments.id
    WHERE doculects.id = $1;`;

exports.language_sql = `
    SELECT doculects.*
    FROM doculects
    WHERE doculects.id = $1;`;

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

function contains_query(term, num=null, gtlt='=') {
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
    return `
        doculects.id ${term.contains ? '' : 'NOT'} IN (
            SELECT doculects.id 
            FROM doculects
            JOIN languages ON doculects.glottocode = languages.glottocode
            WHERE UPPER(${term.prop_name}) = UPPER('${term.prop_value}')
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