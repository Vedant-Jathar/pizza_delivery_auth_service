import { expressjwt } from 'express-jwt'
import { Config } from '../config'
import { Request } from 'express'
import { AuthCookie, RefreshTokenPayload } from '../types'
import AppDataSource from '../config/data-source'
import { RefreshToken } from '../entity/RefreshToken'
import logger from '../config/logger'

export default expressjwt({
  secret: Config.REFRESH_TOKEN_SECRET!,
  algorithms: ['HS256'],
  getToken(req: Request) {
    const { refreshToken } = req.cookies as AuthCookie

    return refreshToken
  },
  async isRevoked(req: Request, token) {
    try {
      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken)
      const refreshTokenInDatabase = await refreshTokenRepo.findOne({
        where: {
          id: Number((token?.payload as RefreshTokenPayload).id),
          user: {
            id: Number((token?.payload as RefreshTokenPayload).sub),
          },
        },
      })
      // console.log('Refresh Token in Database:', refreshTokenInDatabase)

      return refreshTokenInDatabase === null
    } catch (err) {
      logger.error('Error validating the refresh token', { error: err })
    }
    return true
  },
})
