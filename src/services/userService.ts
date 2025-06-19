import { Repository } from 'typeorm'
import { User } from '../entity/User'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import bcrypt from 'bcrypt'

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create({ firstName, lastName, email, password, role }: UserData) {
    // Checking whether email already exists:
    const user = await this.userRepository.findOne({ where: { email } })
    if (user) {
      const error = createHttpError(400, 'Email already exists')
      throw error
    }

    // Hashing the password using bcrypyt library:
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

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

  async findUserByEmail(email: string) {
    const user = await this.userRepository.find({
      where: {
        email,
      },
    })
    return user[0]
  }
}
