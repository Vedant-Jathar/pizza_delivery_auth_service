import 'reflect-metadata'
import express, { NextFunction, Request, Response } from 'express'
import createHttpError, { HttpError } from 'http-errors'
import logger from './config/logger'
import authRouter from './routes/authRoutes'
import cookieParser from 'cookie-parser'
import tenantRouter from './routes/tenantRoutes'

const app = express()
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRouter)
app.use('/tenants', tenantRouter)

// eslint-disable-next-line @typescript-eslint/require-await
app.get('/', async (req, res, next) => {
  res.send('Welcome to auth service')
  const err = createHttpError(401, 'This route is not accessible')
  next(err)
})

app.get('/vedant', (req: Request, res: Response) => {
  res.json({
    message: 'Hello from vedant',
  })
})

// Global error handler(Should be at the end)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message)

  res.status(err.statusCode || err.status || 500).json({
    errors: [
      {
        type: err.name,
        message: err.message,
        path: '',
        location: '',
      },
    ],
  })
})

export default app
