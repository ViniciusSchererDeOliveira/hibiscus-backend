import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UnauthorizedException,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AuthService } from "@/auth/auth.service";
import type { LoginRequest, Tokens, RequestWithUser } from "@/auth/auth.types";
import { AuthGuard } from "@nestjs/passport";
import { USER_SUBJECT } from "@/auth/auth.constants";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Handles user login.
   * @param {LoginRequest} credentials - The user's credentials.
   * @returns {Promise<Tokens>} The access and refresh tokens.
   */
  @Post()
  async postLogin(@Body() credentials: LoginRequest): Promise<Tokens> {
    const isValid = this.authService.isValidCredentials(credentials);
    if (!isValid) {
      throw new UnauthorizedException();
    }

    try {
      return await this.authService.getTokens({
        sub: USER_SUBJECT,
        username: credentials.username,
      });
    } catch {
      throw new InternalServerErrorException("Error creating tokens");
    }
  }

  /**
   * Refreshes the user's tokens.
   * @param {RequestWithUser} req - The request object with the user.
   * @returns {Promise<Tokens>} The new access and refresh tokens.
   */
  @UseGuards(AuthGuard("jwt-refresh"))
  @Post("refresh")
  async refreshTokens(@Req() req: RequestWithUser): Promise<Tokens> {
    const { user } = req;
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.refreshTokens(user.refreshToken);
  }
}
