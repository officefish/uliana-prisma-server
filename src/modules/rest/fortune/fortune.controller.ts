import { Player } from '@/common/decorators';
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  //ApiBearerAuth,
} from '@nestjs/swagger';
import { PlayerGuard } from '../player/guards/player.guard';


@ApiTags('fortune')
@Controller('fortune')
export class FortuneController {
    

    @Get("/bawdry")
    @Player()
    @UseGuards(PlayerGuard)
    @ApiOperation({ summary: 'Get random bawdry' })
    @ApiResponse({ status: 200, description: 'Success response with Ok status gives \"pong\" string as response' })
    getBawdry() {
        return "pong"
    }

    @Get("/all")
    @Player()
    @UseGuards(PlayerGuard)
    @ApiOperation({ summary: 'Get player fortunes' })
    @ApiResponse({ status: 200, description: 'Success response with Ok status gives \"pong\" string as response' })
    getAllPlayerFortunes() {
        return [{
            key: "bawdry",
            price: { 
                value: 1,
                type: 'GEMS'
            }
        }]
    }
}

