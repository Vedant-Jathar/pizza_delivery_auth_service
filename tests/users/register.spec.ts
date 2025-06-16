import app from '../../src/app'
import request from 'supertest'
import { AppDataSource } from '../../src/config/data-source'
import { DataSource } from 'typeorm'
// import { truncateTables } from '../utils'
import { User } from '../../src/entity/User'
import { Role } from '../../src/constants'

describe('POST /auth/register', () => {
  let connection: DataSource

  beforeAll(async () => {
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    // await truncateTables(connection)
    await connection.dropDatabase()
    await connection.synchronize()

    // const userRepo = connection.getRepository(User)
    // const users = userRepo.find()
    // console.log("Users", users);
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

    it('should return id of the created user', async () => {
      // Arrange:
      const userData = {
        firstName: 'Vedant',
        lastName: 'Jathar',
        email: 'jatharvedant16@gmail.com',
        password: 'ved@123',
      }

      // Act:
      const response = await request(app).post('/auth/register').send(userData)

      console.log('response.body', response.body)

      // Assert:
      expect(response.body).toHaveProperty('id')
      const userRepository = connection.getRepository(User)
      const users = await userRepository.find()
      expect((response.body as Record<string, string>).id).toBe(users[0].id)
    })

    it("should assign role of 'customer' to user", async () => {
      // Arrange:
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
      expect(users[0].role).toBe(Role.CUSTOMER)
    })

    it('should hash the password', async () => {
      // Arrange:
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
      expect(users[0].password).not.toBe(userData.password)
      expect(users[0].password).toHaveLength(60)
      expect(users[0].password).toMatch(/^\$2[a|b]\$\d+\$/)
    })
  })

  describe('Some field missing', () => {})
})
