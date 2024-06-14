import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerAuthDto: RegisterAuthDto) {
    //console.log({ body: registerAuthDto });
    return this.authService.register(registerAuthDto);
  }

  @Post('login')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post('loginService')
  async loginService(@Body() loginDto: LoginAuthDto) {
    try {
      const { username, password } = loginDto;
      await this.authService.authenticate(username, password);
      const accessToken = this.authService.getAccessToken();
      if (!accessToken) {
        throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
      }
      console.log('Access token:', accessToken);
      return { accessToken };
    } catch (error) {
      throw new HttpException('Authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }
}
