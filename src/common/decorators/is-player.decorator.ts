import { SetMetadata } from '@nestjs/common';

export const IS_PLAYER_KEY = 'IS_PLAYER_KEY';

export const Player = () => SetMetadata(IS_PLAYER_KEY, true);