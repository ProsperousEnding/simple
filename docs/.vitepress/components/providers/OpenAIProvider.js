import { BaseProvider } from './BaseProvider'

export class OpenAIProvider extends BaseProvider {
  constructor() {
    super()
    this.apiEndpoint = 'https://api.openai.com/v1/chat/completions'
    this.defaultModel = 'gpt-3.5-turbo'
  }

  // 创建请求头
  getHeaders(apiKey) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`,
      'OpenAI-Beta': 'assistants=v1'  // 使用最新的 API 版本
    }
  }

  // 处理 API 响应
  async handleResponse(response) {
    const data = await response.json()
    
    if (!response.ok) {
      // 详细的错误信息处理
      const errorMessage = data.error?.message || `服务器返回错误：${response.status}`
      const errorType = data.error?.type || 'unknown_error'
      const errorCode = data.error?.code || response.status
      
      throw new Error(JSON.stringify({
        message: errorMessage,
        type: errorType,
        code: errorCode
      }))
    }
    
    return data
  }

  async testConnection(apiKey) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: this.getHeaders(apiKey),
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [{ role: 'user', content: 'Hello' }],
          temperature: 0.7,
          max_tokens: 5,
          stream: false
        })
      })

      const data = await this.handleResponse(response)

      return {
        success: true,
        message: '连接成功！OpenAI API 工作正常',
        model: data.model,  // 返回实际使用的模型
        usage: data.usage   // 返回使用情况
      }
    } catch (error) {
      let errorData = {}
      try {
        errorData = JSON.parse(error.message)
      } catch {
        errorData = { message: error.message }
      }

      const errorInfo = this.getErrorMessage(errorData)
      return {
        success: false,
        message: `${errorInfo.title}：${errorInfo.detail}`
      }
    }
  }

  async sendMessage(apiKey, messages) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: this.getHeaders(apiKey),
        body: JSON.stringify({
          model: this.defaultModel,
          messages: messages.map(msg => ({
            role: msg.role === 'system' ? 'system' : 
                 msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          temperature: 0.7,
          max_tokens: 2000,
          stream: false,
          presence_penalty: 0.6,    // 添加 presence_penalty 避免重复
          frequency_penalty: 0.5    // 添加 frequency_penalty 增加多样性
        })
      })

      const data = await this.handleResponse(response)
      return data.choices[0].message.content
    } catch (error) {
      let errorData = {}
      try {
        errorData = JSON.parse(error.message)
      } catch {
        errorData = { message: error.message }
      }
      throw new Error(errorData.message)
    }
  }

  getErrorMessage(error) {
    const message = error.message?.toLowerCase() || ''
    const errorType = error.type?.toLowerCase() || ''
    const errorCode = error.code
    
    // 账户额度相关错误
    if (errorType.includes('insufficient_quota') || 
        message.includes('exceeded your current quota') || 
        message.includes('no active subscription') ||
        errorCode === 'insufficient_quota') {
      return {
        title: '账户额度问题',
        detail: '您的 OpenAI 账户可能存在以下问题之一：\n' +
                '1. 免费额度已用尽\n' +
                '2. 未绑定付款方式\n' +
                '3. 账户余额不足\n' +
                '请访问 https://platform.openai.com/account/billing 检查账户状态。'
      }
    }
    
    // API Key 相关错误
    if (errorType.includes('invalid_api_key') || 
        message.includes('invalid api key') || 
        message.includes('incorrect api key') ||
        errorCode === 'invalid_api_key') {
      return {
        title: 'API Key 无效',
        detail: '您输入的 OpenAI API Key 无效，可能原因：\n' +
                '1. API Key 不完整或格式错误\n' +
                '2. API Key 已过期或被撤销\n' +
                '请访问 https://platform.openai.com/api-keys 检查或重新生成 API Key。'
      }
    }
    
    // 请求频率限制
    if (errorType.includes('rate_limit') || 
        message.includes('rate limit') || 
        message.includes('too many requests') ||
        errorCode === 'rate_limit_exceeded') {
      return {
        title: '请求频率超限',
        detail: '您的 API 调用次数已达到限制，解决方案：\n' +
                '1. 等待一段时间后重试\n' +
                '2. 检查是否存在代码中的并发请求\n' +
                '3. 考虑升级您的账户计划\n' +
                '访问 https://platform.openai.com/account/rate-limits 了解更多。'
      }
    }

    // 模型相关错误
    if (errorType.includes('model_not_found') || message.includes('model')) {
      return {
        title: '模型错误',
        detail: '请求的 AI 模型不可用，可能原因：\n' +
                '1. 模型名称错误\n' +
                '2. 模型已停用或更新\n' +
                '3. 您的账户无权访问该模型\n' +
                '请访问 https://platform.openai.com/docs/models 查看可用模型。'
      }
    }
    
    // 默认错误
    return {
      title: '发生未知错误',
      detail: `错误信息：${message}\n` +
              '如果问题持续存在，请检查：\n' +
              '1. API Key 是否正确\n' +
              '2. 网络连接是否正常\n' +
              '3. OpenAI 服务是否可用\n' +
              '访问 https://status.openai.com 查看服务状态。'
    }
  }

  getConfig() {
    return {
      name: 'OpenAI',
      icon: 'lightning',
      keyPlaceholder: 'sk-...',
      keyPrefix: 'sk-',
      apiKeyLink: 'https://platform.openai.com/api-keys',
      model: this.defaultModel,
      modelName: 'GPT-3.5 Turbo'
    }
  }
} 