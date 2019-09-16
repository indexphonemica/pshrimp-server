const { Client } = require('pg');

if (process.env.NODE_ENV === 'production') {
	var client_props = {
		connectionString: process.env.DATABASE_URL,
	}
} else { // presumably it's dev
	var client_props = {
		user: 'postgres',
		password: 'postgres'
	}
	if (process.env.IS_IPHON) {
		client_props.database = 'indexphonemica'
	} else {
		client_props.database = 'pshrimp'
	}
}

const client = new Client(client_props);

module.exports = client;