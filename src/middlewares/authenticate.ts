import { expressjwt, GetVerificationKey } from 'express-jwt'
import jwksClient from 'jwks-rsa'
import { Config } from '../config'
import { Request } from 'express'
import { AuthCookie } from '../types'

// This middleware stores the payload of the acces token in "req.auth" if the access token is valid:
export default expressjwt({
  secret: jwksClient.expressJwtSecret({
    jwksUri: Config.JWKS_URI!,
    cache: true,
    rateLimit: true,
  }) as GetVerificationKey,

  algorithms: ['RS256'],

  getToken(req: Request) {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.split(' ')[1] !== 'undefined') {
      const accessToken = authHeader.split(' ')[1]
      return accessToken
    }

    const { accessToken } = req.cookies as AuthCookie

    return accessToken
  },
})
