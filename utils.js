// https://thecodebarbarian.com/80-20-guide-to-express-error-handling
module.exports.wrapAsync = function wrapAsync (fn) {
  return function(req, res, next) {
    fn(req, res, next).catch(next);
  };
}

module.exports.indexify = function indexify (results) {
    var values = results.values;
    var indices = build_indices(results);
    var new_results = [];
    for (let res of values) {
        var new_res = {};
        for (let index in indices) {
          new_res[index] = res[indices[index]];
        }
        new_results.push(new_res);
    }
    return new_results;
}

module.exports.build_indices = function build_indices (results) {
    var indices = {};
    for (let i = 0; i < results.columns.length; i++) {
        indices[results.columns[i]] = i;
    }
    return indices;
}

// --------------------------------
// -- Things we need imports for --
// --------------------------------

// TODO: no idea why I need to pass these in - figure out later
module.exports.get_doculect = async function (client, psherlock, psegmentize, doculect_id) {
    try {
        var segments = await client.query(psherlock.inventory_sql, [doculect_id]);
        var language_data = await client.query(psherlock.language_sql, [doculect_id]);
    } catch (err) {
        throw err; // rethrow and catch later
    }

    if (segments.rows != false && language_data.rows != false) { // TODO why?
        let segcharts = psegmentize(segments.rows).to_json();
        return Object.assign(segcharts, language_data.rows[0]);
    } else {
        throw Error('No such language'); // catch later
    }
}