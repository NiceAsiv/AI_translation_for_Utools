const fs = require('node:fs')
const path = require('node:path')

// 配置存储的键名
const CONFIG_KEY = 'ai-translate-config'

// 获取配置
function getConfig() {
  try {
    const config = window.utools.dbCryptoStorage.getItem(CONFIG_KEY)
    if (config) {
      // 如果是新格式(包含providers数组),直接返回
      if (config.providers && Array.isArray(config.providers)) {
        return config
      }
      // 如果是旧格式,转换为新格式
      if (config.apiProvider) {
        return {
          providers: [{
            id: 'openai-default',
            name: 'OpenAI',
            endpoint: 'https://api.openai.com/v1',
            apiKey: config.apiKey || '',
            model: config.model || 'gpt-4o-mini',
            isDefault: true,
            enabled: true
          }],
          activeProviderId: 'openai-default'
        }
      }
    }
  } catch (error) {
    console.error('读取配置失败:', error)
  }
  // 返回默认配置
  return {
    providers: [{
      id: 'openai-default',
      name: 'OpenAI',
      endpoint: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o-mini',
      isDefault: true,
      enabled: true
    }],
    activeProviderId: 'openai-default'
  }
}

// 保存配置
function saveConfig(config) {
  try {
    window.utools.dbCryptoStorage.setItem(CONFIG_KEY, config)
    return true
  } catch (error) {
    console.error('保存配置失败:', error)
    throw error
  }
}

// API 端点映射
// 通过 window 对象向渲染进程注入 nodejs 能力
window.services = {
  // 获取配置
  async getConfig() {
    return getConfig()
  },

  // 保存配置
  async saveConfig(config) {
    return saveConfig(config)
  },

  // AI 翻译服务
  async translate({ text, from = 'auto', to = 'zh' }) {
    try {
      const config = getConfig()
      console.log('获取配置:', config)
      
      // 获取当前活跃的服务商
      const activeProvider = config.providers?.find(p => p.id === config.activeProviderId)
      console.log('当前活动的服务商:', activeProvider)
      
      if (!activeProvider) {
        return {
          success: false,
          error: '请先在设置中配置API服务商'
        }
      }
      
      if (!activeProvider.apiKey) {
        return {
          success: false,
          error: '请先在设置中配置 API Key'
        }
      }

      // 调用 OpenAI 格式的 API
      return await translateWithOpenAI(activeProvider, text, to)
    } catch (error) {
      console.error('翻译失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // 读文件
  readFile (file) {
    return fs.readFileSync(file, { encoding: 'utf-8' })
  },
  // 文本写入到下载目录
  writeTextFile (text) {
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.txt')
    fs.writeFileSync(filePath, text, { encoding: 'utf-8' })
    return filePath
  },
  // 图片写入到下载目录
  writeImageFile (base64Url) {
    const matchs = /^data:image\/([a-z]{1,20});base64,/i.exec(base64Url)
    if (!matchs) return
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.' + matchs[1])
    fs.writeFileSync(filePath, base64Url.substring(matchs[0].length), { encoding: 'base64' })
    return filePath
  }
}

// OpenAI API 翻译
async function translateWithOpenAI(provider, text, to) {
  const endpoint = provider.endpoint + '/chat/completions'
  
  const languageMap = {
    zh: '中文',
    en: 'English',
    ja: '日本語',
    ko: '한국어',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    ru: 'Русский'
  }

  // 检查是否是通义千问的翻译模型（qwen-mt-*）
  const isQwenMT = provider.model && provider.model.startsWith('qwen-mt')
  
  // 构建请求体
  let requestBody = {
    model: provider.model
  }

  if (isQwenMT) {
    // 通义千问机器翻译模型使用特殊格式
    // translation_options 需要放在顶层,不是在 extra_body 中
    requestBody = {
      model: provider.model,
      messages: [
        {
          role: 'user',
          content: text
        }
      ],
      translation_options: {
        source_lang: 'auto',
        target_lang: languageMap[to] || to
      }
    }
    console.log('通义千问翻译请求:', requestBody)
  } else {
    // 标准 OpenAI 格式
    requestBody = {
      model: provider.model,
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the given text to ${languageMap[to] || to}. Only return the translated text without any explanation.`
        },
        {
          role: 'user',
          content: text
        }
      ]
    }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify(requestBody)
  })

  const data = await response.json()
  console.log('API响应:', data)
  
  if (data.error) {
    throw new Error(data.error.message || 'API 调用失败')
  }

  if (!data.choices || !data.choices[0]) {
    throw new Error('API返回数据格式错误')
  }

  // 更智能的语言检测
  const detectLanguage = (text) => {
    // 检测中文
    if (/[\u4e00-\u9fa5]/.test(text)) return 'zh'
    // 检测日文
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja'
    // 检测韩文
    if (/[\uac00-\ud7af]/.test(text)) return 'ko'
    // 检测俄文
    if (/[\u0400-\u04ff]/.test(text)) return 'ru'
    // 检测法文
    if (/[àâäæçéèêëïîôùûüÿœ]/i.test(text)) return 'fr'
    // 检测德文
    if (/[äöüß]/i.test(text)) return 'de'
    // 检测西班牙文
    if (/[áéíóúñ¿¡]/i.test(text)) return 'es'
    // 默认英文
    return 'en'
  }

  const detectedLang = detectLanguage(text)

  return {
    success: true,
    translatedText: data.choices[0].message.content.trim(),
    detectedLang
  }
}


