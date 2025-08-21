require('dotenv').config();

const config = {
  tron: {
    rpcUrl: process.env.TRON_RPC_URL || 'https://api.trongrid.io',
    apiKey: process.env.TRON_API_KEY || '',
  },
  contracts: {
    market: process.env.MARKET_CONTRACT_ADDRESS || '',
  },
  eventListener: {
    pollingInterval: parseInt(process.env.POLLING_INTERVAL) || 5000,
    blockRange: parseInt(process.env.BLOCK_RANGE) || 10,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/monitor.log',
  },
};

function validateConfig() {
  const errors = [];
  
  if (!config.contracts.market) {
    errors.push('MARKET_CONTRACT_ADDRESS is required');
  }
  
  if (!config.tron.apiKey) {
    errors.push('TRON_API_KEY is required');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

module.exports = { config, validateConfig }; 
