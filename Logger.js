const winston = require("winston");
const path = require("path");
var PROJECT_ROOT = __dirname

const { format } = winston;
const { combine, timestamp, printf, colorize } = format;

const vlabsDefaultFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const log = new winston.createLogger({
    level: "debug",
    format: combine(
        timestamp(),
        vlabsDefaultFormat
    ),
    transports: [
        new winston.transports.File({ filename: path.resolve(PROJECT_ROOT,"build-error.log"), level: "error", handleExceptions: true }),
        new winston.transports.File({ filename: path.resolve(PROJECT_ROOT,"build-combined.log"), handleExceptions: true })
    ],
    exitOnError: false
});

log.stream = {
  write: function (message) {
    log.info(message)
  }
}
// A custom log interface that wraps winston, making it easy to instrument
// code and still possible to replace winston in the future.

module.exports.addDebug = function () {
  log.add(new winston.transports.Console({level: "debug",format: combine(colorize({all: true}),timestamp(),vlabsDefaultFormat), handleExceptions: true}))
}

module.exports.addInfo = function () {
  log.add(new winston.transports.Console({level: "info",format: combine(colorize({all: true}),timestamp(),vlabsDefaultFormat), handleExceptions: true}))
}

module.exports.debug = module.exports.log = function () {
  log.debug.apply(log, formatLogArguments(arguments))
}
module.exports.info = function () {
  log.info.apply(log, formatLogArguments(arguments))
}
module.exports.warn = function () {
  log.warn.apply(log, formatLogArguments(arguments))
}
module.exports.error = function () {
  log.error.apply(log, formatLogArguments(arguments))
}
module.exports.stream = log.stream
/**
 * Attempts to add file and line number info to the given log arguments.
 */
function formatLogArguments (args) {
  args = Array.prototype.slice.call(args)
  var stackInfo = getStackInfo(1)
  if (stackInfo) {
    // get file path relative to project root
    var calleeStr = '[' + stackInfo.relativePath + ':' + stackInfo.line + ":" + stackInfo.pos + ']'
    if (typeof (args[0]) === 'string') {
      args[0] = calleeStr + ' ' + args[0]
    } else {
      args.unshift(calleeStr)
    }
  }
  return args
}
/**
 * Parses and returns info about the call stack at the given index.
 */
function getStackInfo (stackIndex) {
  // get call stack, and analyze it
  // get all file, method, and line numbers
  var stacklist = (new Error()).stack.split('\n').slice(3)
  // stack trace format:
  // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
  // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
  var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
  var stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi
  var s = stacklist[stackIndex] || stacklist[0]
  var sp = stackReg.exec(s) || stackReg2.exec(s)
  if (sp && sp.length === 5) {
    return {
      method: sp[1],
      relativePath: path.relative(PROJECT_ROOT, sp[2]),
      line: sp[3],
      pos: sp[4],
      file: path.basename(sp[2]),
      stack: stacklist.join('\n')
    }
  }
}