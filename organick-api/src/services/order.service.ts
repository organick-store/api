import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "../entities/order.entity";
import { decodeToken, verifyToken } from "../utils/token.util";
import { User } from "../entities/user.entity";
import { Product } from "../entities/product.entity";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async createOrder(token: string, totalCost: number, totalDiscount: number, address: string, products: Product[]) {
    try {
      const isTokenValid = await verifyToken(token).catch((err) => !!!err);
      if (!isTokenValid) return { status: 'Error', message: 'Invalid token' };

      const email = await decodeToken(token).then((payload) => payload.email);
      const user = await this.userRepository.findOneBy({ email });

      if (!user) return { status: 'Error', message: 'User not found' };

      const order = new Order();
      order.address = address;
      order.orderDate = new Date();
      order.totalCost = totalCost;
      order.totalDiscount = totalDiscount;
      order.user = user;
      order.products = products;

      await this.orderRepository.save(order);


      return { status: 'Success', message: 'Order created' };
    } catch (error) {
      console.log(error);
    }
  }
}