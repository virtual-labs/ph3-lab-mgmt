const winston = require("winston");
const path = require("path");

const { format } = winston;
const { combine, timestamp, label, printf, colorize } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});

let getLabel = function (callingModule) {
    // get relative file path from this file
    let relativePath = path.relative(__dirname, callingModule.filename);
    return relativePath;
};

const log = (callingModule) => {return winston.createLogger({
    level: "debug",
    format: combine(
        colorize(
            {
                all: true
            }
        ),
        label({ label: getLabel(callingModule) }),
        timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.Console({ level: "info" }),
        new winston.transports.File({ filename: "build-error.log", level: "error" }),
        new winston.transports.File({ filename: "build-combined.log" })
    ]
});}

module.exports = log;