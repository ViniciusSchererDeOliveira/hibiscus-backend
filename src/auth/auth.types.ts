import { Request } from "express";

export type LoginRequest = {
  username: string;
  password: string;
};

export type JwtPayload = {
  sub: string;
  username: string;
};

export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type RequestWithUser = Request & {
  user: JwtPayload & { refreshToken: string };
};
