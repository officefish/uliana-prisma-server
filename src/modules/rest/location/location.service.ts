import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@modules/prisma/prisma.service'
import { subDays } from 'date-fns';
import { ConfigService } from '@nestjs/config'
import { EffectType, LocationInstance, LocationType, Player, ResourceType } from '@prisma/client';
  

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

  }
  this.logger.log(`Created template for ${location.type} type`);
  return location;
}

  async getPlayerLocationImstance(player: Player): Promise<LocationInstance | null> {
    return await this.prisma.locationInstance.findFirst({
      where: {
        player: { id: player.id },
      },
      include: {
        template: true,
      }
    })
  }

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
          template: true,        
        }
    });
  }

  async getTemplateByKey(key: string) {
    switch (key) {
      case 'agata':  
      {
        this.logger.log(`Triing creating template for ${LocationType.AGATA_ROOM} type`);
        return await this.getTemplateRoom(LocationType.AGATA_ROOM);
      }
    case'markus': {
        this.logger.log(`Triing creating template for ${LocationType.MARKUS_ROOM} type`);
        return await this.getTemplateRoom(LocationType.MARKUS_ROOM);
      }
    }
    return null;
  }

  async updatePlayerInstance(
    player: Player, 
    template,
    //locationInstance: LocationInstance
  ) {
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

  async selectPlayerLocation(player: Player, key: string) {
    const template = await this.getTemplateByKey(key);

    if (!template) {
      const msg = `No location template found for ${key} key`
      this.logger.error(msg);
      throw new BadRequestException(msg);
    }

    return this.updatePlayerInstance(player, template);
  }
}


