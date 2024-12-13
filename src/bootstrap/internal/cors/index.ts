import { INestApplication, Logger } from '@nestjs/common'
import fastifyCors, { FastifyCorsOptions } from '@fastify/cors'
//import { localhostCorsConfig } from './config'

export function initializeCors(app: INestApplication) {

  const server = app.getHttpAdapter().getInstance()

  // Настройки CORS для продакшен-окружения
  const productionCorsOptions: FastifyCorsOptions = {
    origin: [
      'https://web.telegram.org', // Домен Web Telegram App
      'https://duck-taps.vercel.app', // Домен Vercel
      'https://toncase.fun',
      'https://toncase.lol',
      'https://63.250.60.63',
      'https://185.227.111.39',
      'http://localhost:5173',
    ],
    credentials: true,
    preflightContinue: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  };

  // Настройки CORS для разработки
  const developmentCorsOptions: FastifyCorsOptions = {
    origin: false, // отключаем CORS в разработке
    credentials: true,
    preflightContinue: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  };

  server.register(fastifyCors, {
    hook: 'preHandler',
    delegator: (req, callback) => {
      let corsOptions: FastifyCorsOptions;

      if (process.env.NODE_ENV === 'production') {
        corsOptions = productionCorsOptions;
      } else {
        corsOptions = developmentCorsOptions;
      }

      // Проверяем заголовок Origin и устанавливаем origin в true, если нужно
      if (corsOptions.origin === false) {
        // Для разработки
        if (/localhost/.test(req.headers.origin || '')) {
          corsOptions.origin = true;
        }
      } else if (Array.isArray(corsOptions.origin)) {
        // Для продакшена
        if (corsOptions.origin.includes(req.headers.origin || '')) {
          corsOptions.origin = true;
        }
      }

      // callback ожидает два параметра: error и options
      callback(null, corsOptions)
    },
    });

    // Обработка preflight OPTIONS запросов
    server.addHook('preHandler', (req, reply, done) => {
      if (req.method === 'OPTIONS') {
        let allowedOrigin: string | undefined;
    
        if (process.env.NODE_ENV === 'production') {
          const allowedOrigins = [
            'https://web.telegram.org',
            'https://duck-taps.vercel.app',
            'http://tonfarm.ru',
            'https://tonfarm.ru',
            'http://45.8.250.204',
            'https://45.8.250.204',
            'http://localhost:5173',

          ];
    
          // Проверяем заголовок Origin
          if (allowedOrigins.includes(req.headers.origin || '')) {
            allowedOrigin = req.headers.origin as string;
          }
        } else {
          // В разработке разрешаем запросы только с localhost
          if (/localhost/.test(req.headers.origin || '')) {
            allowedOrigin = 'http://localhost:5173';
          }
        }
    
        if (allowedOrigin) {
          reply
            .header('Access-Control-Allow-Origin', allowedOrigin)
            .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
            .header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            .status(204)
            .send();
        } else {
          // Если Origin не разрешен, просто отправляем 204 без CORS заголовков
          reply.status(204).send();
        }
      } else {
        done();
      }
    });
    Logger.log('CORS initialized', 'Bootstrap')
}