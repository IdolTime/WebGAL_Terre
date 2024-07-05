import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUser(
    email: string,
    checkCode: string,
    invitationCode: string,
  ): Promise<string> {
    try {
      const response = await fetch(`${process.env.API_HOST}/editorEmailLogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          check_code: checkCode,
          invitation_code: invitationCode,
        }),
      });

      const data = await response.json();

      if (data && data.code === 0) {
        return data.data; // 返回 access token
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
