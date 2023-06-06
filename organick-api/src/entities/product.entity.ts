import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { join } from "path";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  price: number;

  @Column()
  discount: number;

  @Column()
  image: string;

  @Column()
  description: string;

  @Column()
  additionalInfo: string;

  @Column()
  overview: string;
}
