import 'reflect-metadata'
import express, { Request, Response } from 'express'
import createHttpError from 'http-errors'
import authRouter from './routes/authRoutes'
import cookieParser from 'cookie-parser'
import tenantRouter from './routes/tenantRoutes'
import userRouter from './routes/userRoutes'
import cors from 'cors'
import { globalErrorHandler } from './middlewares/globalErrorHandler'

const app = express()
app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  }),
)

app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRouter)
app.use('/tenants', tenantRouter)
app.use('/users', userRouter)

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

app.use(globalErrorHandler)

export default app
