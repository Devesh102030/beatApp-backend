import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { EnvConfig } from './env.validation';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService<EnvConfig, true>) {}

  get nodeEnv(): string {
    return this.configService.get('NODE_ENV', { infer: true });
  }

  get port(): number {
    return this.configService.get('PORT', { infer: true });
  }

  get databaseUrl(): string {
    return this.configService.get('DATABASE_URL', { infer: true });
  }

  get webAppUrl(): string {
    return this.configService.get('WEB_APP_URL', { infer: true });
  }

  get extensionOrigin(): string {
    return this.configService.get('EXTENSION_ORIGIN', { infer: true });
  }

  get livekitUrl(): string {
    return this.configService.get('LIVEKIT_URL', { infer: true });
  }

  get livekitApiKey(): string {
    return this.configService.get('LIVEKIT_API_KEY', { infer: true });
  }

  get livekitApiSecret(): string {
    return this.configService.get('LIVEKIT_API_SECRET', { infer: true });
  }

  get jwtSecret(): string | undefined {
    return this.configService.get('JWT_SECRET', { infer: true });
  }

  get hostSecretSigningKey(): string {
    return this.configService.get('HOST_SECRET_SIGNING_KEY', { infer: true });
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }
}
