import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminLoginGuard } from './admin-login.guard';
import { AuthService } from './auth.service';
import { CreateUserDTO, PasswordChangeDTO, PasswordRecoveryDTO } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    const { id, email, role } = req.user;
    const access_token = await this.authService.generateJwtToken({
      sub: id,
      email,
      role,
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    return {
      ...req.user,
      access_token,
    };
  }

  @UseGuards(AdminLoginGuard)
  @Post('admin/login')
  async adminLogin(@Request() req) {
    const { id, email, role } = req.user;
    const access_token = await this.authService.generateJwtToken({
      sub: id,
      email,
      role,
    });
    return {
      ...req.user,
      access_token,
    };
  }

  @Post('register')
  async register(@Body() user: CreateUserDTO) {
    await this.authService.register(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Request() req) {
    const access_token = await this.authService.generateJwtToken({
      sub: req.user.userId,
      email: req.user.email,
      role: req.user.role,
    });
    return {
      access_token,
    };
  }

  @Post('recover/password')
  async passwordRecovery(@Body() { email }: PasswordRecoveryDTO) {
    await this.authService.passwordRecovery(email);
    return;
  }

  @UseGuards(JwtAuthGuard)
  @Post('change/password')
  async changePassword(
    @Request() req,
    @Body() { password }: PasswordChangeDTO,
  ) {
    console.log(req.user);
    const userId = req.user.userId;
    await this.authService.changePassword(userId, password);
    return;
  }
}
