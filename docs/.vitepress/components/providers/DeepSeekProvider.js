import { BaseProvider } from './BaseProvider'

export class DeepSeekProvider extends BaseProvider {
  constructor() {
    super()
    this.apiEndpoint = 'https://api.deepseek.com/v1/chat/completions'
    this.defaultModel = 'deepseek-chat'
  }

  async testConnection(apiKey) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`.trim()
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [{ role: 'user', content: 'API test' }],
          temperature: 0.7,
          max_tokens: 50
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `服务器返回错误：${response.status}`)
      }

      return {
        success: true,
        message: '连接成功！DeepSeek API 工作正常'
      }
    } catch (error) {
      const errorInfo = this.getErrorMessage(error.message)
      return {
        success: false,
        message: `${errorInfo.title}：${errorInfo.detail}`
      }
    }
  }

  async sendMessage(apiKey, messages) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`.trim()
      },
      body: JSON.stringify({
        model: this.defaultModel,
        messages: messages.map(msg => ({
          role: msg.role === 'system' ? 'system' : 
               msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `服务器返回错误：${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  getErrorMessage(error) {
    const message = error.toLowerCase()
    
    if (message.includes('insufficient balance') || message.includes('insufficient_quota')) {
      return {
        title: '账户余额不足',
        detail: '您的 DeepSeek 账户余额已不足，无法继续使用 API 服务。'
      }
    }
    
    if (message.includes('invalid api key') || message.includes('invalid_api_key')) {
      return {
        title: 'API Key 无效',
        detail: '您输入的 DeepSeek API Key 格式错误或已失效。'
      }
    }
    
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return {
        title: '请求频率超限',
        detail: '您的 API 调用次数已达到限制，请稍后再试。'
      }
    }
    
    return {
      title: '发生未知错误',
      detail: `系统返回错误：${error}`
    }
  }

  getConfig() {
    return {
      name: 'DeepSeek',
      icon: 'circle-plus',
      keyPlaceholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxx',
      keyPrefix: 'sk-',
      apiKeyLink: 'https://platform.deepseek.com/',
      model: this.defaultModel,
      modelName: 'DeepSeek Chat'
    }
  }
} 