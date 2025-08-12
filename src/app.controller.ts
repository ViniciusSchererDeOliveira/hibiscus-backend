import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Returns a welcome message.
   * @returns {string} The welcome message.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
