import { Repository } from 'typeorm'
import { Tenant } from '../entity/Tenant'
import { TenantData } from '../types'

export class TenantService {
  constructor(private tenantRepo: Repository<Tenant>) {}

  async create({ name, address }: TenantData) {
    const tenant = await this.tenantRepo.save({ name, address })
    return tenant
  }
}
