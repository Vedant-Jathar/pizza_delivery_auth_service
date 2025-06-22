import { DataSource } from 'typeorm'
import AppDataSource from '../../src/config/data-source'
import request from 'supertest'
import app from '../../src/app'
import { isJwt } from '../utils'

describe('POST /auth/login', () => {
  let connection: DataSource

  beforeAll(async () => {
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    // await truncateTables(connection)
    await connection.dropDatabase()
    await connection.synchronize()
  })

  afterAll(async () => {
    await connection?.destroy()
  })

  describe('tests for login', () => {
    it('should return access token and refresh token in the cookies', async () => {
      // Assert:
      const userData = {
        firstName: 'Vedant',
        lastName: 'Jathar',
        email: 'jatharvedant16@gmail.com',
        password: 'ved@123',
      }

      // Act:
      // Registering the user:
      await request(app).post('/auth/register').send(userData)

      // Logging the user in:
      const response = await request(app)
        .post('/auth/login')
        .send({ email: userData.email, password: userData.password })

      // Assert:
      let accessToken = null
      let refreshToken = null

      const cookies =
        (response.headers['set-cookie'] as unknown as string[]) || []

      cookies.forEach((cookie) => {
        if (cookie.startsWith('accessToken')) {
          accessToken = cookie.split(';')[0].split('=')[1]
        }
        if (cookie.startsWith('refreshToken')) {
          refreshToken = cookie.split(';')[0].split('=')[1]
        }
      })

      expect(accessToken).not.toBeNull()
      expect(refreshToken).not.toBeNull()

      expect(isJwt(accessToken)).toBeTruthy()
      expect(isJwt(refreshToken)).toBeTruthy()
    })

    it('should return 400 status if email does not exist', async () => {
      // Assert:
      const userData = {
        firstName: 'Vedant',
        lastName: 'Jathar',
        email: 'jatharvedant16@gmail.com',
        password: 'ved@123',
      }

      // Act:
      // Registering the user:
      await request(app).post('/auth/register').send(userData)

      // Logging the user in:
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'jatharvedant1678@gmail.com', password: 'ved@123' })

      // Assert:
      expect(response.status).toBe(400)
    })

    it('should return 400 status if password is incorrect', async () => {
      // Assert:
      const userData = {
        firstName: 'Vedant',
        lastName: 'Jathar',
        email: 'jatharvedant16@gmail.com',
        password: 'ved@123',
      }

      // Act:
      // Registering the user:
      await request(app).post('/auth/register').send(userData)

      // Logging the user in:
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'jatharvedant1678@gmail.com', password: 'ved@12345' })

      // Assert:
      expect(response.status).toBe(400)
    })
  })
})
