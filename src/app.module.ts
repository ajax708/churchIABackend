import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SermonModule } from './sermon/sermon.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventoModule } from './evento/evento.module';
import { HttpModule } from '@nestjs/axios';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true,
      }
    ),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/nest2'),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'storage', 'generated'),
      serveRoot: '/storage',
    }),
    SermonModule,
    AuthModule,
    UserModule,
    EventoModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: 
  [
    AppService,
  ],
})
export class AppModule {}
