import winston from "winston";  
import { createLogger, format } from 'winston';
const { combine, timestamp, printf,colorize } = format;
import  DailyRotateFile from "winston-daily-rotate-file";
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
        format: combine(
                colorize(),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            ),
        transports : [
            new DailyRotateFile({
                filename: 'error-%DATE%.log',
                datePattern: 'YYYY-MM-DD', 
                level: 'error',
                maxFiles: '10d'
              }),
        ]  
})

if(process.env.NODE_ENV !== 'production'){
        logger.add(new winston.transports.Console({
                format: winston.format.combine(
                winston.format.colorize(),
                logFormat
                )
        }))
}

export default logger;