import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { EmailService } from './services/email.service';
import { SchedulerService } from './services/scheduler.service';
import { EmailSubscription, EmailSubscriptionSchema } from './schemas/email-subscription.schema';
import { PublicEmailSubscription, PublicEmailSubscriptionSchema } from './schemas/public-email-subscription.schema';
import { TasksModule } from '../tasks/tasks.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailSubscription.name, schema: EmailSubscriptionSchema },
      { name: PublicEmailSubscription.name, schema: PublicEmailSubscriptionSchema },
    ]),
    ConfigModule,
    TasksModule,
    UsersModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, SchedulerService],
  exports: [NotificationsService, EmailService, SchedulerService],
})
export class NotificationsModule {}
