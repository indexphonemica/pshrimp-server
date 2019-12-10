const psegmentize = require('./psegmentizer');
const psherlock   = require('./search');

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

module.exports.get_doculect = async function (client, doculect_id) {
    try {
        var segments = await client.query(psherlock.inventory_sql, [doculect_id]);
        var language_data = await client.query(psherlock.language_sql, [doculect_id]);
        var allophone_data = await client.query(psherlock.allophone_sql, [doculect_id]);
    } catch (err) {
        throw err; // rethrow and catch later
    }


    if (segments.rows != false && language_data.rows != false) { // TODO why?
        let segcharts = psegmentize(segments.rows).to_json();
        let res = Object.assign(segcharts, language_data.rows[0]);
        if (!!(+process.env.IS_IPHON)) {
            res['allophonic_rules'] = process_allophones(allophone_data.rows);
        } else {
            res['allophonic_rules'] = process_allophones_phoible(allophone_data.rows);
        }
        return res;
    } else {
        throw Error('No such language'); // catch later
    }
}

// Helper function for get_doculect, to stitch compound rules back together.
// Also sort the allophonic rules in a linguistically-aware manner; 
// unfortunately we don't have a way to do this that doesn't rely on PhonemeArray 
// and featuralization. (Yet?) So it has to be done here.

// Ordering high vowels before low vowels might be a little weird,
// but it's consistent: order is from top left to bottom right of the chart. 
// To change this, PhonemeMatrix#flatten() would need to be
// made aware of what kind of segment it contains.

// TODO: Absolutely incomprehensible. Rewrite.
function process_allophones(rows) {
    // Build an ordering of all phonemes that appear in allophonic rules
    var unique_segments = {};

    rows.forEach(function (row) {
        row.phoneme.split('+').forEach(function (phoneme) {
            unique_segments[phoneme] = row;
        })
    })

    // `orders` is a mapping of segments to numeric orders
    const psegmentized = psegmentize(Object.values(unique_segments));
    const orders = psegmentized.flatten().reduce(function (acc, cur, i) {
        acc[cur.segment] = i;
        return acc;
    }, {})

    // Filter the allophonic rules so compounds aren't duplicated
    var unique_rules_unsorted = {};
    rows.forEach(function (row) {
        var phonemes = (row.compound || row.phoneme).split('+');
        unique_rules_unsorted[phonemes] = {
            phonemes:    phonemes
        ,   realization: row.realization
        ,   environment: row.environment
        ,   variation:   row.variation
        }
    });

    // Then sort those
    const unique_rules = Object.values(unique_rules_unsorted).sort(function (a_rule, b_rule) {
        var i = 0, a = a_rule.phonemes, b = b_rule.phonemes;
        while (i < a.length && i < b.length) {
            if (orders[a[i]] != orders[b[i]]) return orders[a[i]] - orders[b[i]];
            i++;
        }
        return a.length - b.length;
    })

    return unique_rules;
}

function process_allophones_phoible(rows) {
    var phonemes_to_allophones = {};
    
    // PHOIBLE doesn't featuralize allophones, so we can't sort them. Oh well.
    // Can still sort the underlying segments.
    rows.forEach(function (row) {
        let allophone = row.allophone;
        let phoneme = row.phoneme;

        if (!phonemes_to_allophones.hasOwnProperty(phoneme)) phonemes_to_allophones[phoneme] = [];

        phonemes_to_allophones[phoneme].push(allophone);
    })

    // Discard things with only one allophone - less clutter.
    Object.keys(phonemes_to_allophones).forEach(function (k) {
        let v = phonemes_to_allophones[k];
        if (v.length < 2) {
            delete phonemes_to_allophones[k];
        }
    });

    const underlying_phonemes = psegmentize(rows);

    const orders = underlying_phonemes.flatten().reduce(function (acc, cur, i) {
        acc[cur.segment] = i;
        return acc;
    }, {});

    const unique_rules = Object.entries(phonemes_to_allophones).sort((a, b) => orders[a[0]] - orders[b[0]]);

    return unique_rules;
}