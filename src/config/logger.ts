import winston from 'winston'

// import { Config } from '.'
// The following are the levels defined by Syslog in descending order of severity:
// Emergency (emerg): indicates that the system is unusable and requires immediate attention.
// Alert (alert): indicates that immediate action is necessary to resolve a critical issue.
// Critical (crit): signifies critical conditions in the program that demand intervention to prevent system failure.
// Error (error): indicates error conditions that impair some operation but are less severe than critical situations.
// Warning (warn): signifies potential issues that may lead to errors or unexpected behavior in the future if not addressed.
// Notice (notice): applies to normal but significant conditions that may require monitoring.
// Informational (info): includes messages that provide a record of the normal operation of the system.
// Debug (debug): intended for logging detailed information about the system for debugging purposes.

const logger = winston.createLogger({
  level: 'info',
  defaultMeta: {
    serviceName: 'authService',
  },
  transports: [
    // new winston.transports.Console({
    //   level: 'info',
    //   format: winston.format.combine(
    //     winston.format.timestamp(),
    //     winston.format.json(),
    //     winston.format.prettyPrint(),
    //   ),
    // }),
    new winston.transports.File({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint(),
      ),
      dirname: 'logs',
      filename: 'combined.logs',
      // silent: Config.NODE_ENV === 'test',
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
      // silent: Config.NODE_ENV === 'test',
    }),
  ],
})

export default logger
