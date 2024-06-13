import { Module } from '@nestjs/common';
import { SermonService } from './sermon.service';
import { SermonController } from './sermon.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sermon, SermonSchema } from './schema/sermon.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: Sermon.name,
          schema: SermonSchema,
        },
      ],
    )
  ],
  controllers: [SermonController],
  providers: [SermonService],
})
export class SermonModule {}
