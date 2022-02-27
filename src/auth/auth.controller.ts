import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    const access_token = await this.authService.generateJwtToken(req.user);
    return {
      ...req.user,
      access_token,
    };
  }

  @UseGuards(AuthGuard('local'))
  @Post('admin/login')
  async adminLogin(@Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException();
    }
    const access_token = await this.authService.generateJwtToken(req.user);
    return {
      ...req.user,
      access_token,
    };
  }

  @Post('register')
  async register(@Body() user: CreateUserDto) {
    return await this.authService.register(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Request() req) {
    const access_token = await this.authService.generateJwtToken(req.user);
    return {
      access_token,
    };
  }

  // @Post('password/recovery')
  // async passwordRecovery(@Body() { email }: PasswordRecoveryDto) {
  //   await this.authService.passwordRecovery(email);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Post('password/change')
  // async passwordRecover(
  //   @Request() req,
  //   @Body() { password }: PasswordChangeDto,
  // ) {
  //   await this.authService.passwordChange(req.user.email, password);
  // }
}
