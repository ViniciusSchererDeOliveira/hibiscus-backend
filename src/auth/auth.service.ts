import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { LoginRequest, Tokens } from "@/auth/auth.types";
import { USER_SUBJECT } from "@/auth/auth.constants";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates the user's credentials.
   * @param {LoginRequest} credentials - The user's credentials.
   * @returns {boolean} True if the credentials are valid, false otherwise.
   */
  public isValidCredentials(credentials: LoginRequest): boolean {
    const userFromEnv: string =
      this.configService.getOrThrow<string>("USERNAME");
    const passwordFromEnv: string =
      this.configService.getOrThrow<string>("PASSWORD");

    return (
      credentials.username === userFromEnv &&
      credentials.password === passwordFromEnv
    );
  }

  /**
   * Generates access and refresh tokens.
   * @param payload - The payload to sign.
   * @returns {Promise<Tokens>} The access and refresh tokens.
   */
  public async getTokens(payload: {
    sub: string;
    username: string;
  }): Promise<Tokens> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: this.configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
          expiresIn: this.configService.getOrThrow<string>(
            "JWT_ACCESS_TOKEN_EXPIRATION",
          ),
        }),
        this.jwtService.signAsync(payload, {
          secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
          expiresIn: this.configService.getOrThrow<string>(
            "JWT_REFRESH_TOKEN_EXPIRATION",
          ),
        }),
      ]);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch {
      throw new InternalServerErrorException("Error generating tokens");
    }
  }

  /**
   * Refreshes the user's tokens.
   * @param {string} refreshToken - The refresh token.
   * @returns {Promise<Tokens>} The new access and refresh tokens.
   */
  public async refreshTokens(refreshToken: string): Promise<Tokens> {
    const refreshSecret: string =
      this.configService.getOrThrow<string>("JWT_REFRESH_SECRET");

    try {
      const payload: { sub: string; username: string } =
        await this.jwtService.verifyAsync(refreshToken, {
          secret: refreshSecret,
        });

      const { sub } = payload;

      const username: string =
        this.configService.getOrThrow<string>("USERNAME");

      if (sub !== USER_SUBJECT) {
        throw new UnauthorizedException("Invalid token for this user");
      }

      return this.getTokens({ sub, username });
    } catch (error) {
      if (error instanceof Error && error.name === "TokenExpiredError") {
        throw new UnauthorizedException("Refresh token expired");
      }

      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
