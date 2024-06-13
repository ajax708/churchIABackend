import { HttpException, Injectable } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/schema/user.schema.';
import { Model } from 'mongoose';
import { hash, compare } from 'bcryptjs';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel
      (User.name) private readonly userModel: Model<UserDocument>,
      private jwtService: JwtService,
      private readonly configService: ConfigService,
  ) {}

  async register(registerAuthDto: RegisterAuthDto) {
    const { password } = registerAuthDto; 
    const passwordHash = await hash(password, 10);
    registerAuthDto = { ...registerAuthDto, password: passwordHash }; // Add passwordHash to registerAuthDto
    return this.userModel.create(registerAuthDto);
  }

  async login(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;
    const findUser = await this.userModel.findOne({email:email});
    if (!findUser){
      throw new HttpException('User not found', 404);
    }

    const checkPassword = await compare(password, findUser.password);
    if (!checkPassword){
      throw new HttpException('Password not match', 403);
    }

    const payload = { id:findUser._id, name:findUser.name};
    const token = this.jwtService.sign(payload);
    
    const data = {
      user: findUser,
      token: token,
    }
    return data;
  }
}
