import { Config } from './config'
import app from './app'
import logger from './config/logger'

const startServer = () => {
  try {
    app.listen(Config.PORT, () => {
      logger.info(`Server listening on port ${Config.PORT}`, {
        port: Config.PORT,
      })
    })
    console.log(process.env.DB_NAME)
  } catch (error) {
    console.error(error)
  }
}

startServer()
