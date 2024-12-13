import { INestApplication, Logger } from '@nestjs/common'

const Sentry = require("@sentry/nestjs");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");


export function initializeSentry(app: INestApplication) {

  Sentry.init({
    dsn: process.env.SENTRY_DSN, 
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      // Add our Profiling integration
      nodeProfilingIntegration(),
    ],
  
    // Add Tracing by setting tracesSampleRate
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  
    // Set sampling rate for profiling
    // This is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });

  Logger.log('Sentry initialized', 'Bootstrap')
  //}
}