import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ProductDTO {
  @IsString()
  @ApiProperty({
    description: 'Product name',
    type: String
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'Product type',
    type: String
  })
  type: string;

  @IsString()
  @ApiProperty({
    description: 'Product price',
    type: Number
  })
  price: number;

  @IsString()
  @ApiProperty({
    description: 'Product discount',
    type: Number
  })
  discount: number;

  @IsString()
  @ApiProperty({
    description: 'Product image link',
    type: String
  })
  image: string;

  @IsString()
  @ApiProperty({
    description: 'Product description',
    type: String
  })
  description: string;

  @IsString()
  @ApiProperty({
    description: 'Product additional info',
    type: String
  })
  additionalInfo: string;

  @IsString()
  @ApiProperty({
    description: 'Product overview',
    type: String
  })
  overview: string;
}