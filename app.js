const express = require('express');
const app = express();
const port = 1337;

app.get('/', function (req, res) {
	res.send('hello world');
})

app.listen(port, () => console.log(`The great Pshrimp awaketh on port ${port}!`));