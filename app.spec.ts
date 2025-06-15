import app from './src/app'
import { addTwoNums, multiplyTwoNums } from './src/util'
import request from 'supertest'

describe.skip('App', () => {
  it('should return correct Product', () => {
    const product = multiplyTwoNums(4, 3)
    expect(product).toBe(12)
  })

  it('should return correct Sum', () => {
    const sum = addTwoNums(4, 3)
    expect(sum).toBe(7)
  })

  it('should return 200 status code', async () => {
    const response = await request(app).get('/vedant').send()
    expect(response.statusCode).toBe(200)
  })
})
