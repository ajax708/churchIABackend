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
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: join(__dirname, '..', configService.get<string>('UPLOADS_PATH')),
          serveRoot: '/storage',  // Opcional, si deseas cambiar la raíz de servicio
        },
      ],
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
