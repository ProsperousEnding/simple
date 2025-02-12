<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import { getProvider, providersList } from './providers'

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {}
    }
    return code
  }
})

const userInput = ref('')
const chatHistory = ref([])
const loading = ref(false)
const chatContainer = ref(null)
const apiKey = ref('')
const deepseekApiKey = ref('')
const openaiApiKey = ref('')
const showTokenInput = ref(false)
const apiTestLoading = ref(false)
const apiTestResult = ref(null)
const isConnected = ref(false)
const showSettings = ref(false)
const apiProvider = ref('deepseek')
const currentProvider = ref('deepseek')
const provider = computed(() => getProvider(currentProvider.value))

// 在组件加载时检查本地存储中的 API key 和历史记录
onMounted(() => {
  const savedDeepseekKey = localStorage.getItem('deepseek_api_key')
  const savedOpenaiKey = localStorage.getItem('openai_api_key')
  const savedHistory = localStorage.getItem('chat_history')
  
  if (savedHistory) {
    chatHistory.value = JSON.parse(savedHistory)
  }
  
  deepseekApiKey.value = savedDeepseekKey || ''
  openaiApiKey.value = savedOpenaiKey || ''
  apiKey.value = apiProvider.value === 'deepseek' ? deepseekApiKey.value : openaiApiKey.value
  
  if (apiKey.value) {
    testAPI(apiKey.value).then(result => {
      if (result.success) {
        isConnected.value = true
      } else {
        apiKey.value = ''
        isConnected.value = false
      }
    })
  }

  if (chatHistory.value.length === 0) {
    chatHistory.value.push({
      role: 'assistant',
      content: `你好！我是一个智能 AI 助手。我可以：\n\n` +
               '1. 回答问题和提供建议\n' +
               '2. 帮助编写和优化代码\n' +
               '3. 解释技术概念\n' +
               '4. 协助文档编写\n\n' +
               '让我们开始对话吧！'
    })
  }
})

// 测试 API 连接
async function testAPI(key) {
  return await provider.value.testConnection(key)
}

// 保存历史记录
function saveHistory() {
  localStorage.setItem('chat_history', JSON.stringify(chatHistory.value))
}

