import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import * as sgMail from '@sendgrid/mail';

import { CreateUserDTO, GenerateJWTDTO } from './dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    sgMail.setApiKey(process.env.SENDGRID_KEY);
  }

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

  async register({ email, password, username }: CreateUserDTO) {
    const emailAlreadyExists = await this.usersService.findByEmail(email);
    const usernameAlreadyExists = await this.usersService.findByUsername(
      username,
    );
    if (emailAlreadyExists) {
      throw new HttpException('Email já registrado!', 403);
    }
    if (usernameAlreadyExists) {
      throw new HttpException('Nome de usuário já registrado!', 403);
    }

    const hashedPassword = await hash(password, 12);
    await this.usersService.create({
      username,
      email,
      password: hashedPassword,
      role: 'USER',
    });
  }

  async generateJwtToken(
    { sub, email, role }: GenerateJWTDTO,
    options?: JwtSignOptions,
  ) {
    return this.jwtService.sign(
      {
        sub,
        email,
        role,
      },
      options,
    );
  }

  async passwordRecovery(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new HttpException('Email não encontrado!', 404);
    }

    const token = await this.generateJwtToken(
      {
        sub: user.id,
        email,
        role: user.role,
      },
      {
        expiresIn: '10m',
      },
    );

    const recoverLink = `${process.env.CLIENT_APP_URL}/recover/password?token=${token}`;

    const msg = {
      to: email,
      from: process.env.SENDGRID_SENDER,
      subject: 'Ecommerce web - Recuperação de senha',
      html: `
        <h3>Olá ${user.username}</h3>
        <p>Recebemos uma solicitação para trocar sua senha, caso não tenha sido você desconsidere este email.</p>
        <a href="${recoverLink}">Clique aqui para trocar sua senha</a>
      `,
    };

    await sgMail.send(msg);

    return user;
  }

  async changePassword(userId: string, password: string) {
    const userExists = await this.usersService.findById(userId);
    if (!userExists) {
      throw new UnauthorizedException('Usuário inválido!');
    }

    const encryptedPassword = await hash(password, 12);
    this.usersService.changePassword(userExists.id, encryptedPassword);
  }
}
