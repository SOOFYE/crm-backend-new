import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { AuthLoginDto } from "./dto/login-auth.dto";


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  async login(@Body() body: AuthLoginDto) {
    const user = await this.authService.validateUser(body.username, body.password);
    return this.authService.login(user);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() req) {
    const user = req.user; // This will be populated by JwtAuthGuard
    return this.authService.login(user);
  }
}
