import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "../entities/order.entity";
import { decodeToken, verifyToken } from "../utils/token.util";
import { User } from "../entities/user.entity";
import { Product } from "../entities/product.entity";
import { OrderProduct } from "../entities/orderProduct.entity";

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(OrderProduct) private readonly orderProductRepository: Repository<OrderProduct>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
  ) {}

  async createOrder(token: string, totalCost: number, totalDiscount: number, address: string, products: {name: string, quantity: number}[]) {
    try {
      const isTokenValid = await verifyToken(token).catch(() => false);
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
      
      await this.orderRepository.save(order);

      await this.addProductToOrder(order.id, products);

      return { status: 'Success', message: 'Order created', order };
    } catch (error) {
      console.log(error);
    }
  }

  async addProductToOrder(orderId: number, products: {name: string, quantity: number}[]) {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    
    for (const product of products) {
      const orderedProduct = await this.productRepository.findOneBy({ name: product.name });
      const orderProduct = new OrderProduct();
      orderProduct.quantity = product.quantity;
      orderProduct.product = orderedProduct;
      orderProduct.order = order;
      await this.orderProductRepository.save(orderProduct);
    }
  }
}