import express, { NextFunction, Request, Response } from 'express'
import createHttpError, { HttpError } from 'http-errors'
import logger from './config/logger'

const app = express()

app.use(express.json())

// eslint-disable-next-line @typescript-eslint/require-await
app.get('/', async (req, res, next) => {
  const err = createHttpError(401, 'This route is not accessible')
  next(err)
  // res.send('Welcome to auth service')
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

  res.status(err.statusCode || 500).json({
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
