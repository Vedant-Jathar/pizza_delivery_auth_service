import app from '../../src/app'
import request from 'supertest'

describe('POST /auth/register', () => {
  describe('Given all Fields', () => {
    it('Should return status code 201(Created)', async () => {
      // AAA (Arrange, Act ,Assert)
      // Arrange:
      const userData = {
        firstName: 'Vedant',
        lastName: 'Jathar',
        email: 'jatharvedant16@gmail.com',
        password: 'ved@123',
      }

      // Act:
      const response = await request(app).post('/auth/register').send(userData)

      // Assert:
      expect(response.statusCode).toBe(201)
    })

    it('Should return response as json', async () => {
      // AAA (Arrange, Act ,Assert)
      // Arrange:
      const userData = {
        firstName: 'Vedant',
        lastName: 'Jathar',
        email: 'jatharvedant16@gmail.com',
        password: 'ved@123',
      }

      // Act:
      const response = await request(app).post('/auth/register').send(userData)

      // Assert:
      expect(
        (response.headers as Record<string, string>)['content-type'],
      ).toEqual(expect.stringContaining('json'))
    })
  })

  describe('Some field missing', () => {})
})
