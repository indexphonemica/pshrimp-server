const { Client } = require('pg');

if (process.env.NODE_ENV === 'production') {
	var client_props = {
		connectionString: process.env.DATABASE_URL,
	}
} else { // presumably it's dev
	var client_props = {
		user: 'postgres',
		password: 'postgres',
		database: 'indexphonemica',
	}
}

const client = new Client(client_props);

module.exports = client;