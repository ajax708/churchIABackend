import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hola, Mundo test!';
  }

  getUsers(): string[] {
    return ['user1', 'user2', 'user3'];
  }
}
