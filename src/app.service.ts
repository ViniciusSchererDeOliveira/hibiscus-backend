import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}
  /**
   * Returns a welcome message with the port.
   * @returns {string} The welcome message.
   */
  getHello(): string {
    const port = this.configService.getOrThrow<number>("PORT");
    return `Hello World! Running on port ${port}`;
  }
}
