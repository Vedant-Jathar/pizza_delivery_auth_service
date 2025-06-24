import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Config } from './index'

const AppDataSource = new DataSource({
  type: 'postgres',
  host: Config.DB_HOST,
  port: Number(Config.DB_PORT),
  username: Config.DB_USERNAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
  // synchronize means that the database models would be created without manually migrating them
  // Dont use synchronize in production
  synchronize: false,
  logging: false,
  entities: ['src/entity/*.{ts,js}'],
  migrations: ['src/migration/*.{ts,js}'],
  subscribers: [],
})

export default AppDataSource
