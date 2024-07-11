import winston from "winston";  
const { combine, timestamp, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
        format: combine(
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            ),
        transports: [
                    new winston.transports.File({
                        filename: 'error.log',
                        level: 'error', 
                    }),
                    new winston.transports.File({
                        filename: 'combined.log',
                        level: 'info', 
                    })
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