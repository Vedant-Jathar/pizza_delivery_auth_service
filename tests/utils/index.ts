import { DataSource } from 'typeorm'

export const truncateTables = async (connection: DataSource) => {
  const entities = connection.entityMetadatas

  for (const entity of entities) {
    const repository = connection.getRepository(entity.name)
    await repository.clear()
  }
}

export const isJwt = (token: string | null) => {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 3) return false

  try {
    const [headerB64, payloadB64] = parts

    JSON.parse(Buffer.from(headerB64, 'base64').toString('utf-8'))
    JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf-8'))

    return true
  } catch (err) {
    if (err) return false
  }
}
