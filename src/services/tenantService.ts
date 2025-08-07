import { Repository } from 'typeorm'
import { Tenant } from '../entity/Tenant'
import { epxressResponseTenant, sanitizedQuery, TenantData } from '../types'

export class TenantService {
  constructor(private tenantRepo: Repository<Tenant>) {}

  async create({ name, address }: TenantData) {
    const tenant = await this.tenantRepo.save({ name, address })
    return tenant
  }

  async getTenantByid(id: number) {
    return await this.tenantRepo.findOne({
      where: {
        id,
      },
    })
  }

  async getAllTenant(sanitizedQuery: sanitizedQuery) {
    const { currentPage, perPage } = sanitizedQuery
    const queryBuilder = this.tenantRepo.createQueryBuilder('tenant')

    if (sanitizedQuery.q) {
      const searchTerm = `%${sanitizedQuery.q}%`
      queryBuilder
        .where(`tenant.name ILike :q`, { q: searchTerm })
        .orWhere('tenant.address ILike :q', { q: searchTerm })
    }

    const result = await queryBuilder
      .skip((currentPage - 1) * perPage)
      .take(perPage)
      .orderBy('tenant.id', 'DESC')
      .getManyAndCount()

    return result
  }

  async getAllTenantsWithoutPagination() {
    return this.tenantRepo.find()
  }

  async updateById(id: number, updatedData: epxressResponseTenant) {
    const tenant = await this.getTenantByid(id)
    return await this.tenantRepo.update(
      { id },
      {
        name: updatedData.name || tenant?.name,
        address: updatedData.address || tenant?.address,
      },
    )
  }

  async deleteTenantById(id: number) {
    await this.tenantRepo.delete({ id })
  }
}
