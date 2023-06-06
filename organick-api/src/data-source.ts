import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entities/user.entity"
import { TemporaryPassword } from "./entities/temporaryPasswords.entity"
import { Product } from "./entities/product.entity"
import { join } from "path"
import { Order } from "./entities/order.entity"

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: true,
    logging: false,
    entities: [User, TemporaryPassword, Product, Order],
    migrations: [join(__dirname, 'migrations/*.{ts,js}')],
    migrationsRun: true,
    subscribers: []
  })
