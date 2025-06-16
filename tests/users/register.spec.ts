import app from '../../src/app'
import request from 'supertest'
import { AppDataSource } from '../../src/config/data-source'
import { DataSource } from 'typeorm'
import { truncateTables } from '../utils'
import { User } from '../../src/entity/User'

describe('POST /auth/register', () => {
  let connection: DataSource

  beforeAll(async () => {
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    await truncateTables(connection)
  })

  afterAll(async () => {
    await connection?.destroy()
  })

  describe('Given all Fields', () => {
    it('Should return status code 201(Created)', async () => {
      // console.log(process.env.DB_NAME);

      // AAA (Arrange, Act ,Assert)
      // Arrange:
      const userData = {
        firstName: 'Vedant',
        lastName: 'Jathar',
        email: 'jatharvedant16@gmail.com',
        password: 'ved@123',
      }

      // Act:
      const response = await request(app).post('/auth/register').send(userData)

      // Assert:
      expect(response.statusCode).toBe(201)
    })

    it('Should return response as json', async () => {
      // AAA (Arrange, Act ,Assert)
      // Arrange:
      const userData = {
        firstName: 'Vedant',
        lastName: 'Jathar',
        email: 'jatharvedant16@gmail.com',
        password: 'ved@123',
      }

      // Act:
      const response = await request(app).post('/auth/register').send(userData)

      // Assert:
      expect(
        (response.headers as Record<string, string>)['content-type'],
      ).toEqual(expect.stringContaining('json'))
    })

    it('Should persist user in the database', async () => {
      const userData = {
        firstName: 'Vedant',
        lastName: 'Jathar',
        email: 'jatharvedant16@gmail.com',
        password: 'ved@123',
      }

      // Act:
      await request(app).post('/auth/register').send(userData)

      // Assert:
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect(users).toHaveLength(1)
      expect(users[0].firstName).toBe(userData.firstName)
      expect(users[0].lastName).toBe(userData.lastName)
      expect(users[0].email).toBe(userData.email)
    })
  })

  describe('Some field missing', () => {})
})
