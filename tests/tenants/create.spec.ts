import request from 'supertest'
import { DataSource } from 'typeorm'
import AppDataSource from '../../src/config/data-source'
import app from '../../src/app'
import { Tenant } from '../../src/entity/Tenant'
import createJWKSMock from 'mock-jwks'
import { Role } from '../../src/constants'

describe('POST /tenants', () => {
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

  afterAll(async () => {
    await connection.destroy()
  })

  describe('Given all fields', () => {
    it('should return status code 201 when tenant is created', async () => {
      const TenantData = {
        name: 'Tenanat name',
        address: 'tenant address',
      }

      const accessToken = jwks.token({ sub: '1', role: Role.ADMIN })

      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(TenantData)

      expect(response.status).toBe(201)
    })
    it('should persist tenant in the database', async () => {
      const TenantData = {
        name: 'Tenanat name',
        address: 'tenant address',
      }
      const accessToken = jwks.token({ sub: '1', role: Role.ADMIN })

      await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(TenantData)

      const tenantRepo = connection.getRepository(Tenant)
      const tenants = await tenantRepo.find()

      expect(tenants).toHaveLength(1)
      expect(tenants[0].name).toBe(TenantData.name)
      expect(tenants[0].address).toBe(TenantData.address)
    })
  })

  describe('Sad path', () => {
    it('should send status 401 if unauthenticated user tries to create a user', async () => {
      const TenantData = {
        name: 'Tenant name',
        address: 'Tenant address',
      }

      const response = await request(app).post('/tenants').send(TenantData)

      expect(response.status).toBe(401)
    })
  })
})
