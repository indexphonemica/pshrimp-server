const { Client } = require('pg');

if (process.env.NODE_ENV === 'production') {
	const client_props = {
		connectionString: process.env.DATABASE_URL,
	}
} else { // presumably it's dev
	const client_props = {
		user: 'postgres',
		password: 'postgres',
		database: 'pshrimp',
	}
}

const client = new Client({
	user: 'postgres',
	password: 'postgres',
	database: 'pshrimp',
});
client.connect();

module.exports = client;