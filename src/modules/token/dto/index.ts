import { Player, TelegramAccount } from '@prisma/client';

export type PlayerWithTgAccount = Player & {
  tgAccount: TelegramAccount; // Add the TelegramAccount relationship
};

export class PlayerTokenDTO {
  id: string;
  userName: string;
  tgId: string;

  constructor(entity: PlayerWithTgAccount) {
    this.id = entity.id;
    this.userName = entity.tgAccount.username;
    this.tgId = entity.tgAccount.tgId;
  }
}