import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TimeBlocksModule } from './modules/time-blocks/time-blocks.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { NotesModule } from './modules/notes/notes.module';
import { AIModule } from './modules/ai/ai.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    // Cấu hình biến môi trường
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Cấu hình Schedule/Cron jobs
    ScheduleModule.forRoot(),
    
    // Kết nối MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/qltime',
      }),
    }),
    
    // Các module chức năng
    AuthModule,
    UsersModule,
    TasksModule,
    ProjectsModule,
    TimeBlocksModule,
    CategoriesModule,
    CalendarModule,
    StatisticsModule,
    PreferencesModule,
    NotesModule,
    AIModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
