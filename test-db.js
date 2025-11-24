const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://prepwyse:prepwyse_password@127.0.0.1:5432/prepwyse_db?schema=public',
});

client.connect()
  .then(() => {
    console.log('Connected successfully');
    return client.end();
  })
  .catch(err => {
    console.error('Connection error', err.stack);
  });
