import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schema/user.schema.';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { jwtConstants } from './jwt.constants';
import { JwtStrategy } from './auth.strategy';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    MongooseModule.forFeature(
      [
        {
          name: User.name,
          schema: UserSchema,
        },
      ],
    ),
    JwtModule.register(
      {
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '1h' },
      }
    ),

  ],
  exports: [AuthService],	
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
