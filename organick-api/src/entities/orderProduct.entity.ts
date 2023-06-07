import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { Order } from "./order.entity";

@Entity()
export class OrderProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @ManyToOne(() => Order, order => order.products, { cascade: true })
  order: Order;
  
  @ManyToOne(() => Product)
  @JoinColumn()
  product: Product;  
}