import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { OrderProduct } from "./orderProduct.entity";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  orderDate: Date;

  @Column()
  totalCost: number;

  @Column()
  totalDiscount: number;
  
  @ManyToOne(() => User, user => user.orders)
  user: User;

  @OneToMany(() => OrderProduct, orderProduct => orderProduct.order)
  products: OrderProduct[];
}