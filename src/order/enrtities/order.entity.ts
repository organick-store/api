import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { OrderProduct } from "./order-product.entity";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  public readonly id: number;

  @Column()
  public readonly address: string;

  @Column()
  public readonly orderDate: Date;

  @Column()
  public readonly totalCost: number;

  @Column()
  public readonly totalDiscount: number;
  
  @ManyToOne(() => User, user => user.orders)
  public user: User;

  @OneToMany(() => OrderProduct, orderProduct => orderProduct.order)
  public products: OrderProduct[];
}