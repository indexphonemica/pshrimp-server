const express = require('express');
const app = express();
const port = 1337;

const sqlite3 = require('sqlite3');
const dbFilePath = './phoible.sqlite'
const db = new sqlite3.Database(dbFilePath, err => {
	if (err) {
		console.log(err);
	} else {
		console.log('Connected to database');
	}
});

const psentence = require('./parse');
const psherlock = require('./search');

// async stuff for DB - https://gist.github.com/yizhang82/26101c92faeea19568e48224b09e2d1c
db.getAsync = function (sql) {
	return new Promise((resolve, reject) => {
		this.get(sql, (err, row) => {
			if (err) {
				reject(err);
			} else {
				resolve(row);
			}
		});
	});
}

db.allAsync = function (sql) {
	return new Promise((resolve, reject) => {
		this.all(sql, (err, row) => {
			if (err) {
				reject(err);
			} else {
				resolve(row);
			}
		});
	});
}

// async/await for statement calls, maybe?
const getAsync = function (stmt) {
	return new Promise((resolve, reject) => {
		stmt.get((err, row) => {
			err ? reject(err) : resolve(row);
		});
	});
}
const allAsync = function (stmt) {
	return new Promise((resolve, reject) => {
		stmt.all((err, row) => {
			err ? reject(err) : resolve(row);
		})
	})
}

app.get('/', function (req, res) {
	res.send('hello world');
})

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/query/:query', async function (req, res) {
	const query_text = decode(req.params.query);
	const query = psentence.parse(query_text);
	const query_sql = psherlock.build_sql(query);
	const results = await db.allAsync(query_sql);

	// SQL will return one row per phoneme.
	// Aggregate these so there's a phonemes value with an array.
	// This relies on language rows always being contiguous!
	var new_results = [];
	var processed = new Set();
	for (let i of results) {
		if (!processed.has(i.id)) {
			if (lang) new_results.push(lang);

			var {phoneme, ...lang} = i; // really weird destructuring syntax - `lang` ends up with all the row props except `phoneme` 
			processed.add(i.id);
			if (i.phoneme) lang.phonemes = [];
		}
		if (i.phoneme) lang.phonemes.push(i.phoneme);
	}
	new_results.push(lang);

	res.send(new_results);
})

app.get('/language/:language', async function (req, res) {
	const stmt = db.prepare(psherlock.inventory_sql, {$id: req.params.language});
	
	const language = await allAsync(stmt);
	if (language != false) { // sic
		res.send(language);
	} else {
		res.send({err: 'No such language'});
	}
})

function decode(thing) {
	return decodeURIComponent(thing.replace(/\\e/g,'=').replace(/\\\+/g,'&').replace(/\\\\/g,'\\'));
}

app.listen(port, () => console.log(`The great Pshrimp awaketh on port ${port}!`));