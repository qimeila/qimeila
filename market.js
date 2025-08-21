const { logError } = require('../utils/logger');

// MarketG1合约的简化ABI，只包含我们需要的事件和方法
const MARKET_ABI = [
  // 事件定义
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "user", "type": "address" },
      { "indexed": true, "name": "receiver", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" },
      { "indexed": false, "name": "resourceType", "type": "uint256" },
      { "indexed": false, "name": "securityDeposit", "type": "uint256" },
      { "indexed": false, "name": "totalAmount", "type": "uint256" },
      { "indexed": false, "name": "totalSecurityDeposit", "type": "uint256" },
      { "indexed": false, "name": "rentIndex", "type": "uint256" }
    ],
    "name": "RentResource",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "user", "type": "address" },
      { "indexed": true, "name": "receiver", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" },
      { "indexed": false, "name": "resourceType", "type": "uint256" },
      { "indexed": false, "name": "dirtyRent", "type": "uint256" },
      { "indexed": false, "name": "totalAmount", "type": "uint256" },
      { "indexed": false, "name": "totalSecurityDeposit", "type": "uint256" },
      { "indexed": false, "name": "rentIndex", "type": "uint256" }
    ],
    "name": "ReturnResource",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "user", "type": "address" },
      { "indexed": true, "name": "liquidator", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" },
      { "indexed": false, "name": "resourceType", "type": "uint256" },
      { "indexed": false, "name": "dirtyRent", "type": "uint256" },
      { "indexed": false, "name": "totalAmount", "type": "uint256" },
      { "indexed": false, "name": "totalSecurityDeposit", "type": "uint256" },
      { "indexed": false, "name": "rentIndex", "type": "uint256" }
    ],
    "name": "Liquidate",
    "type": "event"
  },
  // 方法定义
  {
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "resourceType", "type": "uint256" }
    ],
    "name": "getRentInfo",
    "outputs": [
      { "name": "securityDeposit", "type": "uint256" },
      { "name": "globalRentIndex", "type": "uint256" },
      { "name": "liquidatable", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

class MarketContract {
  constructor(tronWeb, contractAddress) {
    this.tronWeb = tronWeb;
    this.contractAddress = contractAddress;
    this.contract = null;
    this.init();
  }

  init() {
    try {
      this.contract = this.tronWeb.contract(MARKET_ABI, this.contractAddress);
    } catch (error) {
      logError('Failed to initialize market contract', error);
      throw error;
    }
  }

  // 获取用户租赁信息
  async getRentInfo(userAddress, resourceType) {
    try {
      const result = await this.contract.getRentInfo(userAddress, resourceType).call();
      return {
        securityDeposit: result.securityDeposit.toString(),
        globalRentIndex: result.globalRentIndex.toString(),
        liquidatable: result.liquidatable
      };
    } catch (error) {
      logError('Failed to get rent info', error);
      throw error;
    }
  }

  // 获取合约地址
  getAddress() {
    return this.contractAddress;
  }

  // 获取ABI
  getABI() {
    return MARKET_ABI;
  }
}

module.exports = { MarketContract, MARKET_ABI }; 
