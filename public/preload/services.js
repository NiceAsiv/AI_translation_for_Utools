const fs = require('node:fs')
const path = require('node:path')

// 配置存储的键名
const CONFIG_KEY = 'ai-translate-config'
const BASE_CONFIG_KEY = 'ai-translate-base-config' // 基础配置(不加密)

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

// 获取基础配置(自定义提示词、自定义features等)
function getBaseConfig() {
  try {
    const config = window.utools.dbStorage.getItem(BASE_CONFIG_KEY)
    if (config) {
      return config
    }
  } catch (error) {
    console.error('读取基础配置失败:', error)
  }
  // 返回默认配置
  return {
    customPrompt: '' // 自定义提示词,留空则使用默认提示词
  }
}

// 保存基础配置
function saveBaseConfig(config) {
  try {
    window.utools.dbStorage.setItem(BASE_CONFIG_KEY, config)
    return true
  } catch (error) {
    console.error('保存基础配置失败:', error)
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

  // 获取基础配置
  async getBaseConfig() {
    return getBaseConfig()
  },

  // 保存基础配置
  async saveBaseConfig(config) {
    return saveBaseConfig(config)
  },

  // AI 翻译服务
  async translate({ text, from = 'auto', to = 'zh' }) {
    try {
      const config = getConfig()
      
      // 获取当前活跃的服务商
      const activeProvider = config.providers?.find(p => p.id === config.activeProviderId)      
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

// 默认翻译提示词模板
const DEFAULT_TRANSLATE_PROMPT = 'You are a professional translator. Translate the given text to [目标语言]. Only return the translated text without any explanation.'

// OpenAI API 翻译
async function translateWithOpenAI(provider, text, to) {
  const endpoint = provider.endpoint + '/chat/completions'
  
  // OpenAI API 使用的语言映射
  const languageMap = {
    zh: '中文',
    'zh-cn': '中文',
    'zh-tw': '繁体中文',
    en: 'English',
    ja: '日本語',
    ko: '한국어',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    ru: 'Русский',
    pt: 'Português',
    it: 'Italiano',
    ar: 'العربية',
    th: 'ไทย',
    vi: 'Tiếng Việt'
  }
  
  // 通义千问翻译模型使用的语言代码映射
  const qwenLanguageMap = {
    zh: 'zh',
    'zh-cn': 'zh',
    'zh-tw': 'zh-TW',
    en: 'en',
    ja: 'ja',
    ko: 'ko',
    fr: 'fr',
    de: 'de',
    es: 'es',
    ru: 'ru',
    pt: 'pt',
    it: 'it',
    ar: 'ar',
    th: 'th',
    vi: 'vi'
  }

  // 检查是否是通义千问的翻译模型(qwen-mt-*)
  const isQwenMT = provider.model && provider.model.startsWith('qwen-mt')
  
  // 获取基础配置中的自定义提示词
  const baseConfig = getBaseConfig()
  const customPrompt = baseConfig.customPrompt || ''
  
  // 构建请求体
  let requestBody = {
    model: provider.model
  }

  if (isQwenMT) {
    // 通义千问机器翻译模型使用特殊格式
    // 使用通义千问专用的语言代码映射
    const targetLangCode = qwenLanguageMap[to] || to
    
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
        target_lang: targetLangCode
      }
    }
    console.log('通义千问翻译请求:', requestBody)
  } else {
    // 标准 OpenAI 格式
    // 获取自定义提示词
    let systemPrompt = customPrompt.trim()
    
    // 如果没有自定义提示词,使用默认提示词模板
    if (!systemPrompt) {
      systemPrompt = DEFAULT_TRANSLATE_PROMPT
    }
    
    // 替换提示词中的 [目标语言] 占位符
    systemPrompt = systemPrompt.replace(/\[目标语言\]/g, languageMap[to] || to)
    
    requestBody = {
      model: provider.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
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


