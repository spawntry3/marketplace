import { Controller, Get, Inject, Request } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    @Inject(AppService) 
    private readonly appService: AppService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(@Request() req?: ExpressRequest): Record<string, any> {
    return {
      status: 'ok',
      service: 'marketplace-backend',
      timestamp: new Date().toISOString(),
      clientIp: req?.ip || '127.0.0.1',
      uptime: Math.floor(process.uptime()),
    };
  }

  @Get('info')
  getServerInfo(@Request() req?: ExpressRequest): Record<string, any> {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      userAgent: req?.headers['user-agent'] || 'Internal call',
      memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
    };
  }
}