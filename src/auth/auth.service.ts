import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from 'src/users/users.service';
import { compare, hash } from 'bcrypt';
import { CreateUserDto } from './dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await compare(pass, user.password);
    if (isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async validateAdmin(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    // only admins can login here
    if (user.role !== 'ADMIN') {
      return null;
    }

    const isPasswordValid = await compare(pass, user.password);
    if (isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async register({ email, password, username }: CreateUserDto) {
    const emailAlreadyExists = await this.usersService.findByEmail(email);
    const usernameAlreadyExists = await this.usersService.findByUsername(
      username,
    );
    if (emailAlreadyExists || usernameAlreadyExists) {
      throw new HttpException('Usuário já registrado!', 403);
    }

    const hashedPassword = await hash(password, 12);
    await this.usersService.create({
      username,
      email,
      password: hashedPassword,
      role: 'USER',
    });
  }

  async generateJwtToken(user: any) {
    const payload = { email: user.email, sub: user.userId, role: user.role };
    return this.jwtService.sign(payload);
  }

  // async passwordRecovery(email: string) {
  //   const userExists = await this.usersService.findByEmail(email);

  //   if (!userExists) {
  //     throw new HttpException('Usuário não existe', 403);
  //   }

  //   const mail: MailDataRequired = {
  //     to: email,
  //     subject: 'Hello from sendgrid',
  //     from: 'kallebegomes18@gmail.com', // Fill it with your validated email on SendGrid account
  //     text: 'Hello',
  //     html: '<h1>Hello</h1>',
  //   };

  //   try {
  //     await this.sendgridService.send(mail);
  //   } catch (error) {
  //     console.error(error);
  //     throw new HttpException('Erro ao enviar email', 403);
  //   }
  // }

  // async passwordChange(email: string, password: string) {
  //   const hashedPassword = await hash(password, 12);
  //   await this.usersService.changePassword(email, hashedPassword);
  // }
}
