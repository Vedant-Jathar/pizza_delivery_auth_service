import createJWKSMock from 'mock-jwks'
import { DataSource, Repository } from 'typeorm'
import AppDataSource from '../../src/config/data-source'
import { Role } from '../../src/constants'
import request from 'supertest'
import app from '../../src/app'
import { User } from '../../src/entity/User'
import { Tenant } from '../../src/entity/Tenant'

describe('POST /users', () => {
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKSMock>
  let userRepo: Repository<User>
  let tenantRepo: Repository<Tenant>

  beforeAll(async () => {
    connection = await AppDataSource.initialize()
    jwks = createJWKSMock('http://localhost:5501')
    userRepo = connection.getRepository(User)
    tenantRepo = connection.getRepository(Tenant)
  })

  beforeEach(async () => {
    jwks.start()
    await connection.dropDatabase()
    await connection.synchronize()
  })

  afterEach(() => {
    jwks.stop()
  })

  describe('Happy path', () => {
    it('should persist the user in the databse', async () => {
      const tenant = await tenantRepo.save({
        name: 'Ten name',
        address: 'ten address',
      })

      const userData = {
        firstName: 'Vedant',
        lastName: 'Jathar',
        email: 'jatharvedant16@gmail.com',
        password: 'ved@123',
        tenantId: tenant.id,
        role: Role.MANAGER,
      }

      // Create a access token that will be sent with the request:
      const accessToken = jwks.token({ sub: '1', role: Role.ADMIN })

      await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(userData)

      const users = await userRepo.find()

      expect(users).toHaveLength(1)
    })
    it('should return the role of the user as manager', async () => {
      const userData = {
        firstName: 'Vedant',
        lastName: 'Jathar',
        email: 'jatharvedant16@gmail.com',
        password: 'ved@123',
        role: Role.MANAGER,
      }

      // Create a access token that will be sent with the request:
      const accessToken = jwks.token({ sub: '1', role: Role.ADMIN })

      await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(userData)

      const users = await userRepo.find()

      expect(users[0].role).toBe('manager')
    })
  })

  describe('Sad path', () => {
    it('should return 403 if non-admin tries to create a manger user', async () => {
      const userData = {
        firstName: 'Vedant',
        lastName: 'Jathar',
        email: 'jatharvedant16@gmail.com',
        password: 'ved@123',
        tenantId: 1,
      }

      // Create a access token that will be sent with the request:
      const accessToken = jwks.token({ sub: '1', role: Role.MANAGER })

      const res = await request(app)
        .post('/users')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(userData)

      const users = await userRepo.find()

      expect(res.status).toBe(403)

      expect(users).toHaveLength(0)
    })
  })
})
