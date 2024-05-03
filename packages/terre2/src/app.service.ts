import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiTest() {
    return 'IdolTime Application API Test OK';
  }
}
