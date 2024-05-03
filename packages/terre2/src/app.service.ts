import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiTest() {
    return 'idoltime Application API Test OK';
  }
}
