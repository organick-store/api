import { IsInt, Min } from "class-validator";

export class GetAllProductsSchema {
  @IsInt()
  @Min(1)
  public readonly limit: number;

  @IsInt()
  @Min(0)
  public readonly offset: number;
}
