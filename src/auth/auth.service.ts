import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<UserEntity> {
    try {
      const user = await this.usersService.findOne({ username: username });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new HttpException('Wrong password', HttpStatus.UNAUTHORIZED);
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(user: UserEntity) {
    try {
      const payload = { username: user.username, sub: user.id, role: user.role };
      return {
        user,
        accessToken: this.jwtService.sign(payload),
        refreshToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new HttpException('Failed to generate tokens', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

  