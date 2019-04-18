const client = require('../db_client');
const segment_info = require('../psegment_info')
const fs = require('fs');

// first, figure out which features are relevant so we can filter unfeaturizable.txt later

const features = require('../psegmentizer_features');

const always_relevant_features = ['phoneme', 'id', 'glyph_id'];
var relevant_features = {};
for (let feature_name in features) {
	if (feature_name === 'unknown') continue;
	relevant_features[feature_name] = new Set(always_relevant_features);
	for (let feature_data of features[feature_name]) {
		if (feature_data.meta.name === '' || feature_data.features === undefined) continue; // click diacritics
		for (let feature_bundle of feature_data.features) {
			for (let col_name in feature_bundle) {
				relevant_features[feature_name].add(col_name);
			}
		}
	}
}

function filter_features(segment, feature_name) {
	var res = {};
	for (let prop in segment) {
		if (relevant_features[feature_name] && relevant_features[feature_name].has(prop)) res[prop] = segment[prop];
	}
	return res;
}

function get_segments(err, callback) {
	if (err) throw err;
	client.query('SELECT * FROM segments', handle_segments);
}

function handle_segments(err, segments) {
	if (err) throw err;

	var unfeaturizable = [];

	for (let segment of segments.rows) {
		try {
			var info = segment_info(segment);
		} catch (e) {
			console.log(segment);
			throw e;
		}
		// iterate over all the props
		// if it's an object, it's something that can be undefined
		// so add it to unfeaturizable
		for (let prop in info) {
			if (typeof info[prop] === 'object') {
				if (info[prop].name === 'undefined' || info[prop].order === 99999) {
					unfeaturizable.push([prop, filter_features(segment, prop)]);
				}
			}
		}
	}

	if (unfeaturizable.length === 0) {
		console.log('No unfeaturizable segments!');
	} else {
		fs.writeFile("unfeaturizable.txt", JSON.stringify(unfeaturizable, null, 2), function(err) {
		    if(err) {
		        return console.log(err);
		    }

		    console.log(`${unfeaturizable.length} unfeaturizable segment/property pairs`)
		    console.log("Wrote results to unfeaturizable.txt");
		});
	}

	client.end();
}

client.connect(get_segments)