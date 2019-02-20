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