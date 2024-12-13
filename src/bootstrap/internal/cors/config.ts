import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'

const allowedDomains = [
  'localhost:8000',
  'localhost:8001',
//   '45.131.40.89:80',
//   '45.131.40.89:8000',
//   '45.131.40.89:8080',
//   '45.131.40.89:8001',
//   'konkurs-kidsarts.ru:80',
//   'konkurs-kidsarts.ru:8080',
//   'konkurs-kidsarts.ru:8000',
//   'konkurs-kidsarts.ru:8081',
]

const allowedOrigin = (origin: any) => {
  //if (!origin) return true
  if (!origin) return false
  const parts = origin.split('/')
  const domain = parts[parts.length - 1]
  console.log(domain)
  return allowedDomains.includes(domain)
}

export const localhostCorsConfig: CorsOptions = {
  origin: (origin, cb) => {
    console.log(origin)
    if (allowedOrigin(origin)) {
      cb(null, origin)
    } else {
      cb(Error('invalid origin'))
    }
  },
  credentials: true,
  preflightContinue: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}