import { 
    BadRequestException, 
    Injectable, Logger, 
    NotFoundException
} from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';

//import { Player, TelegramAccount } from '@prisma/client';


@Injectable()
export class FortuneService {
    private readonly constants: string[] = [
        'magpie', 'parrot','goat','hamster','koala','peacock','fox','ermine',
        'hyena','toad','owl','monkey','panda','rooster','boar','crocodile',
      ];
  
  private readonly logger = new Logger(FortuneService.name)  

  constructor(private prisma: PrismaService) {}

  async getRandomBawdry() : Promise<string> {
    const randomIndex = Math.floor(Math.random() * this.constants.length);
    return this.constants[randomIndex];
  }

}