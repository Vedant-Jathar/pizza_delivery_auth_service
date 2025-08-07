import { JwtPayload } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import { Config } from '../config'
import { User } from '../entity/User'
import { RefreshToken } from '../entity/RefreshToken'
import { Repository } from 'typeorm'
// import createHttpError from 'http-errors'
import fs from 'fs'
import path from 'path'

export class TokenService {
  constructor(private refreshTokenRepo: Repository<RefreshToken>) {}
  generateAccessToken(payload: JwtPayload) {
    // if (!Config.PRIVATE_KEY) {
    //   const err = createHttpError(404, "Secret key not found")
    //   throw err
    // }
    const privateKey = fs.readFileSync(
      path.join(__dirname, '../../certs/privateKey.pem'),
    )

    const accessToken = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '15d',
      issuer: 'auth-service',
    })

    return accessToken
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = jwt.sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: 'HS256',
      expiresIn: '1y',
      issuer: 'auth-service',
      jwtid: String(payload.id),
    })
    return refreshToken
  }

  async persistRefreshToken(user: User) {
    // Saving a refresh token record to the database:(ie persisting the refresh token)
    const yearInMilliseconds = 365 * 24 * 60 * 60 * 1000
    const newRefreshToken = await this.refreshTokenRepo.save({
      user: user,
      expiresAt: new Date(Date.now() + yearInMilliseconds),
    })
    return newRefreshToken
  }

  async deleteOldRefreshTokenFromDatabase(id: number) {
    await this.refreshTokenRepo.delete({ id })
  }
}
