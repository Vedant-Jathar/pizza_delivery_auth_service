import {
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Column,
} from 'typeorm'

@Entity({ name: 'tenants' })
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', { length: 100 })
  name: string

  @Column('varchar', { length: 255 })
  address: string

  @UpdateDateColumn()
  updatedAt: number

  @CreateDateColumn()
  createdAt: number
}
