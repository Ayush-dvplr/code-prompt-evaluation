// server.js — loads env, connects to DB, then starts the HTTP server
require('./config/dotenvConfig')
const http = require('http')
const app = require('./app')
const connectDB = require('./db/connectDB')

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => {
    const server = http.createServer(app)
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
    })
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })
