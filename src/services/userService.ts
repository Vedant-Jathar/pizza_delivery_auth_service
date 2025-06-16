import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import bcrypt from 'bcrypt'

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password, role }: UserData) {
    // Hashing the password using bcrypyt library:
    const hashedPassword = await bcrypt.hash(password, 10)
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
      })
    } catch (err) {
      const error = createHttpError(
        500,
        'Failed to store the user to the database',
      )
      throw error || err
    }
  }
}
