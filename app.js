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

// async/await for statement calls, maybe?
const getAsync = function (stmt) {
	return new Promise((resolve, reject) => {
		stmt.get((err, row) => {
			err ? reject(err) : resolve(row);
		});
	});
}

app.get('/', function (req, res) {
	res.send('hello world');
})

app.get('/query/:query', function (req, res) {
	const query_text = decode(req.params.query);
	const query = psentence.parse(query_text);
	const query_sql = psherlock.build_sql(query);
	res.send(query_sql);
})

app.get('/language/:language', async function (req, res) {
	const stmt = db.prepare('SELECT * FROM languages WHERE id = $id', {$id: req.params.language});
	
	const language = await getAsync(stmt);
	if (language) {
		res.send(language);
	} else {
		res.send({err: 'No such language'});
	}
})

function decode(thing) {
	return decodeURIComponent(thing.replace(/\\e/g,'=').replace(/\\\+/g,'&').replace(/\\\\/g,'\\'));
}


app.listen(port, () => console.log(`The great Pshrimp awaketh on port ${port}!`));