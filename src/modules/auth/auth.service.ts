import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { UserStatus } from '../users/entities/user.entity';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    return user;
  }

  async login(loginDto: LoginDto): Promise<TokenResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    type UserWithId = User & { _id: { toString(): string } | string };
    const userWithId = user as unknown as UserWithId;
    const id =
      typeof userWithId._id === 'string'
        ? userWithId._id
        : userWithId._id.toString();
    await this.usersService.updateLastLogin(id);

    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto): Promise<TokenResponse> {
    const user = await this.usersService.create(registerDto);
    return this.generateTokens(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(
        refreshTokenDto.refreshToken,
        {
          secret: this.configService.get('jwt.refreshSecret'),
        },
      );

      const user = await this.usersService.findOne(payload.sub);
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User): Promise<TokenResponse> {
    const payload: TokenPayload = {
      sub: (() => {
        type UserWithId = User & { _id: { toString(): string } | string };
        const userWithId = user as unknown as UserWithId;
        return typeof userWithId._id === 'string'
          ? userWithId._id
          : userWithId._id.toString();
      })(),
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getTokenExpirationTime(
        this.configService.get('jwt.expiresIn') || '7d',
      ),
    };
  }

  private getTokenExpirationTime(expiresIn: string): number {
    const timeMap = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    return value * (timeMap[unit] || 1);
  }
}
