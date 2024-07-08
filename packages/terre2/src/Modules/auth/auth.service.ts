import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
  async validateUser(
    email: string,
    checkCode: string,
    invitationCode: string,
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${process.env.API_HOST}/editorEmailLogin`,
        {
          email,
          check_code: checkCode,
          invitation_code: invitationCode,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data;

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
