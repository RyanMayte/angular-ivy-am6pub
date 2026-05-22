import express from 'express'
import cors from 'cors'
import { config } from 'dotenv'
import recipesRouter from './routes/recipes.js'

config()

const app = express()
const port = process.env.PORT ?? 3001

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:4173'],
  }),
)
app.use(express.json())
app.use('/api', recipesRouter)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
