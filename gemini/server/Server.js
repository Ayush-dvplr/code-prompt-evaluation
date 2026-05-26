// server/Server.js
require('dotenv').config();
const http = require('http');
const app = require('./App');
const connectDB = require('./src/db/connectDB');

const PORT = process.env.PORT || 5000;

// Connect to DB then start server
connectDB()
  .then(() => {
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  });
