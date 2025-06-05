import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// Security middleware
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))

// API routes placeholder
app.get('/api/test', (req, res) => {
  res.json({ status: 'API connected' })
})

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
  })
}

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
})
