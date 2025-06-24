"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const data_source_1 = __importDefault(require("../../src/config/data-source"));
const app_1 = __importDefault(require("../../src/app"));
const Tenant_1 = require("../../src/entity/Tenant");
const mock_jwks_1 = __importDefault(require("mock-jwks"));
const constants_1 = require("../../src/constants");
describe('POST /tenants', () => {
    let connection;
    let jwks;
    let tenanatRepo;
    beforeAll(async () => {
        connection = await data_source_1.default.initialize();
        jwks = (0, mock_jwks_1.default)('http://localhost:5501');
        tenanatRepo = connection.getRepository(Tenant_1.Tenant);
    });
    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterEach(() => {
        jwks.stop();
    });
    afterAll(async () => {
        await connection.destroy();
    });
    describe('Given all fields', () => {
        it('should return status code 201 when tenant is created', async () => {
            const TenantData = {
                name: 'Tenanat name',
                address: 'tenant address',
            };
            const accessToken = jwks.token({ sub: '1', role: constants_1.Role.ADMIN });
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(TenantData);
            expect(response.status).toBe(201);
        });
        it('should persist tenant in the database', async () => {
            const TenantData = {
                name: 'Tenanat name',
                address: 'tenant address',
            };
            const accessToken = jwks.token({ sub: '1', role: constants_1.Role.ADMIN });
            await (0, supertest_1.default)(app_1.default)
                .post('/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(TenantData);
            const tenantRepo = connection.getRepository(Tenant_1.Tenant);
            const tenants = await tenantRepo.find();
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(TenantData.name);
            expect(tenants[0].address).toBe(TenantData.address);
        });
        it('should return the tenant by id if the admin requests for it', async () => {
            const TenantData = {
                name: 'Tenant name',
                address: 'tenant address',
            };
            const accessToken = jwks.token({ sub: '1', role: constants_1.Role.ADMIN });
            const tenant = await (0, supertest_1.default)(app_1.default)
                .post('/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(TenantData);
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/tenants/${tenant.body.id}`)
                .set('Cookie', [`accessToken=${accessToken}`]);
            expect(response.body.id).toBe(tenant.body.id);
            expect(response.body.name).toBe(TenantData.name);
            expect(response.body.address).toBe(TenantData.address);
        });
        it('should match updated name and address', async () => {
            const TenantData = {
                name: 'Tenant name',
                address: 'tenant address',
            };
            const accessToken = jwks.token({ sub: '1', role: constants_1.Role.ADMIN });
            const tenant = await (0, supertest_1.default)(app_1.default)
                .post('/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(TenantData);
            await tenanatRepo.findOne({
                where: {
                    id: tenant.body.id,
                },
            });
            const updateData = {
                name: 'falana',
                address: 'dhimkana',
            };
            await (0, supertest_1.default)(app_1.default)
                .patch(`/tenants/${tenant.body.id}`)
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(updateData);
            const updatedTenant = await tenanatRepo.findOne({
                where: {
                    id: tenant.body.id,
                },
            });
            expect(updatedTenant?.name).toBe(updateData.name);
            expect(updatedTenant?.address).toBe(updateData.address);
        });
        it('should delete the tenant from the database', async () => {
            const TenantData = {
                name: 'Tenant name',
                address: 'tenant address',
            };
            const accessToken = jwks.token({ sub: '1', role: constants_1.Role.ADMIN });
            const tenant = await (0, supertest_1.default)(app_1.default)
                .post('/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(TenantData);
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/tenants/${tenant.body.id}`)
                .set('Cookie', [`accessToken=${accessToken}`]);
            expect(res.statusCode).toBe(200);
            const Tenant = await tenanatRepo.findOne({
                where: {
                    id: tenant.body.id,
                },
            });
            expect(Tenant).toBeNull();
        });
    });
    describe('Sad path', () => {
        it('should send status 401 if unauthenticated user tries to create a user', async () => {
            const TenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            };
            const response = await (0, supertest_1.default)(app_1.default).post('/tenants').send(TenantData);
            expect(response.status).toBe(401);
            const tenantRepo = connection.getRepository(Tenant_1.Tenant);
            const tenants = await tenantRepo.find();
            expect(tenants).toHaveLength(0);
        });
        it('should send status 403 if the user is not an admin', async () => {
            const TenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            };
            const accessToken = jwks.token({ sub: '1', role: constants_1.Role.MANAGER });
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(TenantData);
            expect(response.status).toBe(403);
            const tenantRepo = connection.getRepository(Tenant_1.Tenant);
            const tenants = await tenantRepo.find();
            expect(tenants).toHaveLength(0);
        });
        it('should send status 400 if any field is missing', async () => {
            const TenantData = {
                name: '',
                address: 'Tenant address',
            };
            const accessToken = jwks.token({ sub: '1', role: constants_1.Role.ADMIN });
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/tenants')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(TenantData);
            expect(response.status).toBe(400);
        });
    });
});
