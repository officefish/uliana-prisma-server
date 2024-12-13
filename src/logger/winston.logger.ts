import { utilities } from "nest-winston";
import * as winston from 'winston';


//const newrelicFormatter = require('@newrelic/winston-enricher')(winston)
//import TransportStream from 'winston-transport';

//custom log display format
const customFormat = winston.format.printf(({timestamp, level, stack, message}) => {
    return `${timestamp} - [${level.toUpperCase().padEnd(7)}] - ${stack || message}`
})

const options = {
    file: {
        filename: 'logs/error.log',
        level: 'error'
    },
    console: {
        level: 'silly'
    }
}

// for development environment
const devLogger = {
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({stack: true}),
        customFormat,
        utilities.format.nestLike(), // NestJS-specific log format
    ),
    transports: [new winston.transports.Console(options.console)]
}

interface NewRelicTransportOptions {
  level?: string
  apiKey: string
  applicationName: string
}

// export class NewRelicTransport extends TransportStream {
//     constructor(opts: NewRelicTransportOptions) {
//       super(opts);
//       this.level = opts.level || 'info';
//     }
  
//     log(info: any, callback: () => void) {
//       setImmediate(() => this.emit('logged', info));
  
//       // Send the log to New Relic
//       newrelic.recordCustomEvent('Log', {
//         level: info.level,
//         message: info.message,
//         ...info.meta,
//       });
  
//       callback();
//     }
//   }

// for production environment
const prodLogger = {
    format: winston.format.combine(
        //newrelicFormatter(), // Add New Relic metadata to logs
        winston.format.timestamp(),
        winston.format.errors({stack: true}),
        winston.format.json(),
        utilities.format.nestLike(), // NestJS-specific log format
    ),
    transports: [
        new winston.transports.Console(options.console),
        new winston.transports.File(options.file),
        new winston.transports.File({
            filename: 'logs/combine.log',
            level: 'info'
        }),

        // new NewRelicTransport({
        //     apiKey: process.env.NEW_RELIC_KEY, // Set your New Relic API key
        //     applicationName: process.env.NEW_RELIC_NAME || 'Toncases server App', // Set app name
        //     level: 'log', // Logs only 'warn' and higher
        //   }),
    ]
}

// export log instance based on the current environment
const instanceLogger = (process.env.NODE_ENV === 'production') ? prodLogger : devLogger

export const logger = winston.createLogger(instanceLogger)