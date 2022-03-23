import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDTO {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class PasswordRecoveryDTO {
  @IsEmail()
  email: string;
}

export class PasswordChangeDTO {
  @IsNotEmpty()
  password: string;
}

export interface GenerateJWTDTO {
  sub: string;
  email: string;
  role: string;
}
