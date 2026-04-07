import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import promosRouter from './routes/promos.js'
import claimRouter from './routes/claim.js'
import categoriesRouter from './routes/categories.js'
import authRouter from './routes/auth.js'
import partnerRouter from './routes/partner.js'
import partnerPromosRouter from './routes/partnerPromos.js'

const app = express()
const PORT = process.env.PORT || 3001

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json())

app.use('/api/promos', promosRouter)
app.use('/api/claim', claimRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/auth', authRouter)
app.use('/api/partner', partnerRouter)
app.use('/api/partner', partnerPromosRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
