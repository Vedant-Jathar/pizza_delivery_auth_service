import { Repository } from 'typeorm'
import { Tenant } from '../entity/Tenant'
import { epxressResponseTenant, TenantData } from '../types'

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

  async getAllTenant() {
    return await this.tenantRepo.find()
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
