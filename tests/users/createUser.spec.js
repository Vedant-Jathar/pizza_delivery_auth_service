"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mock_jwks_1 = __importDefault(require("mock-jwks"));
const data_source_1 = __importDefault(require("../../src/config/data-source"));
const constants_1 = require("../../src/constants");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../src/app"));
const User_1 = require("../../src/entity/User");
const Tenant_1 = require("../../src/entity/Tenant");
describe('POST /users', () => {
    let connection;
    let jwks;
    let userRepo;
    let tenantRepo;
    beforeAll(async () => {
        connection = await data_source_1.default.initialize();
        jwks = (0, mock_jwks_1.default)('http://localhost:5501');
        userRepo = connection.getRepository(User_1.User);
        tenantRepo = connection.getRepository(Tenant_1.Tenant);
    });
    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterEach(() => {
        jwks.stop();
    });
    describe('Happy path', () => {
        it('should persist the user in the databse', async () => {
            const tenant = await tenantRepo.save({
                name: 'Ten name',
                address: 'ten address',
            });
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: 'jatharvedant16@gmail.com',
                password: 'ved@123',
                tenantId: tenant.id,
                role: constants_1.Role.MANAGER,
            };
            // Create a access token that will be sent with the request:
            const accessToken = jwks.token({ sub: '1', role: constants_1.Role.ADMIN });
            await (0, supertest_1.default)(app_1.default)
                .post('/users')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(userData);
            const users = await userRepo.find();
            expect(users).toHaveLength(1);
        });
        it('should return the role of the user as manager', async () => {
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: 'jatharvedant16@gmail.com',
                password: 'ved@123',
                role: constants_1.Role.MANAGER,
            };
            // Create a access token that will be sent with the request:
            const accessToken = jwks.token({ sub: '1', role: constants_1.Role.ADMIN });
            await (0, supertest_1.default)(app_1.default)
                .post('/users')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(userData);
            const users = await userRepo.find();
            expect(users[0].role).toBe('manager');
        });
    });
    describe('Sad path', () => {
        it('should return 403 if non-admin tries to create a manger user', async () => {
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: 'jatharvedant16@gmail.com',
                password: 'ved@123',
                tenantId: 1,
            };
            // Create a access token that will be sent with the request:
            const accessToken = jwks.token({ sub: '1', role: constants_1.Role.MANAGER });
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/users')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send(userData);
            const users = await userRepo.find();
            expect(res.status).toBe(403);
            expect(users).toHaveLength(0);
        });
    });
});
