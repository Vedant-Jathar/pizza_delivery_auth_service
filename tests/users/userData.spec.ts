import request from 'supertest'
import app from '../../src/app'
import createJWKSMock from 'mock-jwks'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { User } from '../../src/entity/User'
import { Role } from '../../src/constants'

describe('GET /auth/self', () => {
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKSMock>

  beforeAll(async () => {
    connection = await AppDataSource.initialize()
    jwks = createJWKSMock('http://localhost:5501')
  })

  beforeEach(async () => {
    jwks.start()
    await connection.dropDatabase()
    await connection.synchronize()
  })

  afterEach(() => {
    jwks.stop()
  })

  describe('If user exists', () => {
    it('should return user id if the access token is valid and not expired', async () => {
      // Register the user:
      const userData = {
        firstName: 'Vedant',
        lastName: 'Jathar',
        email: 'jatharvedant16@gmail.com',
        password: 'ved@123',
      }
      const userRepo = connection.getRepository(User)
      const user = await userRepo.save({ ...userData, role: Role.CUSTOMER })

      // Create a access token that will be sent with the request:
      const accessToken = jwks.token({ sub: String(user.id), role: user.role })

      // Sending the request to get self and also setting the cookie
      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', `accessToken=${accessToken}`)

      // Expecting
      expect((response.body as Record<string, string>).id).toBe(user.id)
    })
  })

  describe('If user does not exist', () => {
    it('should return status code 404 if user not found', async () => {
      const accesToken = jwks.token({ sub: '1', role: Role.CUSTOMER })
      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', `accessToken=${accesToken}`)
        .send()
      expect(response.status).toBe(404)
    })
  })
})
