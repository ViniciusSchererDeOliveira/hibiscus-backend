import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "@/auth/auth.service";
import type { LoginRequest, Tokens, RequestWithUser } from "@/auth/auth.types";
import { AuthGuard } from "@nestjs/passport";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Handles user login with two-factor authentication.
   * The controller delegates the complex logic to the service,
   * only handling the request and response.
   * @param {LoginRequest} credentials - The user's credentials, potentially with a 2FA token.
   * @returns {Promise<Tokens>} The access and refresh tokens.
   */
  @Post()
  async postLogin(@Body() credentials: LoginRequest): Promise<Tokens> {
    return this.authService.login(credentials);
  }

  /**
   * Refreshes the user's tokens.
   * @param {RequestWithUser} req - The request object with the user, including the refresh token.
   * @returns {Promise<Tokens>} A new set of access and refresh tokens.
   * @throws {UnauthorizedException} If the user is not found in the request.
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
