import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { User } from '../entity/User'
import { Config } from './index'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: Config.DB_HOST,
  port: Number(Config.DB_PORT),
  username: Config.DB_USERNAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
  // "synchronize:true" means that the database models would be created without manually migrating them
  // Dont use synchronize in production
  synchronize: Config.NODE_ENV === 'test' || Config.NODE_ENV === 'dev',
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
})
