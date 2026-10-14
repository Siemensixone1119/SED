import { IsNotEmpty, IsString } from "class-validator";

export class loginDataDto {
  @IsNotEmpty()
  @IsString()
  login!: string
}