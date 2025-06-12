import { Config } from './config'
import app from './app'
import logger from './config/logger'

const startServer = () => {
  try {
    console.log('Vedant')
    console.log('Vedant')

    app.listen(Config.PORT, () => {
      logger.info(`Server listening on port ${Config.PORT}`, {
        port: Config.PORT,
      })
      logger.error('Error log')
    })
  } catch (error) {
    console.error(error)
  }
}

startServer()
