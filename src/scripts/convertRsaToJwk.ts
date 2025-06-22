import fs from 'fs'
import path from 'path'
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const rsaPemToJwk = require('rsa-pem-to-jwk')

const privateKey = fs.readFileSync(
  path.join(__dirname, '../../certs/privateKey.pem'),
)

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
const jwk = rsaPemToJwk(privateKey, { use: 'sig' }, 'public')

console.log(JSON.stringify(jwk))
