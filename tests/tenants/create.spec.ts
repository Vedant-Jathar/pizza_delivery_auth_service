import request from 'supertest'
import { DataSource } from 'typeorm'
import AppDataSource from '../../src/config/data-source'
import app from '../../src/app'
import { Tenant } from '../../src/entity/Tenant'

describe('POST /tenants', () => {
  let connection: DataSource
  beforeAll(async () => {
    connection = await AppDataSource.initialize()
  })

  beforeEach(async () => {
    await connection.dropDatabase()
    await connection.synchronize()
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

      const response = await request(app).post('/tenants').send(TenantData)

      expect(response.status).toBe(201)
    })
    it('should persist tenant in the database', async () => {
      const TenantData = {
        name: 'Tenanat name',
        address: 'tenant address',
      }

      await request(app).post('/tenants').send(TenantData)

      const tenantRepo = connection.getRepository(Tenant)
      const tenants = await tenantRepo.find()

      expect(tenants).toHaveLength(1)
      expect(tenants[0].name).toBe(TenantData.name)
      expect(tenants[0].address).toBe(TenantData.address)
    })
  })
})
