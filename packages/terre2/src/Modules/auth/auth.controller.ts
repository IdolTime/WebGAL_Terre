import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; checkCode: string; invitationCode: string },
  ) {
    const accessToken = await this.authService.validateUser(
      body.email,
      body.checkCode,
      body.invitationCode,
    );
    return { access_token: accessToken };
  }
}
