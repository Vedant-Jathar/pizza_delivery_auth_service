"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../../src/app"));
const supertest_1 = __importDefault(require("supertest"));
const data_source_1 = __importDefault(require("../../src/config/data-source"));
// import { truncateTables } from '../utils'
const User_1 = require("../../src/entity/User");
const constants_1 = require("../../src/constants");
const utils_1 = require("../utils");
const RefreshToken_1 = require("../../src/entity/RefreshToken");
describe('POST /auth/register', () => {
    let connection;
    beforeAll(async () => {
        connection = await data_source_1.default.initialize();
    });
    beforeEach(async () => {
        // await truncateTables(connection)
        await connection.dropDatabase();
        await connection.synchronize();
    });
    afterAll(async () => {
        await connection?.destroy();
    });
    describe('Given all Fields', () => {
        it('should return status code 201(Created) when a user is successfully created', async () => {
            // console.log(process.env.DB_NAME);
            // AAA (Arrange, Act ,Assert)
            // Arrange:
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: 'jatharvedant16@gmail.com',
                password: 'ved@123',
            };
            // Act:
            const response = await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // Assert:
            expect(response.status).toBe(201);
        });
        it('should return response as json', async () => {
            // AAA (Arrange, Act ,Assert)
            // Arrange:
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: 'jatharvedant16@gmail.com',
                password: 'ved@123',
            };
            // Act:
            const response = await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // Assert:
            expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
        });
        it('Should persist user in the database', async () => {
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: 'jatharvedant16@gmail.com',
                password: 'ved@123',
            };
            // Act:
            await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // Assert:
            const userRepository = connection.getRepository(User_1.User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });
        it('should return id of the created user', async () => {
            // Arrange:
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: 'jatharvedant16@gmail.com',
                password: 'ved@123',
            };
            // Act:
            const response = await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // console.log('response.body', response.body)
            // Assert:
            expect(response.body).toHaveProperty('id');
            const userRepository = connection.getRepository(User_1.User);
            const users = await userRepository.find();
            expect(response.body.id).toBe(users[0].id);
        });
        it("should assign role of 'customer' to user", async () => {
            // Arrange:
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: 'jatharvedant16@gmail.com',
                password: 'ved@123',
            };
            // Act:
            await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // Assert:
            const userRepository = connection.getRepository(User_1.User);
            const users = await userRepository.find();
            expect(users[0].role).toBe(constants_1.Role.CUSTOMER);
        });
        it('should hash the password', async () => {
            // Arrange:
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: 'jatharvedant16@gmail.com',
                password: 'ved@123',
            };
            // Act:
            await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // Assert:
            const userRepository = connection.getRepository(User_1.User);
            const users = await userRepository.find({ select: ['password'] });
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2[a|b]\$\d+\$/);
        });
        it('should send status 400 if email already exists', async () => {
            // Arrange:
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: 'jatharvedant16@gmail.com',
                password: 'ved@123',
            };
            const userRepo = connection.getRepository(User_1.User);
            await userRepo.save({ ...userData, role: constants_1.Role.CUSTOMER });
            // Act:
            const response = await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // Assert:
            const users = await userRepo.find();
            expect(response.status).toBe(400);
            expect(users).toHaveLength(1);
        });
        it('should return the access token and refresh token inside a cookie', async () => {
            // Arrange:
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: 'jatharvedant16@gmail.com',
                password: 'ved@123',
            };
            // Act:
            const response = await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // Assert:
            let accessToken = null;
            let refreshToken = null;
            const cookies = response.headers['set-cookie'] ?? [];
            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }
                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect((0, utils_1.isJwt)(accessToken)).toBeTruthy();
            expect((0, utils_1.isJwt)(refreshToken)).toBeTruthy();
        });
        it('should store the refresh token in the database', async () => {
            // Arrange:
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: 'jatharvedant16@gmail.com',
                password: 'ved@123',
            };
            // Act:
            const response = await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // Assert:
            const refreshTokenRepo = connection.getRepository(RefreshToken_1.RefreshToken);
            // const refreshTokens = await refreshTokenRepo.find()
            const tokens = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId = :userId', {
                userId: response.body.id,
            })
                .getMany();
            expect(tokens).toHaveLength(1);
        });
    });
    describe('Some field missing', () => {
        it('should send status 400 if email field is missing', async () => {
            // Arrange:
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: '',
                password: 'ved@123',
            };
            // Act:
            const response = await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // Assert:
            const userRepo = connection.getRepository(User_1.User);
            const users = await userRepo.find();
            expect(response.status).toBe(400);
            expect(users).toHaveLength(0);
        });
        it('should send status 400 if first name is missing', async () => {
            // Arrange:
            const userData = {
                firstName: '',
                lastName: 'Jathar',
                email: 'ved@gmail.com',
                password: 'ved@123',
            };
            // Act:
            const response = await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // Assert:
            const userRepo = connection.getRepository(User_1.User);
            const users = await userRepo.find();
            expect(response.status).toBe(400);
            expect(users).toHaveLength(0);
        });
        it('should send status 400 if last name is missing', async () => {
            // Arrange:
            const userData = {
                firstName: 'Vedant',
                lastName: '',
                email: 'ved@gmail.com',
                password: 'ved@123',
            };
            // Act:
            const response = await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // Assert:
            const userRepo = connection.getRepository(User_1.User);
            const users = await userRepo.find();
            expect(response.status).toBe(400);
            expect(users).toHaveLength(0);
        });
        it('should send status 400 if password is missing', async () => {
            // Arrange:
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: 'ved@gmail.com',
                password: '',
            };
            // Act:
            const response = await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // Assert:
            const userRepo = connection.getRepository(User_1.User);
            const users = await userRepo.find();
            expect(response.status).toBe(400);
            expect(users).toHaveLength(0);
        });
    });
    describe('Some fields have invalid format', () => {
        it('should send status 400 if email has a invalid format ', async () => {
            // Arrange:
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: 'ved&gmail.com',
                password: 'ved@123',
            };
            // Act:
            const response = await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // Assert:
            const userRepo = connection.getRepository(User_1.User);
            const users = await userRepo.find();
            expect(response.status).toBe(400);
            expect(users).toHaveLength(0);
        });
        it("should send status 400 if password doesn't have the minimum length", async () => {
            // Arrange:
            const userData = {
                firstName: 'Vedant',
                lastName: 'Jathar',
                email: 'jatharvedant16@gmail.com',
                password: 'ved',
            };
            // Act:
            const response = await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // Assert:
            const userRepo = connection.getRepository(User_1.User);
            const users = await userRepo.find();
            expect(response.status).toBe(400);
            expect(users).toHaveLength(0);
        });
        it('should send status 400 any one of the fields has incorrect format', async () => {
            // Arrange:
            const userData = {
                firstName: '',
                lastName: '',
                email: 'jath',
                password: 'ved',
            };
            // Act:
            const response = await (0, supertest_1.default)(app_1.default).post('/auth/register').send(userData);
            // Assert:
            const userRepo = connection.getRepository(User_1.User);
            const users = await userRepo.find();
            expect(response.status).toBe(400);
            expect(users).toHaveLength(0);
        });
        // it("should sanitize the email field by trimming spaces at the front and back", async () => {
        //   // Arrange:
        //   const userData = {
        //     firstName: "Vedant",
        //     lastName: "Jathar",
        //     email: "  ved@gmail.com ",
        //     password: "ved@1234"
        //   }
        //   // Act
        //   await request(app).post('/auth/register').send(userData)
        //   // Assert:
        //   const userRepo = connection.getRepository(User)
        //   const users = await userRepo.find()
        //   expect(users[0].email).toBe("ved@gmail.com")
        // })
    });
});
