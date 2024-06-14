import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import axios from 'axios';
import { User, UserDocument } from 'src/user/schema/user.schema.';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';


@Injectable()
export class AuthService {
  private readonly authUrl = process.env.BACKEND_URL + '/auth/login';
  private accessToken: string = null;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerAuthDto: RegisterAuthDto): Promise<UserDocument> {
    const { password } = registerAuthDto;
    const passwordHash = await hash(password, 10);
    registerAuthDto = { ...registerAuthDto, password: passwordHash };
    return this.userModel.create(registerAuthDto);
  }

  async login(loginAuthDto: LoginAuthDto) {
    const { username: email, password } = loginAuthDto;
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

  async authenticate(username: string, password: string): Promise<void> {
    try {
      const response = await axios.post(this.authUrl, { username, password });
      if (response.data && response.data.accessToken) {
        this.accessToken = response.data.accessToken;

      } else {
        throw new HttpException('Invalid token received', HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await axios.post(this.authUrl, { refreshToken: this.accessToken });
      if (response.data && response.data.accessToken) {
        this.accessToken = response.data.accessToken;
        return this.accessToken;
      } else {
        throw new HttpException('Invalid token received', HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      throw new HttpException('Token refresh failed', HttpStatus.UNAUTHORIZED);
    }
  }

  getAccessToken(): string {
    return this.accessToken;
  }

  decodeToken(): { [key: string]: any } | null {
    if (this.accessToken) {
      return this.jwtService.decode(this.accessToken) as { [key: string]: any };
    }
    return null;
  }

  async isAuthenticatedUser(): Promise<boolean> {
    if (!this.accessToken) {
      return false;
    }

    const decodedToken = this.decodeToken();
    if (!decodedToken || !decodedToken.exp) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp > currentTime;
  }
}
