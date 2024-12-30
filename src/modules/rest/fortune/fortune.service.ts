import { 
    BadRequestException, 
    Injectable, Logger, 
    NotFoundException
} from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';

//import { Player, TelegramAccount } from '@prisma/client';

@Injectable()
export class FortuneService {
    private readonly bawdry_constants: string[] = [
        'magpie', 'parrot','goat','hamster','koala','peacock','fox','ermine',
        'hyena','toad','owl','monkey','panda','rooster','boar','crocodile',
      ];

      private readonly wish_constants: string[] = [
        'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  
  private readonly logger = new Logger(FortuneService.name)  

  constructor(private prisma: PrismaService) {}

  async getRandomBawdry() : Promise<string> {
    const randomIndex = Math.floor(Math.random() * this.bawdry_constants.length);
    return this.bawdry_constants[randomIndex];
  }

  async getRandomWish() : Promise<string> {
    const randomIndex = Math.floor(Math.random() * this.wish_constants.length);
    return this.wish_constants[randomIndex];
  }

}