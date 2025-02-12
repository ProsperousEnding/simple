import { DeepSeekProvider } from './DeepSeekProvider'
import { OpenAIProvider } from './OpenAIProvider'

export const providers = {
  deepseek: new DeepSeekProvider(),
  openai: new OpenAIProvider()
}

export function getProvider(type) {
  const provider = providers[type]
  if (!provider) {
    throw new Error(`未知的 AI 提供商类型: ${type}`)
  }
  return provider
}

export const providersList = Object.entries(providers).map(([key, provider]) => ({
  key,
  ...provider.getConfig()
})) 