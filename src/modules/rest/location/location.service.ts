import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@modules/prisma/prisma.service'
import { subDays } from 'date-fns';
import { ConfigService } from '@nestjs/config'
import { EffectType, LocationInstance, LocationType, Player, ResourceType } from '@prisma/client';
  
// import { 
//     GetReferralsQueryDto,
// } from './dto'
// import { Player } from '@prisma/client'

@Injectable()
export class LocationService {

  private logger = new Logger(LocationService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getDefaultTemplate() {
    return await this.getTemplateRoom(LocationType.CROSSROADS_ZERO);
  }

  async getTemplateRoom(type: LocationType) {
    
    // Find the existing Location based on unique fields (adjust conditions as needed)
    let location = await this.prisma.location.findFirst({
      where: {
        type, // Replace with LocationType.MARCUS_ROOM if you have an enum
      },
    });

    // If not found, create a new Location object
    if (!location) {
      location = await this.prisma.location.create({
        data: {
            price: {
                create: {
                    resource: ResourceType.SILVER,
                    value: 3000,
                }
            },
            effect: {
                create: {
                    resource: ResourceType.ENERGY,
                    effect: EffectType.DECREASING,
                    value: 100,
                }
            },
            type,
        },
      include: {
        price: true,
        effect: true,
      }
    });
    return location;
  }}


 

  async createLocationInstance(player:Player, locationTemplate): Promise<LocationInstance>  {
    return this.prisma.locationInstance.create({

        data: {
            player: {
                connect: {
                    id: player.id,
                },
            },
            template: {
                connect: {
                    id: locationTemplate.id,
                },
            },
        },
        include: {
            template: true,        }
    });
  }

  async selectPlayerLocation(player: Player, type: string) {
    let template;
    
    switch (type) {
      case 'agata':
        template = await this.getTemplateRoom(LocationType.AGATA_ROOM);
        break;
      case'marcus':
        template = await this.getTemplateRoom(LocationType.MARCUS_ROOM);
        break;
    }

    if (!template) {
      const msg = `No location template found for ${location}`
      this.logger.error(msg);
      throw new BadRequestException(msg);
    }

    return this.prisma.locationInstance.update({
      where: { playerId: player.id },
      data: {
          player: {
              connect: {
                  id: player.id,
              },
          },
          template: {
              connect: {
                  id: template.id,
              },
          },
      },
      include: {
          template: true,        
        }
    });
  }

  
}


