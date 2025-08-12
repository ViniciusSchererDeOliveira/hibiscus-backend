import { Module } from "@nestjs/common";
import { AuthService } from "@/auth/auth.service";
import { AuthController } from "@/auth/auth.controller";
import { AccessTokenStrategy } from "@/auth/strategies/accessToken.strategy";
import { RefreshTokenStrategy } from "@/auth/strategies/refreshToken.strategy";
import { ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>("JWT_ACCESS_SECRET"),
          signOptions: {
            expiresIn: "15m",
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
