import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class PasswordRecoveryDto {
  @IsEmail()
  email: string;
}

export class PasswordChangeDto {
  @IsNotEmpty()
  password: string;
}
