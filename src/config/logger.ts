import winston from 'winston'
import { Config } from '.'

const logger = winston.createLogger({
  level: 'info',
  defaultMeta: {
    serviceName: 'authService',
  },
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint(),
      ),
      silent: Config.NODE_ENV === 'testing',
    }),

    new winston.transports.File({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint(),
      ),
      dirname: 'logs',
      filename: 'combined.logs',
      silent: Config.NODE_ENV === 'testing',
    }),

    new winston.transports.File({
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint(),
      ),
      dirname: 'logs',
      filename: 'error.logs',
      silent: Config.NODE_ENV === 'testing',
    }),
  ],
})

export default logger
