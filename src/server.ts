import { Config } from './config'
import app from './app'
import logger from './config/logger'
import AppDataSource from './config/data-source'
import { User } from './entity/User'
import { UserService } from './services/userService'
import { Tenant } from './entity/Tenant'

const startServer = async () => {
  try {
    // Connecting to the database:
    await AppDataSource.initialize()
    // Creating a admin if not already created when server starts:
    const userRepo = AppDataSource.getRepository(User)
    const userService = new UserService(
      AppDataSource.getRepository(User),
      AppDataSource.getRepository(Tenant),
    )
    const isAdminCreated = await userRepo.findOne({ where: { role: 'admin' } })
    if (!isAdminCreated) {
      await userService.create({
        firstName: 'IamAdmin',
        lastName: 'Administrator',
        email: Config.ADMIN_EMAIL!,
        password: Config.ADMIN_PASSWORD!,
        role: 'admin',
      })
    }
    console.log('Database connection successful')

    logger.info('Database connection successful')

    // Listening on the port:
    app.listen(Config.PORT, () => {
      console.log(`Server listening on port ${Config.PORT}`)
      logger.info(`Server listening on port ${Config.PORT}`, {
        port: Config.PORT,
      })
    })
  } catch (error) {
    console.error(error)
  }
}

void startServer()