// 处理 API 错误信息转换为中文
function getChineseErrorMessage(error) {
  const message = error.toLowerCase()
  
  // DeepSeek 的错误信息处理
  if (apiProvider.value === 'deepseek') {
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
  }
  
  // OpenAI 的错误信息处理
  if (apiProvider.value === 'openai') {
    if (message.includes('exceeded your current quota') || message.includes('billing/quota exceeded')) {
      return {
        title: '账户额度超限',
        detail: '您的 OpenAI 账户额度已用尽或超出限制。'
      }
    }
    
    if (message.includes('invalid api key') || message.includes('incorrect api key')) {
      return {
        title: 'API Key 无效',
        detail: '您输入的 OpenAI API Key 格式错误或已失效。'
      }
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

// 保存 API Key
async function saveApiKey() {
  const currentKey = apiKey.value.trim()
  
  if (currentKey) {
    apiTestLoading.value = true
    apiTestResult.value = null
    try {
      const testResult = await testAPI(currentKey)
      apiTestResult.value = testResult
      
      // 只有在测试成功时才保存 API Key
      // 对于 DeepSeek，余额不足也允许进入
      if (testResult.success || 
         (apiProvider.value === 'deepseek' && testResult.message.includes('账户余额不足'))) {
        setTimeout(() => {
          if (apiProvider.value === 'deepseek') {
            localStorage.setItem('deepseek_api_key', currentKey)
            deepseekApiKey.value = currentKey
          } else {
            localStorage.setItem('openai_api_key', currentKey)
            openaiApiKey.value = currentKey
          }
          
          showTokenInput.value = false
          isConnected.value = true
          
          if (chatHistory.value.length === 0) {
            chatHistory.value.push({
              role: 'assistant',
              content: `你好！我是一个智能 AI 助手。我可以：\n\n` +
                       '1. 回答问题和提供建议\n' +
                       '2. 帮助编写和优化代码\n' +
                       '3. 解释技术概念\n' +
                       '4. 协助文档编写\n\n' +
                       '让我们开始对话吧！'
            })
          }
          
          saveHistory()
        }, 1000)
      }
    } catch (error) {
      console.error('API 测试失败:', error)
      apiTestResult.value = {
        success: false,
        message: error.message
      }
    } finally {
      apiTestLoading.value = false
    }
  }
}

// 删除 API key
function deleteApiKey() {
  if (!confirm('确定要断开连接吗？断开后历史记录将会保留。')) {
    return
  }
  
  if (apiProvider.value === 'deepseek') {
    localStorage.removeItem('deepseek_api_key')
    deepseekApiKey.value = ''
  } else {
    localStorage.removeItem('openai_api_key')
    openaiApiKey.value = ''
  }
  
  apiKey.value = ''
  isConnected.value = false
  chatHistory.value.push({
    role: 'system',
    content: '已断开连接。您可以点击"连接 API"按钮重新连接。\n\n您的历史记录已保存，重新连接后可以继续对话。'
  })
  saveHistory()
}

// 滚动到底部
async function scrollToBottom() {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// 复制文本到剪贴板
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 渲染 Markdown
function renderMarkdown(content) {
  return marked(content)
}

async function handleSubmit() {
  if (!userInput.value.trim()) return
  if (!isConnected.value) {
    showTokenInput.value = true
    return
  }
  
  const userMessage = userInput.value
  chatHistory.value.push({
    role: 'user',
    content: userMessage
  })
  
  userInput.value = ''
  loading.value = true
  
  await scrollToBottom()
  saveHistory()
  
  try {
    const assistantMessage = await provider.value.sendMessage(apiKey.value, chatHistory.value)
    chatHistory.value.push({
      role: 'assistant',
      content: assistantMessage
    })
    saveHistory()
    await scrollToBottom()
  } catch (error) {
    console.error('Chat error:', error)
    const errorInfo = provider.value.getErrorMessage(error.message)
    chatHistory.value.push({
      role: 'system',
      content: `### ❌ ${errorInfo.title}\n\n**详细信息：**\n${errorInfo.detail}`
    })
    saveHistory()
  } finally {
    loading.value = false
  }
}

// 处理回车键
function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}

// 清空对话历史
function clearChat() {
  chatHistory.value = [{
    role: 'assistant',
    content: '对话已清空。有什么我可以帮你的吗？'
  }]
  saveHistory()
}

// 切换服务提供商
function switchProvider(type) {
  currentProvider.value = type
  apiTestResult.value = null
  // 切换时使用对应服务商已保存的 key
  const savedKey = localStorage.getItem(`${type}_api_key`)
  apiKey.value = savedKey || ''
  isConnected.value = !!apiKey.value
  showTokenInput.value = !apiKey.value
}
</script>

<template>
  <div class="chat-page">
    <!-- API Key 配置弹窗 -->
    <div v-if="showTokenInput" class="token-modal" @click.self="showTokenInput = false">
      <div class="token-modal-content">
        <button class="close-button" @click="showTokenInput = false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="token-header">
          <h3>设置 API Key</h3>
          <p class="token-desc">请输入 {{ provider.getConfig().name }} API Key 以开始对话</p>
          <p class="model-info">当前使用模型: {{ provider.getConfig().modelName }}</p>
        </div>
        <div class="token-input-group">
          <input
            v-model="apiKey"
            type="password"
            :placeholder="provider.getConfig().keyPlaceholder"
            class="token-input"
            @keydown.enter="saveApiKey"
            :disabled="apiTestLoading"
          />
          <button 
            @click="saveApiKey" 
            class="token-button"
            :disabled="apiTestLoading || !apiKey.trim()"
          >
            <template v-if="apiTestLoading">
              <svg class="loading-spinner" viewBox="0 0 24 24">
                <circle class="spinner-circle" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" />
              </svg>
              测试中...
            </template>
            <template v-else>
              确认
            </template>
          </button>
        </div>
        
        <!-- API测试结果提示 -->
        <transition name="fade">
          <div v-if="apiTestResult" :class="['test-result', apiTestResult.success ? 'success' : 'error']">
            <svg v-if="apiTestResult.success" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span>{{ apiTestResult.message }}</span>
          </div>
        </transition>

        <div class="token-tip">
          <a :href="provider.getConfig().apiKeyLink" target="_blank" class="link">
            还没有 {{ provider.getConfig().name }} API Key？点击获取 →
          </a>
        </div>
      </div>
    </div>

    <!-- 聊天容器 -->
    <div class="chat-container" ref="chatContainer">
      <div class="messages-wrapper">
        <!-- 未连接状态显示欢迎界面 -->
        <template v-if="!isConnected">
          <div class="welcome-state">
            <div class="welcome-content">
              <h2>欢迎使用 AI 助手</h2>
              <p>请选择 AI 服务提供商</p>
              
              <div class="provider-selector">
                <button 
                  v-for="item in providersList"
                  :key="item.key"
                  class="provider-btn"
                  :class="{ active: currentProvider === item.key }"
                  @click="switchProvider(item.key)"
                >
                  <svg-icon :name="item.icon" />
                  {{ item.name }}
                </button>
              </div>

              <button @click="showTokenInput = true" class="connect-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h14v4" />
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                  <path d="M18 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
                </svg>
                连接 API
              </button>

              <div class="welcome-tips">
                <div class="tip-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  <span>强大的 AI 对话能力</span>
                </div>
                <div class="tip-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  <span>专业的代码理解与生成</span>
                </div>
                <div class="tip-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span>支持联网信息搜索</span>
                </div>
              </div>
            </div>
          </div>
        </template>
        
        <!-- 已连接状态显示对话界面 -->
        <template v-else>
          <template v-if="chatHistory.length === 0">
            <div class="empty-state">
              <h2>开始对话</h2>
              <p>我是一个智能 AI 助手，让我们开始对话吧</p>
            </div>
          </template>
          <template v-else>
            <div v-for="(message, index) in chatHistory" 
                 :key="index"
                 :class="['message-item', message.role]">
              <div class="message-content">
                <div class="message-header">
                  <span class="avatar">
                    <template v-if="message.role === 'assistant'">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4M12 8h.01"/>
                      </svg>
                    </template>
                    <template v-else-if="message.role === 'user'">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </template>
                    <template v-else>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>
                    </template>
                  </span>
                  <span class="role-name">
                    {{ message.role === 'assistant' ? 'AI 助手' : 
                       message.role === 'user' ? '我' : '系统' }}
                  </span>
                  <button 
                    v-if="message.role !== 'system'"
                    @click="copyToClipboard(message.content)" 
                    class="copy-button"
                    title="复制内容">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
                <div 
                  class="message-bubble"
                  v-html="renderMarkdown(message.content)"
                ></div>
              </div>
            </div>
          </template>
          
          <div v-if="loading" class="message-item assistant">
            <div class="message-content">
              <div class="message-header">
                <span class="avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </span>
                <span class="role-name">AI 助手</span>
              </div>
              <div class="message-bubble loading">
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div v-if="isConnected" class="input-container">
      <div class="toolbar">
        <div class="action-group">
          <button 
            class="clear-btn"
            @click="clearChat"
            title="清空对话"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
          <button 
            @click="deleteApiKey" 
            class="disconnect-btn"
            title="断开连接"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
              <line x1="12" y1="2" x2="12" y2="12"></line>
            </svg>
            <span>断开连接</span>
          </button>
        </div>
      </div>

      <div class="input-area">
        <textarea
          v-model="userInput"
          rows="1"
          placeholder="输入消息，Enter 发送，Shift + Enter 换行"
          :disabled="loading"
          @keydown="handleKeydown"
          class="chat-input"
        />
        <div class="action-buttons">
          <button 
            @click="handleSubmit" 
            :disabled="loading || !userInput.trim()"
            class="send-button"
            title="发送消息"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m22 2-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 4rem);
  background: linear-gradient(to bottom, #ffffff, #f9fafb);
}

.token-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.token-modal-content {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 28rem;
  margin: 0 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #f3f4f6;
}

.token-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.token-header h3 {
  font-size: 1.125rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.token-desc {
  font-size: 0.875rem;
  color: #6b7280;
}

.token-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.token-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.token-input:focus {
  outline: none;
  ring: 2px solid #3b82f6;
  border-color: transparent;
}

.token-button {
  padding: 0.75rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.token-button:hover {
  background-color: #2563eb;
}

.token-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.token-tip {
  font-size: 0.875rem;
  text-align: center;
  color: #6b7280;
}

.link {
  color: #3b82f6;
  transition: color 0.2s;
}

.link:hover {
  color: #2563eb;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
}

.messages-wrapper {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 6rem 1rem;
  text-align: center;
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  max-width: 28rem;
}

.message-item {
  width: 100%;
  padding: 1rem 0;
  transition: background-color 0.2s;
}

.message-item.user {
  background-color: rgba(249, 250, 251, 0.8);
}

.message-item.assistant {
  background-color: rgba(255, 255, 255, 0.8);
}

.message-item.system {
  background-color: rgba(254, 242, 242, 0.8);
  border-left: 4px solid #dc2626;
  padding: 1rem;
}

.message-item.system .message-bubble {
  color: #991b1b;
  font-size: 0.875rem;
  line-height: 1.5;
}

.message-item.system .message-bubble :deep(h3) {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
}

.message-item.system .message-bubble :deep(strong) {
  display: block;
  margin-top: 1rem;
  color: #991b1b;
}

.message-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  overflow: hidden;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar svg {
  width: 1rem;
  height: 1rem;
}

.role-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.copy-button {
  margin-left: auto;
  padding: 0.375rem;
  color: #9ca3af;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.copy-button:hover {
  color: #6b7280;
  background-color: #f3f4f6;
}

.message-bubble {
  color: #111827;
  line-height: 1.625;
  font-size: 0.9375rem;
  padding-left: 2rem;
}

.message-bubble :deep(pre) {
  margin: 1rem 0;
  padding: 1rem;
  background-color: #1f2937;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.message-bubble :deep(code) {
  font-family: ui-monospace, monospace;
  font-size: 0.875rem;
}

.message-bubble :deep(p) {
  margin: 0.5rem 0;
}

.message-bubble :deep(ul),
.message-bubble :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.message-bubble :deep(li) {
  margin: 0.25rem 0;
}

.message-bubble :deep(a) {
  color: #3b82f6;
  transition: color 0.2s;
}

.message-bubble :deep(a):hover {
  color: #2563eb;
}

.message-bubble.loading {
  display: flex;
  align-items: center;
  height: 1.5rem;
}

.typing-indicator {
  display: flex;
  gap: 0.25rem;
}

.typing-indicator span {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background-color: #9ca3af;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.input-container {
  position: sticky;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-top: 1px solid #f3f4f6;
  padding: 0.75rem 0;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
  margin-bottom: 0.5rem;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-btn {
  color: #9ca3af;
}

.clear-btn:hover {
  color: #6b7280;
  background-color: #f3f4f6;
}

.disconnect-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  color: #dc2626;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  background-color: #fee2e2;
}

.disconnect-btn:hover {
  color: #b91c1c;
  background-color: #fecaca;
}

:root.dark .disconnect-btn {
  color: #ef4444;
  background-color: rgba(153, 27, 27, 0.2);
}

:root.dark .disconnect-btn:hover {
  color: #dc2626;
  background-color: rgba(153, 27, 27, 0.3);
}

.input-area {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.chat-input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 6rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  resize: none;
  background-color: white;
  min-height: 44px;
  max-height: 200px;
  font-size: 0.9375rem;
  line-height: 1.5;
  transition: all 0.2s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.chat-input:focus {
  outline: none;
  ring: 2px solid #3b82f6;
  border-color: transparent;
}

.action-buttons {
  position: absolute;
  right: 1.5rem;
  bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.send-button {
  padding: 0.375rem;
  color: #9ca3af;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.send-button:hover {
  color: #6b7280;
  background-color: #f3f4f6;
}

.send-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 暗色模式 */
:root.dark .chat-page {
  background: linear-gradient(to bottom, #111827, #030712);
}

:root.dark .message-item.user {
  background-color: rgba(31, 41, 55, 0.3);
}

:root.dark .message-item.assistant {
  background-color: rgba(17, 24, 39, 0.3);
}

:root.dark .message-item.system {
  background-color: rgba(127, 29, 29, 0.2);
}

:root.dark .message-bubble {
  color: #e5e7eb;
}

:root.dark .role-name {
  color: #9ca3af;
}

:root.dark .input-container {
  background-color: rgba(17, 24, 39, 0.8);
  border-color: #374151;
}

:root.dark .chat-input {
  background-color: #1f2937;
  border-color: #374151;
  color: #e5e7eb;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  animation: spin 1s linear infinite;
}

.spinner-circle {
  stroke-dasharray: 60;
  stroke-dashoffset: 50;
  transform-origin: center;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem;
  color: #6b7280;
  border-radius: 0.375rem;
  transition: all 0.2s;
  line-height: 0;
}

.close-button:hover {
  color: #374151;
  background-color: #f3f4f6;
}

:root.dark .close-button {
  color: #9ca3af;
}

:root.dark .close-button:hover {
  color: #e5e7eb;
  background-color: #374151;
}

.test-result {
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.test-result.success {
  background-color: #dcfce7;
  color: #166534;
}

.test-result.error {
  background-color: #fee2e2;
  color: #991b1b;
}

:root.dark .test-result.success {
  background-color: rgba(22, 101, 52, 0.2);
  color: #86efac;
}

:root.dark .test-result.error {
  background-color: rgba(153, 27, 27, 0.2);
  color: #fca5a5;
}

.status-dot.disconnected {
  background-color: #ef4444;
}

.api-reconnect {
  font-size: 0.875rem;
  color: #3b82f6;
  transition: color 0.2s;
}

.api-reconnect:hover {
  color: #2563eb;
}

:root.dark .api-reconnect {
  color: #60a5fa;
}

:root.dark .api-reconnect:hover {
  color: #93c5fd;
}

.welcome-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 2rem;
}

.welcome-content {
  text-align: center;
  max-width: 32rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.welcome-content h2 {
  font-size: 1.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.welcome-content p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.connect-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.connect-button:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.welcome-tips {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0.5rem;
  color: #4b5563;
}

.tip-item svg {
  color: #3b82f6;
}

/* 暗色模式适配 */
:root.dark .welcome-content {
  background: rgba(17, 24, 39, 0.8);
}

:root.dark .welcome-content h2 {
  color: #f3f4f6;
}

:root.dark .welcome-content p {
  color: #9ca3af;
}

:root.dark .tip-item {
  background: rgba(31, 41, 55, 0.5);
  color: #d1d5db;
}

:root.dark .tip-item svg {
  color: #60a5fa;
}

.provider-selector {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.provider-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: #4b5563;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
}

.provider-btn:hover {
  background-color: #f9fafb;
  transform: translateY(-1px);
}

.provider-btn.active {
  background-color: #3b82f6;
  color: white;
  border-color: transparent;
}

.provider-btn.active:hover {
  background-color: #2563eb;
}

:root.dark .provider-btn {
  background-color: #1f2937;
  border-color: #374151;
  color: #e5e7eb;
}

:root.dark .provider-btn:hover {
  background-color: #374151;
}

:root.dark .provider-btn.active {
  background-color: #3b82f6;
  color: white;
}

.model-info {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

:root.dark .model-info {
  color: #9ca3af;
}
</style> 