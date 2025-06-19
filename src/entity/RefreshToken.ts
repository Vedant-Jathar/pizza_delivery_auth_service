import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
} from 'typeorm'
import { User } from './User'

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'timestamp' })
  expiresAt: Date

  @ManyToOne(() => User)
  user: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
