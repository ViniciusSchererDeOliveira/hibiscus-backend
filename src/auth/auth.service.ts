import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { LoginRequest, Tokens } from "@/auth/auth.types";
import { USER_SUBJECT } from "@/auth/auth.constants";
import { authenticator } from "otplib";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Orchestrates the login process, validating credentials and conditionally 2FA.
   * If a 2FA secret is configured, it will be enforced. Otherwise, it allows login with credentials alone.
   * @param {LoginRequest} credentials - The user's credentials, with or without a 2FA token.
   * @returns {Promise<Tokens>} The access and refresh tokens.
   * @throws {UnauthorizedException} If credentials or the 2FA token are invalid.
   * @throws {InternalServerErrorException} If there is an error generating the tokens.
   */
  public async login(credentials: LoginRequest): Promise<Tokens> {
    const areCredentialsValid = this.isValidCredentials(credentials);
    if (!areCredentialsValid) {
      throw new UnauthorizedException("Credenciais inválidas.");
    }

    const twoFactorSecret = this.configService.get<string>(
      "TWO_FACTOR_AUTH_SECRET",
    );

    if (twoFactorSecret) {
      const { twoFactorAuthToken } = credentials;
      if (!twoFactorAuthToken) {
        throw new UnauthorizedException({
          message: "Two-factor authentication required",
          error_code: "2FA_REQUIRED",
        });
      }

      const isTokenValid = this.validateTwoFactorToken(
        twoFactorAuthToken,
        twoFactorSecret,
      );
      if (!isTokenValid) {
        throw new UnauthorizedException("Código 2FA inválido.");
      }
    }

    try {
      return await this.getTokens({
        sub: USER_SUBJECT,
        username: credentials.username,
      });
    } catch {
      throw new InternalServerErrorException("Erro ao gerar tokens de acesso.");
    }
  }

  /**
   * Validates the provided 2FA token against a given secret.
   * @param {string} token - The 6-digit token.
   * @param {string} secret - The secret key for 2FA.
   * @returns {boolean} True if the token is valid.
   */
  private validateTwoFactorToken(token: string, secret: string): boolean {
    return authenticator.verify({
      token,
      secret,
    });
  }

  /**
   * Validates the user's credentials.
   * @param {LoginRequest} credentials - The user's credentials.
   * @returns {boolean} True if the credentials are valid.
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
   * Generates access and refresh tokens for a given payload.
   * @param payload - The payload to be signed into the tokens.
   * @returns {Promise<Tokens>} A promise that resolves to the access and refresh tokens.
   * @throws {InternalServerErrorException} If token generation fails.
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
   * Refreshes the user's tokens using a refresh token.
   * @param {string} refreshToken - The refresh token to use.
   * @returns {Promise<Tokens>} A new set of access and refresh tokens.
   * @throws {UnauthorizedException} If the refresh token is invalid or expired.
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
