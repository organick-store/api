import { ApiProperty } from '@nestjs/swagger';
import { IsEmail} from 'class-validator';

export class OrderDTO {
  @IsEmail()
  @ApiProperty({
    description: 'Token of user',
    type: String
  })
  token: string;

  @ApiProperty({
    description: 'Total cost of order',
    type: Number
  })
  totalCost: number;

  @ApiProperty({
    description: 'Total discount of order',
    type: Number
  })
  totalDiscount: number;

  @ApiProperty({
    description: 'Address of order',
    type: String
  })
  address: string;

  @ApiProperty({
    description: 'Order products',
    type: Array
  })
  products: Array<{name: string, quantity: number}>;
}