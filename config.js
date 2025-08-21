# TRON Network Configuration
TRON_NETWORK=mainnet
TRON_RPC_URL=https://docs-demo.tron-mainnet.quiknode.pro
TRON_API_KEY=your_tron_api_key_here

# Contract Addresses
MARKET_CONTRACT_ADDRESS=TU2MJ5Veik1LRAgjeSzEdvmDYx7mefJZvd
STRX_CONTRACT_ADDRESS=TU3kjFuhtEo42tsCBtfYUAZxoqQ4yuSLQ5

# Event Listener Configuration
EVENT_START_BLOCK=latest
EVENT_POLLING_INTERVAL=3000
MAX_BLOCKS_PER_POLL=100

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Database Configuration (if needed later)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=liquidate_monitor
DB_USER=postgres
DB_PASSWORD=password 


{
  "name": "liquidate-monitor",
  "version": "1.0.0",
  "description": "STRX Protocol Liquidate Monitor - Event Listener",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "tron",
    "strx",
    "liquidate",
    "monitor",
    "events"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "dotenv": "^16.3.1",
    "node-fetch": "^3.3.2",
    "tronweb": "^5.3.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}






