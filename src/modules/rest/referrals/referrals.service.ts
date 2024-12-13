import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@modules/prisma/prisma.service'
import { subDays } from 'date-fns';
import { ConfigService } from '@nestjs/config'
  
import { 
    GetReferralsQueryDto,
} from './dto'
import { Player } from '@prisma/client'

@Injectable()
export class ReferralsService {
  public readonly REFERRAL_BAUNTY = 1250; 
  public readonly REFERRAL_PREMIUM_BAUNTY = 3200;

  private logger = new Logger(ReferralsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async trackReferral(referrerId: string, referredId: string) {
    const referral = await this.prisma.referral.create({
      data: {
        referrerId,
        referredId,
      },
    });

    // Получаем текущую дату в Московском времени
    const nowMoscowTime = new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' });
    const currentDay = new Date(nowMoscowTime);
    currentDay.setHours(0, 0, 0, 0);  // Обнуляем часы, чтобы получить только дату

    // 3. Проверяем, есть ли уже запись на этот день
    let referralDay = await this.prisma.referralDay.findFirst({
      where: {
          referralId: referral.id,
          day: currentDay,
      },
    });

    if (referralDay) {
      // Если запись есть, увеличиваем количество регистраций
      await this.prisma.referralDay.update({
          where: { id: referralDay.id },
          data: {
              registrations: referralDay.registrations + 1,
          },
      });
    } else {
      // Если записи нет, создаем новую запись за текущий день
      await this.prisma.referralDay.create({
          data: {
              referralId: referral.id,
              day: currentDay,
              registrations: 1,
          },
      });
    }
  }

  async fgetRegistrationsForLastWeek(numDays: number) {
    // 1. Определяем дату семь дней назад с учётом московского времени
    const nowMoscowTime = new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' });
    const currentDay = new Date(nowMoscowTime);
    const lastWeek = subDays(currentDay, numDays); // Получаем дату неделю назад

    // 2. Запрос в базу для получения регистраций за последние 7 дней
    const registrations = await this.prisma.referralDay.groupBy({
        by: ['day'],
        where: {
            day: {
                gte: lastWeek, // Фильтруем по дням больше или равно последней неделе
            },
        },
        _sum: {
            registrations: true, // Суммируем количество регистраций за каждый день
        },
        orderBy: {
            day: 'asc', // Упорядочиваем по дате (от старой к новой)
        },
    });

    // 3. Приводим результат к нужному формату: массив объектов с датой и количеством регистраций
    const result = registrations.map(reg => ({
        date: reg.day,
        registrations: reg._sum.registrations || 0,
    }));

    return result;
  }

  async rewardReferrer(referrerId: string) {
    const referrer = await this.prisma.player.findUnique({ 
      where: { id: referrerId }, 
      include: {
        tgAccount: true
      }
    });

    this.logger.log(`Player with tgId: ${referrer.tgAccount.tgId} was rewarded`);
  }

  async findByReferralCode(referralCode) {
    return this.prisma.player.findFirst({ 
      where: { referralCode },
      include: { tgAccount: true }
    });
  }

  async getReferralsCount(player: Player) {
    return this.prisma.player.count({ where: { invitedById: player.id } });
  }

  async getReferrals(player: Player, query?: GetReferralsQueryDto) {
    const { take = 10, page = 1 } = query || {};
    // Получаем общее количество рефералов
    const totalCount = await this.prisma.player.count({
      where: { invitedById: player.id },
    });

    // Получаем срез рефералов
    const skip = (page - 1) * take
    const referrals = await this.prisma.player.findMany({
      where: { invitedById: player.id },
      skip,
      take,
    });

    // this.logger.log(
    //   `Player with tgId: ${player.tgId} successfully got his referrals`,
    // )
    return { totalCount, referrals }
  }

  async getReferrerByTgId(tgId: string, query?: GetReferralsQueryDto) {

    const { take = 10, page = 1 } = query || {};
    const skip = (page - 1) * take

    const tgAccount = await this.prisma.telegramAccount.findUnique({
      where: { tgId }
    })

    return this.prisma.player.findUnique({
      where: { tgAccountId: tgAccount.id },
      include: {
        invitations: {
          skip,
          take
        },
      },
    });
  }

  async claimBaunty(tgId: string, referralId: string) {
      
    const tgAccount = await this.prisma.telegramAccount.findUnique({
      where: { tgId }
    })

    if (!tgAccount) {
      const msg = `Player account with tgId: ${tgId} not found.`
      this.logger.error(new Error(msg));
      throw new NotFoundException(msg);
    }

    const player = await this.prisma.player.findUnique({
      where: { tgAccountId: tgAccount.id },
      
    });

    if (!player) {
      const msg = `Player with tgId: ${tgId} not found.`
      this.logger.error(new Error(msg));
      throw new NotFoundException(msg);
    }

    const referral = await this.prisma.player.findUnique({
      where: { id: referralId },
      include: {
        tgAccount: true
      }
    })


    if (!referral) {
      const msg = `Referral with tgId: ${tgId} not found.`
      this.logger.error(new Error(msg));
      throw new NotFoundException(msg);
    }

    if (referral.referrerRewarded) { 
      const msg = `Referral with tgId: ${tgId} already rewarded.`
      this.logger.error(new Error(msg));
      throw new BadRequestException(msg);
    }

    const baunty = referral.tgAccount.isPremium 
      ? this.REFERRAL_PREMIUM_BAUNTY
      : this.REFERRAL_BAUNTY 
   
    // await this.prisma.player.update({
    //   where: { id: player.id },
    //   data: { balance: player.balance + baunty }
    // })  

    // await this.prisma.player.update({
    //   where: { id: referralId},
    //   data: { referrerRewarded: true }
    // })
  }

  async claimBauntyForAll(tgId: string) {
      
  //   const player = await this.prisma.player.findUnique({
  //    where: {tgId},
  //    include: { invitations: true}
  //  });
  //  if (!player) {
  //   const msg = `Player with tgId: ${tgId} not found.`
  //   this.logger.error(new Error(msg));
  //   throw new NotFoundException(msg);
  //  }

  //  const premiumReferrals = player.invitations
  //   .filter((referral) => referral.isPremium === true && (
  //     referral.referrerRewarded === false || referral.referrerRewarded === undefined 
  //   ));
  //  const referrals = player.invitations
  //   .filter((referral) => referral.isPremium === false && (
  //     referral.referrerRewarded === false || referral.referrerRewarded === undefined 
  //   ));

  //  const total_premium_baunty = premiumReferrals.length * this.REFERRAL_PREMIUM_BAUNTY
  //  const total_baunty = referrals.length * this.REFERRAL_BAUNTY
   
  //  await this.prisma.player.update({
  //    where: { id: player.id },
  //    data: { balance: player.balance + total_baunty + total_premium_baunty }
  //  })  

  //  const job = []

  //  for (const referral of referrals) {
  //     const promise = this.prisma.player.update({
  //       where: { id: referral.id },
  //       data: { referrerRewarded: true}
  //     })
  //     job.push(promise)
  //   }
  //   for (const referral of premiumReferrals) {
  //     const promise = this.prisma.player.update({
  //       where: { id: referral.id },
  //       data: { referrerRewarded: true}
  //     })
  //     job.push(promise)
  //   }

  //   const ready = await Promise.all(job)

  //   if (!ready) {
  //     const msg = 'Claim credentials for all referrals not completed'
  //     this.logger.error(new Error(msg));
  //     throw new BadRequestException(msg);
  //   }
 }

 async isClaimedAll (tgId: string) {
    // const player = await this.prisma.player.findUnique({
    //   where: {tgId},
    //   include: { invitations: 
    //     { where: { 
    //       referrerRewarded: false
    //     }  
    //   }}
    // });

    // if (!player) {
    //   const msg = `Player with tgId: ${tgId} not found.`
    //   this.logger.error(new Error(msg));
    //   throw new NotFoundException(msg);
    // }

    // return player.invitations.length === 0 
  }

}