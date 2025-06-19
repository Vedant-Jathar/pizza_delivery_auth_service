import { Config } from './config'
import app from './app'
import logger from './config/logger'
import { AppDataSource } from './config/data-source'

const startServer = async () => {
  try {
    // Connecting to the database:
    await AppDataSource.initialize()
    logger.info('Database connection successful')

    // Listening on the port:
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

void startServer()
