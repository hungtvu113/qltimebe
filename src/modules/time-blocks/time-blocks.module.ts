import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimeBlocksController } from './time-blocks.controller';
import { TimeBlocksService } from './time-blocks.service';
import { TimeBlock, TimeBlockSchema } from './schemas/time-block.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TimeBlock.name, schema: TimeBlockSchema }]),
  ],
  controllers: [TimeBlocksController],
  providers: [TimeBlocksService],
  exports: [TimeBlocksService],
})
export class TimeBlocksModule {}
