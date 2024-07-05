import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) {}

  async validateUser(
    email: string,
    checkCode: string,
    invitationCode: string,
  ): Promise<string> {
    try {
      const response = await this.httpService
        .post(`${process.env.API_HOST}/editorEmailLogin`, {
          email,
          check_code: checkCode,
          invitation_code: invitationCode,
        })
        .toPromise();

      const { data } = response;

      if (data && data.code === 0) {
        return data.data; // 返回 access token
      } else {
        throw data.message;
      }
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
