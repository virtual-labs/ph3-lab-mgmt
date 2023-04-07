const winston = require("winston");

const { format } = winston;
const { combine, timestamp, label, printf, colorize } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

const log = winston.createLogger({
    level: "debug",
    format: combine(
        colorize(
            {
                all: true
            }
        ),
        label({ label: "ph3-lab-mgmt" }),
        timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.Console({ level: "info" }),
        new winston.transports.File({ filename: "build-error.log", level: "error" }),
        new winston.transports.File({ filename: "build-combined.log" })
    ]
});

module.exports = log;