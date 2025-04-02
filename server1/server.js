const express = require('express');
const pool = require('./config/db');
const createUsersTable = require('./models/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to the database');
  release();
});

// Call the function to create the table
createUsersTable();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 