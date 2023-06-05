import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class TemporaryPassword {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false, default: Date.now() + 43200000, type: 'bigint' })
  expiresAt: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}