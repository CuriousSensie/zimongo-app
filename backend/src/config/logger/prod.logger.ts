import { format, createLogger, transports } from 'winston';
const { timestamp, combine, errors, json } = format;

function buildProdLogger() {
  return createLogger({
    format: combine(timestamp(), errors({ stack: true }), json()),
    defaultMeta: { service: 'single-service' },
    transports: [
      new transports.File({ filename: 'error.log', level: 'error' }),
      new transports.File({ filename: 'info.log', level: 'info' }),
      new transports.File({ filename: 'warn.log', level: 'warn' }),
    ],
  });
}
export default buildProdLogger;