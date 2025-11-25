import { useState, useEffect, useRef } from 'react'
import {
  Box,
  TextField,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  Chip,
  Button,
  CircularProgress,
  Paper,
  Divider,
  Typography,
  Tooltip,
  Fade,
  useTheme,
} from '@mui/material'
import {
  ContentCopy,
  SwapHoriz,
  Settings as SettingsIcon,
  Translate as TranslateIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'

export default function Translate({ enterAction }) {
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('zh')
  const [isTranslating, setIsTranslating] = useState(false)
  const [apiConfig, setApiConfig] = useState({ provider: '未配置', model: '', providers: [], activeProviderId: '' })
  const [forceTargetLang, setForceTargetLang] = useState(null) // 强制指定的目标语言
  const textareaRef = useRef(null)
  const debounceTimerRef = useRef(null)
  const isFirstLoadRef = useRef(true) // 标记是否首次加载
  const theme = useTheme()

  // 智能检测语言并返回目标语言
  const detectLanguage = (text) => {
    if (!text.trim()) return 'zh'

    // 检测中文（包括中日韩统一表意文字）
    const chineseRegex = /[\u4e00-\u9fa5]/
    // 检测日文平假名和片假名
    const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/
    // 检测韩文
    const koreanRegex = /[\uac00-\ud7af]/
    // 检测俄文
    const russianRegex = /[\u0400-\u04ff]/
    // 检测法文特殊字符
    const frenchRegex = /[àâäæçéèêëïîôùûüÿœ]/i
    // 检测德文特殊字符
    const germanRegex = /[äöüß]/i
    // 检测西班牙文特殊字符
    const spanishRegex = /[áéíóúñ¿¡]/i

    if (chineseRegex.test(text)) {
      // 中文 -> 翻译成英文
      return 'en'
    } else if (japaneseRegex.test(text)) {
      // 日文 -> 翻译成中文
      return 'zh'
    } else if (koreanRegex.test(text)) {
      // 韩文 -> 翻译成中文
      return 'zh'
    } else if (russianRegex.test(text)) {
      // 俄文 -> 翻译成中文
      return 'zh'
    } else if (frenchRegex.test(text)) {
      // 法文 -> 翻译成中文
      return 'zh'
    } else if (germanRegex.test(text)) {
      // 德文 -> 翻译成中文
      return 'zh'
    } else if (spanishRegex.test(text)) {
      // 西班牙文 -> 翻译成中文
      return 'zh'
    } else {
      // 默认认为是英文 -> 翻译成中文
      return 'zh'
    }
  }

  // 自动翻译:当输入文本改变时触发
  useEffect(() => {
    // 首次加载时跳过
    if (isFirstLoadRef.current) {
      return
    }

    if (!sourceText.trim()) {
      setTranslatedText('')
      return
    }
    
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    // 如果没有强制指定目标语言，则智能检测语言并设置目标语言
    if (!forceTargetLang) {
      const detectedLang = detectLanguage(sourceText)
      if (detectedLang !== targetLang) {
        setTargetLang(detectedLang)
      }
    }
    
    // 设置新的防抖定时器(500ms)
    debounceTimerRef.current = setTimeout(() => {
      handleTranslate()
    }, 500)
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [sourceText])

  useEffect(() => {
    // 加载API配置
    loadApiConfig()
    
    // 获取进入插件时的文本
    if (enterAction?.payload) {
      const text = typeof enterAction.payload === 'string' 
        ? enterAction.payload 
        : enterAction.payload.text || ''
      
      // 检查是否是特定的翻译指令
      const code = enterAction.code || ''
      
      if (code === 'translateToChinese') {
        // 翻译成中文模式
        setForceTargetLang('zh')
        setTargetLang('zh')
        setSourceText(text)
        if (text.trim()) {
          setTimeout(() => handleTranslate(text), 150)
        }
      } else if (code === 'translateToEnglish') {
        // 翻译成英文模式
        setForceTargetLang('en')
        setTargetLang('en')
        setSourceText(text)
        if (text.trim()) {
          setTimeout(() => handleTranslate(text), 150)
        }
      } else if (text.trim() && text.trim() !== '翻译') {
        // 普通翻译模式：智能检测
        setForceTargetLang(null)
        const detectedLang = detectLanguage(text)
        setTargetLang(detectedLang)
        setSourceText(text)
        setTimeout(() => handleTranslate(text), 150)
      } else {
        // 清空输入和翻译结果
        setForceTargetLang(null)
        setSourceText('')
        setTranslatedText('')
      }
    } else {
      // 如果没有 payload，也清空
      setForceTargetLang(null)
      setSourceText('')
      setTranslatedText('')
    }
    
    // 标记首次加载完成
    setTimeout(() => {
      isFirstLoadRef.current = false
    }, 200)
    
    // 聚焦输入框
    textareaRef.current?.focus()
  }, [enterAction])

  const loadApiConfig = async () => {
    const config = await window.services.getConfig()
    if (config && config.providers && config.activeProviderId) {
      const activeProvider = config.providers.find(p => p.id === config.activeProviderId)
      if (activeProvider) {
        setApiConfig({
          provider: activeProvider.name || '未配置',
          model: activeProvider.model || '',
          providers: config.providers || [],
          activeProviderId: config.activeProviderId
        })
      }
    } else {
      setApiConfig({
        provider: '未配置',
        model: '',
        providers: [],
        activeProviderId: ''
      })
    }
  }

  const handleOpenSettings = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('Settings button clicked')
    if (window.navigateToSettings) {
      window.navigateToSettings()
    } else {
      console.error('window.navigateToSettings is not defined!')
    }
  }

  const handleTranslate = async (text = sourceText) => {
    if (!text.trim()) return

    setIsTranslating(true)
    setTranslatedText('')

    try {
      console.log('开始翻译:', { text, from: sourceLang, to: targetLang })
      const result = await window.services.translate({
        text: text,
        from: sourceLang,
        to: targetLang
      })
      console.log('翻译结果:', result)
      
      if (result.success) {
        setTranslatedText(result.translatedText)
        if (result.detectedLang && sourceLang === 'auto') {
          setSourceLang(result.detectedLang)
        }
      } else {
        setTranslatedText('翻译失败: ' + (result.error || '未知错误'))
      }
    } catch (error) {
      setTranslatedText('翻译失败: ' + error.message)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return
    
    const temp = sourceLang
    setSourceLang(targetLang)
    setTargetLang(temp)
    
    setSourceText(translatedText)
    setTranslatedText(sourceText)
  }

  const handleCopyResult = async () => {
    if (!translatedText) return
    
    try {
      await navigator.clipboard.writeText(translatedText)
      window.utools.showNotification('已复制到剪贴板')
    } catch (error) {
      window.utools.showNotification('复制失败')
    }
  }

  const handleProviderChange = async (providerId) => {
    const config = await window.services.getConfig()
    if (config) {
      config.activeProviderId = providerId
      await window.services.setConfig(config)
      await loadApiConfig()
      // 如果有文本，重新翻译
      if (sourceText.trim()) {
        handleTranslate()
      }
    }
  }

  const languages = [
    { value: 'auto', label: '检测语言' },
    { value: 'zh', label: '中文' },
    { value: 'en', label: '英语' },
    { value: 'ja', label: '日语' },
    { value: 'ko', label: '韩语' },
    { value: 'fr', label: '法语' },
    { value: 'de', label: '德语' },
    { value: 'es', label: '西班牙语' },
    { value: 'ru', label: '俄语' },
  ]

  return (
    <Box className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-2.5 font-sf-pro">
      {/* 顶部工具栏 - 更紧凑 */}
      <Box className="flex justify-between items-center mb-2.5 px-0.5">
        <Box className="flex items-center gap-1.5">
          {apiConfig.providers && apiConfig.providers.length > 0 ? (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={apiConfig.activeProviderId}
                onChange={(e) => handleProviderChange(e.target.value)}
                sx={{
                  bgcolor: 'rgba(0, 122, 255, 0.1)',
                  color: '#007aff',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  height: '28px',
                  '& .MuiSelect-select': {
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    paddingLeft: '10px',
                    paddingRight: '28px !important',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(0, 122, 255, 0.15)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#007aff',
                    fontSize: '18px',
                  },
                }}
              >
                {apiConfig.providers.map((provider) => (
                  <MenuItem 
                    key={provider.id} 
                    value={provider.id}
                    sx={{ 
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    {provider.name} {provider.model && `· ${provider.model}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Chip
              icon={<TranslateIcon sx={{ fontSize: 14 }} />}
              label={apiConfig.provider}
              size="small"
              sx={{
                bgcolor: 'rgba(0, 122, 255, 0.1)',
                color: '#007aff',
                fontWeight: 600,
                fontSize: '12px',
                height: '24px',
                '& .MuiChip-icon': {
                  color: '#007aff',
                  marginLeft: '6px',
                },
                '& .MuiChip-label': {
                  paddingLeft: '6px',
                  paddingRight: '8px',
                },
              }}
            />
          )}
          
          {/* 显示翻译模式提示 */}
          {forceTargetLang && (
            <Chip
              label={forceTargetLang === 'zh' ? '固定译为中文' : '固定译为英文'}
              size="small"
              sx={{
                bgcolor: 'rgba(94, 92, 230, 0.1)',
                color: '#5e5ce6',
                fontWeight: 500,
                fontSize: '11px',
                height: '22px',
                '& .MuiChip-label': {
                  paddingLeft: '8px',
                  paddingRight: '8px',
                },
              }}
            />
          )}
        </Box>
        <Tooltip title="设置" placement="left">
          <IconButton
            onClick={handleOpenSettings}
            size="small"
            sx={{
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              color: '#86868b',
              width: 28,
              height: 28,
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.08)',
                color: '#1d1d1f',
              },
            }}
          >
            <SettingsIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 主翻译卡片 - 更紧凑 */}
      <Paper
        elevation={0}
        className="overflow-hidden"
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '14px',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)',
          height: 'calc(100vh - 70px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 语言选择栏 - 更紧凑 */}
        <Box className="flex items-center gap-1.5 p-2.5 bg-gray-50/50" sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <FormControl size="small" sx={{ flex: 1 }}>
            <Select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              sx={{
                bgcolor: 'white',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                height: '32px',
                '& .MuiSelect-select': {
                  paddingTop: '6px',
                  paddingBottom: '6px',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.12)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 122, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#007aff',
                  borderWidth: '1px',
                },
              }}
            >
              {languages.map((lang) => (
                <MenuItem key={lang.value} value={lang.value} sx={{ fontSize: '13px' }}>
                  {lang.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title={sourceLang === 'auto' ? '无法交换语言' : '交换语言'}>
            <span>
              <IconButton
                onClick={handleSwapLanguages}
                disabled={sourceLang === 'auto'}
                size="small"
                sx={{
                  bgcolor: 'white',
                  width: 32,
                  height: 32,
                  color: sourceLang === 'auto' ? '#d1d1d6' : '#86868b',
                  '&:hover': {
                    bgcolor: sourceLang === 'auto' ? 'white' : '#007aff',
                    color: sourceLang === 'auto' ? '#d1d1d6' : 'white',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'white',
                    color: '#d1d1d6',
                  },
                }}
              >
                <SwapHoriz sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>

          <FormControl size="small" sx={{ flex: 1 }}>
            <Select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              sx={{
                bgcolor: 'white',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                height: '32px',
                '& .MuiSelect-select': {
                  paddingTop: '6px',
                  paddingBottom: '6px',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.12)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 122, 255, 0.5)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#007aff',
                  borderWidth: '1px',
                },
              }}
            >
              {languages.filter(l => l.value !== 'auto').map((lang) => (
                <MenuItem key={lang.value} value={lang.value} sx={{ fontSize: '13px' }}>
                  {lang.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* 翻译区域 */}
        <Box className="flex flex-1 min-h-0">
          {/* 输入侧 */}
          <Box className="flex-1 flex flex-col min-w-0">
            <TextField
              inputRef={textareaRef}
              multiline
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="输入文字"
              variant="outlined"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  padding: 0,
                  fontSize: '14px',
                  lineHeight: 1.6,
                  fontFamily: 'inherit',
                  '& fieldset': {
                    border: 'none',
                  },
                  '& textarea': {
                    padding: '12px 14px',
                    '&::placeholder': {
                      color: '#86868b',
                      opacity: 1,
                    },
                  },
                },
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleTranslate()
                }
              }}
            />
            <Box className="px-3.5 py-2 flex items-center justify-between" sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#86868b',
                  fontSize: '10px',
                  fontWeight: 500,
                }}
              >
                {sourceText.length} / 5000
              </Typography>
              {sourceText && (
                <Tooltip title="清空">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSourceText('')
                      setTranslatedText('')
                    }}
                    sx={{
                      color: '#86868b',
                      width: 24,
                      height: 24,
                      '&:hover': {
                        color: '#ff3b30',
                        bgcolor: 'rgba(255, 59, 48, 0.1)',
                      },
                    }}
                  >
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* 分隔线 */}
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(0, 0, 0, 0.12)' }} />

          {/* 输出侧 */}
          <Box className="flex-1 flex flex-col min-w-0 bg-gray-50/30">
            <Box className="flex-1 p-3.5 overflow-y-auto">
              {isTranslating ? (
                <Box className="flex flex-col items-center justify-center h-full gap-2">
                  <CircularProgress size={20} sx={{ color: '#007aff' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#86868b',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    翻译中...
                  </Typography>
                </Box>
              ) : translatedText ? (
                <Fade in timeout={300}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: '#1d1d1f',
                      fontFamily: 'inherit',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {translatedText}
                  </Typography>
                </Fade>
              ) : null}
            </Box>
            {translatedText && (
              <Box className="px-3.5 py-2 flex items-center justify-end" sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                <Button
                  size="small"
                  startIcon={<ContentCopy sx={{ fontSize: 14 }} />}
                  onClick={handleCopyResult}
                  sx={{
                    bgcolor: '#007aff',
                    color: 'white',
                    textTransform: 'none',
                    borderRadius: '12px',
                    px: 1.5,
                    py: 0.5,
                    fontSize: '12px',
                    fontWeight: 500,
                    minHeight: '28px',
                    '&:hover': {
                      bgcolor: '#0066d6',
                    },
                    '&:active': {
                      transform: 'scale(0.96)',
                    },
                    '& .MuiButton-startIcon': {
                      marginRight: '4px',
                    },
                  }}
                >
                  复制
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
