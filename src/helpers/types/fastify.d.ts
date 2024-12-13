import 'fastify';
import { PlayersTokenDto } from '@server/modules/token/dto';

declare module 'fastify' {
  interface FastifyRequest {
    currentUser?: PlayersTokenDto; // Добавляем поле currentUser
  }
}