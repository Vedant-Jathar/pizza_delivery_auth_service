'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const data_source_1 = __importDefault(require('../../src/config/data-source'))
const supertest_1 = __importDefault(require('supertest'))
const app_1 = __importDefault(require('../../src/app'))
const utils_1 = require('../utils')
describe('POST /auth/login', () => {
  let connection
  beforeAll(async () => {
    connection = await data_source_1.default.initialize()
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
      await (0, supertest_1.default)(app_1.default)
        .post('/auth/register')
        .send(userData)
      // Logging the user in:
      const response = await (0, supertest_1.default)(app_1.default)
        .post('/auth/login')
        .send({ email: userData.email, password: userData.password })
      // Assert:
      let accessToken = null
      let refreshToken = null
      const cookies = response.headers['set-cookie'] || []
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
      expect((0, utils_1.isJwt)(accessToken)).toBeTruthy()
      expect((0, utils_1.isJwt)(refreshToken)).toBeTruthy()
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
      await (0, supertest_1.default)(app_1.default)
        .post('/auth/register')
        .send(userData)
      // Logging the user in:
      const response = await (0, supertest_1.default)(app_1.default)
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
      await (0, supertest_1.default)(app_1.default)
        .post('/auth/register')
        .send(userData)
      // Logging the user in:
      const response = await (0, supertest_1.default)(app_1.default)
        .post('/auth/login')
        .send({ email: 'jatharvedant1678@gmail.com', password: 'ved@12345' })
      // Assert:
      expect(response.status).toBe(400)
    })
  })
})
