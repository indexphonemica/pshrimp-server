const client = require('../db_client');
const segment_info = require('../psegment_info')
const fs = require('fs');

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
					unfeaturizable.push([prop, segment]);
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