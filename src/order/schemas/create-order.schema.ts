import { IsArray, IsNumber, IsString } from "class-validator";
import { OrderedProductSchema } from "./ordered-product.schema";

export class CreateOrderSchema {
  @IsNumber()
  public readonly totalCost: number;

  @IsNumber()
  public readonly totalDiscount: number;

  @IsString()
  public readonly address: string;

  @IsArray()
  public readonly products: OrderedProductSchema[];
}