import { Config } from './config'
import app from './app'

const startServer = () => {
  try {
    console.log('Vedant')
    console.log('Vedant')

    app.listen(Config.PORT, () =>
      console.log(`Server listening on PORT ${Config.PORT}`),
    )
  } catch (error) {
    console.error(error)
  }
}

startServer()
