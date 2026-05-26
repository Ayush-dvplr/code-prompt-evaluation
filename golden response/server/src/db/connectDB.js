// connectDB.js — MongoDB connection with exponential backoff retry logic
const mongoose = require('mongoose')

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/todo-mern'
  const maxRetries = 5
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(mongoURI)
      console.log('MongoDB connected')
      return
    } catch (err) {
      console.warn(`MongoDB attempt ${attempt}/${maxRetries} failed: ${err.message}`)
      if (attempt < maxRetries) {
        const wait = attempt * 2000 // 2s, 4s, 6s, 8s, 10s
        console.warn(`Retrying in ${wait / 1000}s...`)
        await delay(wait)
      }
    }
  }

  throw new Error('Could not connect to MongoDB after multiple attempts.')
}

module.exports = connectDB
