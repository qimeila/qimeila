const { logInfo, logError, logDebug } = require('../utils/logger');
const { MARKET_ABI } = require('../contracts/market-contract');

// 添加fetch polyfill支持
let fetch;
if (typeof globalThis.fetch === 'undefined') {
  fetch = require('node-fetch');
} else {
  fetch = globalThis.fetch;
}

class EventListener {
  constructor(tronWeb, marketContract, config) {
    this.tronWeb = tronWeb;
    this.marketContract = marketContract;
    this.config = config;
    this.isRunning = false;
    this.lastEventTimestamp = 0;
    this.eventHandlers = new Map();
  }

  // 注册事件处理器
  on(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(handler);
  }

  // 触发事件处理器
  emit(eventType, eventData) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(eventData);
        } catch (error) {
          logError(`Error in event handler for ${eventType}`, error);
        }
      });
    }
  }

  // 启动事件监听器
  async start() {
    if (this.isRunning) {
      logInfo('Event listener is already running');
      return;
    }

    try {
      logInfo('Starting event listener...');
      this.isRunning = true;
      this.startPolling();
    } catch (error) {
      logError('Failed to start event listener', error);
      throw error;
    }
  }

  // 停止事件监听器
  stop() {
    if (!this.isRunning) {
      return;
    }

    logInfo('Stopping event listener...');
    this.isRunning = false;
  }

  // 开始轮询
  startPolling() {
    const poll = async () => {
      if (!this.isRunning) {
        return;
      }

      try {
        await this.pollEvents();
      } catch (error) {
        logError('Error during event polling', error);
      }

      // 停顿1秒后继续下一轮轮询
      if (this.isRunning) {
        setTimeout(poll, 1000);
      }
    };

    // 立即开始第一轮轮询
    poll();
  }

  // 轮询事件
  async pollEvents() {
    try {
      const events = await this.fetchEvents();
      
      if (events && events.length > 0) {
        logInfo(`Found ${events.length} new events`);
        
        for (const event of events) {
          await this.processEvent(event);
        }
      }
    } catch (error) {
      logError('Error polling events', error);
    }
  }

  // 获取事件
  async fetchEvents() {
    try {
      const contractAddress = this.marketContract.getAddress();
      const apiUrl = `https://api.trongrid.io/v1/contracts/${contractAddress}/events`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error('API request failed');
      }

      // 过滤新事件（基于时间戳）
      const newEvents = data.data.filter(event => 
        event.block_timestamp > this.lastEventTimestamp
      );

      // 更新最后事件时间戳
      if (newEvents.length > 0) {
        this.lastEventTimestamp = Math.max(
          ...newEvents.map(event => event.block_timestamp)
        );
      }

      return newEvents;
    } catch (error) {
      logError('Error fetching events', error);
      return [];
    }
  }

  // 处理事件
  async processEvent(eventData) {
    try {
      const eventName = eventData.event_name;
      
      switch (eventName) {
        case 'RentResource':
          this.processRentResourceEvent(eventData);
          break;
        case 'ReturnResource':
          this.processReturnResourceEvent(eventData);
          break;
        case 'Liquidate':
          this.processLiquidateEvent(eventData);
          break;
        default:
          logDebug(`Ignoring event: ${eventName}`);
      }
    } catch (error) {
      logError('Error processing event', error);
    }
  }

  // 处理RentResource事件
  processRentResourceEvent(eventData) {
    try {
      const result = eventData.result;
      const event = {
        type: 'RentResource',
        blockNumber: eventData.block_number,
        blockTimestamp: eventData.block_timestamp,
        transactionHash: eventData.transaction_id,
        user: result.renter,
        receiver: result.receiver,
        amount: result.addedAmount,
        resourceType: result.resourceType,
        securityDeposit: result.addedSecurityDeposit,
        totalAmount: result.amount,
        totalSecurityDeposit: result.securityDeposit,
        rentIndex: result.rentIndex,
        timestamp: new Date(eventData.block_timestamp).toISOString()
      };

      logInfo('RentResource event processed', { event });
      this.emit('RentResource', event);
    } catch (error) {
      logError('Error processing RentResource event', error);
    }
  }

  // 处理ReturnResource事件
  processReturnResourceEvent(eventData) {
    try {
      const result = eventData.result;
      const event = {
        type: 'ReturnResource',
        blockNumber: eventData.block_number,
        blockTimestamp: eventData.block_timestamp,
        transactionHash: eventData.transaction_id,
        user: result.renter,
        receiver: result.receiver,
        amount: result.subedAmount,
        resourceType: result.resourceType,
        usageRental: result.usageRental,
        subedSecurityDeposit: result.subedSecurityDeposit,
        totalAmount: result.amount,
        totalSecurityDeposit: result.securityDeposit,
        rentIndex: result.rentIndex,
        timestamp: new Date(eventData.block_timestamp).toISOString()
      };

      logInfo('ReturnResource event processed', { event });
      this.emit('ReturnResource', event);
    } catch (error) {
      logError('Error processing ReturnResource event', error);
    }
  }

  // 处理Liquidate事件
  processLiquidateEvent(eventData) {
    try {
      const result = eventData.result;
      const event = {
        type: 'Liquidate',
        blockNumber: eventData.block_number,
        blockTimestamp: eventData.block_timestamp,
        transactionHash: eventData.transaction_id,
        user: result.renter,
        liquidator: result.liquidator,
        amount: result.amount,
        resourceType: result.resourceType,
        dirtyRent: result.dirtyRent,
        totalAmount: result.totalAmount,
        totalSecurityDeposit: result.totalSecurityDeposit,
        rentIndex: result.rentIndex,
        timestamp: new Date(eventData.block_timestamp).toISOString()
      };

      logInfo('Liquidate event processed', { event });
      this.emit('Liquidate', event);
    } catch (error) {
      logError('Error processing Liquidate event', error);
    }
  }
}

module.exports = { EventListener }; 
