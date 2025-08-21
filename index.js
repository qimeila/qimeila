const TronWeb = require('tronweb');
const { config, validateConfig } = require('./config/config');
const { MarketContract } = require('./contracts/market-contract');
const { EventListener } = require('./services/event-listener');
const { logInfo, logError } = require('./utils/logger');

async function main() {
  try {
    console.log('🚀 Starting STRX Protocol Liquidate Monitor...\n');
    
    // 验证配置
    logInfo('Validating configuration...');
    validateConfig();
    logInfo('Configuration validation passed');
    
    // 初始化TronWeb
    logInfo('Initializing TronWeb...');
    const tronWeb = new TronWeb({
      fullHost: config.tron.rpcUrl,
      headers: { "TRON-PRO-API-KEY": config.tron.apiKey }
    });
    
    // 测试连接
    try {
      const currentBlock = await tronWeb.trx.getCurrentBlock();
      logInfo(`Connected to TRON network. Current block: ${currentBlock.block_header?.raw_data?.number || 'unknown'}`);
    } catch (error) {
      logError('Failed to connect to TRON network', error);
      throw error;
    }
    
    // 初始化Market合约
    logInfo('Initializing Market Contract...');
    const marketContract = new MarketContract(tronWeb, config.contracts.market);
    logInfo(`Market contract initialized at: ${config.contracts.market}`);
    
    // 初始化事件监听器
    logInfo('Initializing Event Listener...');
    const eventListener = new EventListener(tronWeb, marketContract, config);
    
    // 注册事件处理器
    eventListener.on('RentResource', (event) => {
      logInfo('RentResource event received', { event });
    });
    
    eventListener.on('ReturnResource', (event) => {
      logInfo('ReturnResource event received', { event });
    });
    
    eventListener.on('Liquidate', (event) => {
      logInfo('Liquidate event received', { event });
    });
    
    // 启动事件监听器
    logInfo('Starting event listener...');
    await eventListener.start();
    
    // 保持进程运行
    logInfo('Event listener started successfully. Monitoring for events...\n');
    
    // 处理优雅关闭
    process.on('SIGINT', async () => {
      logInfo('Received SIGINT, shutting down gracefully...');
      eventListener.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logInfo('Received SIGTERM, shutting down gracefully...');
      eventListener.stop();
      process.exit(0);
    });
    
    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
      logError('Uncaught exception', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logError('Unhandled rejection at', { promise, reason });
      process.exit(1);
    });
    
  } catch (error) {
    logError('Failed to start application', error);
    process.exit(1);
  }
}

// 启动应用
if (require.main === module) {
  main().catch((error) => {
    logError('Application failed to start', error);
    process.exit(1);
  });
} 
