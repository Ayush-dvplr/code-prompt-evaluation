// Server.js — connects to DB first, then starts the HTTP server
require('dotenv').config();
const http = require('http');
const app = require('./App');
const connectDB = require('./src/db/connectDB');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
