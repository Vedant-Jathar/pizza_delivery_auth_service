import { Brackets, Repository } from 'typeorm'
import { User } from '../entity/User'
import { createUserData, sanitizedQuery, UserData } from '../types'
import createHttpError from 'http-errors'
import bcrypt from 'bcryptjs'
import { Tenant } from '../entity/Tenant'

export class UserService {
  constructor(
    private userRepository: Repository<User>,
    private tenantRepo: Repository<Tenant>,
  ) {}

  async create({
    firstName,
    lastName,
    email,
    password,
    role,
    tenantId,
  }: UserData) {
    // Checking whether email already exists:
    const user = await this.userRepository.findOne({ where: { email } })
    if (user) {
      const error = createHttpError(400, 'Email already exists')
      throw error
    }

    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId! } })

    if (role === 'manager' && !tenant) {
      throw createHttpError(404, 'Tenant does not exist')
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
        tenant: tenantId ? { id: tenantId } : undefined,
      })
    } catch (err) {
      const error = createHttpError(
        500,
        'Failed to store the user to the database',
      )
      throw error || err
    }
  }

  async findUserByEmailWithPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'password'],
      relations: {
        tenant: true,
      },
    })
    return user
  }

  async findUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        tenant: true,
      },
    })
    return user
  }

  async getAllUsers(sanitizedQuery: sanitizedQuery) {
    const queryBuilder = this.userRepository.createQueryBuilder('users')
    console.log(sanitizedQuery)

    const searchTerm = `%${sanitizedQuery.q}%`
    if (sanitizedQuery.q) {
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where('CONCAT(users.firstName,\' \',users."lastName") ILike :q', {
            q: searchTerm,
          }).orWhere('users.email ILike :q', { q: searchTerm })
        }),
      )
    }

    if (sanitizedQuery.role) {
      queryBuilder.andWhere('users.role Like :role', {
        role: sanitizedQuery.role,
      })
    }

    const result = await queryBuilder
      .leftJoinAndSelect('users.tenant', 'tenant')
      .skip((sanitizedQuery.currentPage - 1) * sanitizedQuery.perPage)
      .take(sanitizedQuery.perPage)
      .orderBy('users.id', 'DESC')
      .getManyAndCount()

    return result

    // return await this.userRepository.find({
    //   relations: {
    //     tenant: true
    //   }
    // })
  }

  async updateById(
    id: number,
    { firstName, lastName, email, role, tenantId }: createUserData,
  ) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    })

    await this.userRepository.update(
      { id },
      {
        firstName: firstName || user?.firstName,
        lastName: lastName || user?.lastName,
        email: email || user?.email,
        role: role || user?.role,
        tenant: tenantId ? { id: tenantId } : null,
      },
    )
  }

  async deleteById(id: number) {
    await this.userRepository.delete({ id })
  }
}
