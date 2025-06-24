'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const supertest_1 = __importDefault(require('supertest'))
const app_1 = __importDefault(require('../../src/app'))
const mock_jwks_1 = __importDefault(require('mock-jwks'))
const data_source_1 = __importDefault(require('../../src/config/data-source'))
const User_1 = require('../../src/entity/User')
const constants_1 = require('../../src/constants')
describe('GET /auth/self', () => {
  let connection
  let jwks
  beforeAll(async () => {
    connection = await data_source_1.default.initialize()
    jwks = (0, mock_jwks_1.default)('http://localhost:5501')
  })
  beforeEach(async () => {
    jwks.start()
    await connection.dropDatabase()
    await connection.synchronize()
  })
  afterEach(() => {
    jwks.stop()
  })
  describe('happy path', () => {
    it('should return user id if the access token is valid and not expired', async () => {
      // Register the user:
      const userData = {
        firstName: 'Vedant',
        lastName: 'Jathar',
        email: 'jatharvedant16@gmail.com',
        password: 'ved@123',
      }
      const userRepo = connection.getRepository(User_1.User)
      const user = await userRepo.save({
        ...userData,
        role: constants_1.Role.CUSTOMER,
      })
      // Create a access token that will be sent with the request:
      const accessToken = jwks.token({ sub: String(user.id), role: user.role })
      // Sending the request to get self and also setting the cookie
      const response = await (0, supertest_1.default)(app_1.default)
        .get('/auth/self')
        .set('Cookie', `accessToken=${accessToken}`)
      // Expecting
      expect(response.body.id).toBe(user.id)
    })
    it('should not return password in the user data', async () => {
      // Register the user:
      const userData = {
        firstName: 'Vedant',
        lastName: 'Jathar',
        email: 'jatharvedant16@gmail.com',
        password: 'ved@123',
      }
      const userRepo = connection.getRepository(User_1.User)
      const user = await userRepo.save({
        ...userData,
        role: constants_1.Role.CUSTOMER,
      })
      // Create a access token that will be sent with the request:
      const accessToken = jwks.token({ sub: String(user.id), role: user.role })
      // Sending the request to get self and also setting the cookie
      const response = await (0, supertest_1.default)(app_1.default)
        .get('/auth/self')
        .set('Cookie', `accessToken=${accessToken}`)
      // Expecting
      expect(response.body).not.toHaveProperty('passsord')
    })
  })
  describe('sad paths', () => {
    it('should return status code 404 if user not found', async () => {
      const accesToken = jwks.token({
        sub: '5666',
        role: constants_1.Role.CUSTOMER,
      })
      const response = await (0, supertest_1.default)(app_1.default)
        .get('/auth/self')
        .set('Cookie', `accessToken=${accesToken}`)
        .send()
      expect(response.status).toBe(404)
    })
    it('should return status 401 if acces token is not sent with the request', async () => {
      const response = await (0, supertest_1.default)(app_1.default).get(
        '/auth/self',
      )
      expect(response.status).toBe(401)
    })
  })
})
