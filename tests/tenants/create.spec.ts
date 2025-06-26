import request from 'supertest'
import { DataSource, Repository } from 'typeorm'
import AppDataSource from '../../src/config/data-source'
import app from '../../src/app'
import { Tenant } from '../../src/entity/Tenant'
import createJWKSMock from 'mock-jwks'
import { Role } from '../../src/constants'
import { epxressResponseTenant } from '../../src/types'

describe('POST /tenants', () => {
  
  let connection: DataSource
  let jwks: ReturnType<typeof createJWKSMock>
  let tenanatRepo: Repository<Tenant>

  beforeAll(async () => {
    console.log("Hello");

    connection = await AppDataSource.initialize()
    jwks = createJWKSMock('http://localhost:5501')
    tenanatRepo = connection.getRepository(Tenant)
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
    it('should return the tenant by id if the admin requests for it', async () => {
      const TenantData = {
        name: 'Tenant name',
        address: 'tenant address',
      }

      const accessToken = jwks.token({ sub: '1', role: Role.ADMIN })

      const tenant = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(TenantData)

      const response = await request(app)
        .get(`/tenants/${(tenant.body as epxressResponseTenant).id}`)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect((response.body as epxressResponseTenant).id).toBe(
        (tenant.body as epxressResponseTenant).id,
      )
      expect((response.body as epxressResponseTenant).name).toBe(
        TenantData.name,
      )
      expect((response.body as epxressResponseTenant).address).toBe(
        TenantData.address,
      )
    })
    it('should match updated name and address', async () => {
      const TenantData = {
        name: 'Tenant name',
        address: 'tenant address',
      }

      const accessToken = jwks.token({ sub: '1', role: Role.ADMIN })

      const tenant = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(TenantData)

      await tenanatRepo.findOne({
        where: {
          id: (tenant.body as epxressResponseTenant).id,
        },
      })

      const updateData = {
        name: 'falana',
        address: 'dhimkana',
      }

      await request(app)
        .patch(`/tenants/${(tenant.body as epxressResponseTenant).id}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(updateData)

      const updatedTenant = await tenanatRepo.findOne({
        where: {
          id: (tenant.body as epxressResponseTenant).id,
        },
      })

      expect(updatedTenant?.name).toBe(updateData.name)
      expect(updatedTenant?.address).toBe(updateData.address)
    })
    it('should delete the tenant from the database', async () => {
      const TenantData = {
        name: 'Tenant name',
        address: 'tenant address',
      }

      const accessToken = jwks.token({ sub: '1', role: Role.ADMIN })

      const tenant = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(TenantData)

      const res = await request(app)
        .delete(`/tenants/${(tenant.body as epxressResponseTenant).id}`)
        .set('Cookie', [`accessToken=${accessToken}`])

      expect(res.statusCode).toBe(200)

      const Tenant = await tenanatRepo.findOne({
        where: {
          id: (tenant.body as epxressResponseTenant).id,
        },
      })

      expect(Tenant).toBeNull()
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

      const tenantRepo = connection.getRepository(Tenant)
      const tenants = await tenantRepo.find()
      expect(tenants).toHaveLength(0)
    })

    it('should send status 403 if the user is not an admin', async () => {
      const TenantData = {
        name: 'Tenant name',
        address: 'Tenant address',
      }

      const accessToken = jwks.token({ sub: '1', role: Role.MANAGER })

      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(TenantData)

      expect(response.status).toBe(403)

      const tenantRepo = connection.getRepository(Tenant)
      const tenants = await tenantRepo.find()
      expect(tenants).toHaveLength(0)
    })

    it('should send status 400 if any field is missing', async () => {
      const TenantData = {
        name: '',
        address: 'Tenant address',
      }

      const accessToken = jwks.token({ sub: '1', role: Role.ADMIN })

      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(TenantData)

      expect(response.status).toBe(400)
    })
  })
})
