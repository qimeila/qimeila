const winston = require('winston');
const path = require('path');

// 创建日志目录
const fs = require('fs');
const logDir = path.dirname(process.env.LOG_FILE || 'logs/monitor.log');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'liquidate-monitor' },
  transports: [
    new winston.transports.File({ 
      filename: process.env.LOG_FILE || 'logs/monitor.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ],
});

function logInfo(message, meta = {}) {
  logger.info(message, meta);
}

function logError(message, error = null) {
  if (error) {
    logger.error(message, { error: error.message, stack: error.stack });
  } else {
    logger.error(message);
  }
}

function logWarn(message, meta = {}) {
  logger.warn(message, meta);
}

function logDebug(message, meta = {}) {
  logger.debug(message, meta);
}

module.exports = { logInfo, logError, logWarn, logDebug, logger }; 
