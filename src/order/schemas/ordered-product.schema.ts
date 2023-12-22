import { IsInt } from 'class-validator';

export class OrderedProductSchema {
  @IsInt()
  public readonly id: number;

  @IsInt()
  public readonly quantity: number;
}