export class BaseProvider {
  constructor() {
    if (this.constructor === BaseProvider) {
      throw new Error('BaseProvider 类不能被直接实例化')
    }
  }

  // 测试 API 连接
  async testConnection(apiKey) {
    throw new Error('必须实现 testConnection 方法')
  }

  // 发送消息
  async sendMessage(apiKey, messages) {
    throw new Error('必须实现 sendMessage 方法')
  }

  // 获取错误信息
  getErrorMessage(error) {
    throw new Error('必须实现 getErrorMessage 方法')
  }

  // 获取默认配置
  getConfig() {
    throw new Error('必须实现 getConfig 方法')
  }
} 