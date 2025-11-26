import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  IconButton,
  Button,
  Paper,
  Typography,
  Tooltip,
  InputAdornment,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Collapse,
  Tabs,
  Tab,
} from '@mui/material'
import {
  ArrowBack,
  Save,
  Visibility,
  VisibilityOff,
  Add,
  Delete,
  CheckCircle,
  RadioButtonUnchecked,
  ExpandMore,
  Info,
  Api,
  ChatBubble,
} from '@mui/icons-material'

export default function Settings() {
  const [providers, setProviders] = useState([])
  const [activeProviderId, setActiveProviderId] = useState('')
  const [showKeys, setShowKeys] = useState({})
  const [saving, setSaving] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  
  // 基础配置状态
  const [customPrompt, setCustomPrompt] = useState('')
  
  // Tab 状态
  const [currentTab, setCurrentTab] = useState(0)

  useEffect(() => {
    loadConfig()
    loadBaseConfig()
  }, [])

  const loadConfig = async () => {
    const savedConfig = await window.services.getConfig()
    console.log('加载的配置:', savedConfig)
    if (savedConfig && savedConfig.providers && savedConfig.providers.length > 0) {
      setProviders(savedConfig.providers)
      setActiveProviderId(savedConfig.activeProviderId || savedConfig.providers[0]?.id)
    } else {
      // 如果没有配置，初始化一个空列表
      setProviders([])
      setActiveProviderId('')
    }
  }

  const loadBaseConfig = async () => {
    const baseConfig = await window.services.getBaseConfig()
    console.log('加载的基础配置:', baseConfig)
    if (baseConfig) {
      setCustomPrompt(baseConfig.customPrompt || '')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // 保存 API 配置
      const configToSave = {
        providers,
        activeProviderId
      }
      console.log('保存配置:', configToSave)
      await window.services.saveConfig(configToSave)
      
      // 保存基础配置
      const baseConfigToSave = {
        customPrompt
      }
      console.log('保存基础配置:', baseConfigToSave)
      await window.services.saveBaseConfig(baseConfigToSave)
      
      window.utools.showNotification('设置已保存')
    } catch (error) {
      console.error('保存失败:', error)
      window.utools.showNotification('保存失败: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (window.navigateToTranslate) {
      window.navigateToTranslate()
    }
  }

  const handleAddProvider = () => {
    const newId = `custom-${Date.now()}`
    const newProvider = {
      id: newId,
      name: '新服务商',
      endpoint: '',
      apiKey: '',
      model: '',
      isDefault: false,
      enabled: true
    }
    setProviders([...providers, newProvider])
    // 如果这是第一个provider，自动设为active
    if (providers.length === 0) {
      setActiveProviderId(newId)
    }
  }

  const handleDeleteProvider = (id) => {
    const newProviders = providers.filter(p => p.id !== id)
    setProviders(newProviders)
    // 如果删除的是当前活动的provider，切换到第一个
    if (activeProviderId === id) {
      setActiveProviderId(newProviders.length > 0 ? newProviders[0].id : '')
    }
  }

  const handleUpdateProvider = (id, field, value) => {
    setProviders(providers.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  const toggleShowKey = (id) => {
    setShowKeys({ ...showKeys, [id]: !showKeys[id] })
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
  }

  return (
    <Box className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-3 font-sf-pro">
      {/* 顶部栏 */}
      <Box className="flex justify-between items-center mb-3">
        <Box className="flex items-center gap-2">
          <Tooltip title="返回">
            <IconButton
              onClick={handleBack}
              size="small"
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' },
              }}
            >
              <ArrowBack sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 600, color: '#1d1d1f' }}>
            设置
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Save sx={{ fontSize: 16 }} />}
          onClick={handleSave}
          disabled={saving}
          sx={{
            bgcolor: '#007aff',
            textTransform: 'none',
            borderRadius: '10px',
            px: 2.5,
            py: 0.75,
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#0066d6',
              boxShadow: 'none',
            },
          }}
        >
          {saving ? '保存中...' : '保存'}
        </Button>
      </Box>

      {/* Tabs 导航 */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '14px',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          mb: 2,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            minHeight: '48px',
            '& .MuiTab-root': {
              minHeight: '48px',
              fontSize: '13px',
              fontWeight: 500,
              textTransform: 'none',
              color: '#86868b',
              '&.Mui-selected': {
                color: '#007aff',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#007aff',
              height: '2px',
            },
          }}
        >
          <Tab icon={<Api sx={{ fontSize: 18 }} />} iconPosition="start" label="API 配置" />
          <Tab icon={<ChatBubble sx={{ fontSize: 18 }} />} iconPosition="start" label="提示词" />
        </Tabs>
      </Paper>

      {/* 主内容区域 */}
      <Box>
        {/* Tab 0: API 配置 */}
        {currentTab === 0 && (
          <Stack spacing={2}>
            {/* 服务商列表 */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '14px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                <Box className="flex justify-between items-center">
                  <Typography variant="subtitle1" sx={{ fontSize: '15px', fontWeight: 600 }}>
                    服务商配置
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Add sx={{ fontSize: 16 }} />}
                    onClick={handleAddProvider}
                    sx={{
                      textTransform: 'none',
                      fontSize: '12px',
                      color: '#007aff',
                      '&:hover': { bgcolor: 'rgba(0, 122, 255, 0.1)' },
                    }}
                  >
                    添加
                  </Button>
                </Box>
              </Box>

              <Stack spacing={0} divider={<Divider />}>
                {providers.map((provider) => (
                  <Accordion
                    key={provider.id}
                    elevation={0}
                    disableGutters
                    sx={{
                      '&:before': { display: 'none' },
                      bgcolor: 'transparent',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        px: 2.5,
                        py: 1,
                        minHeight: '56px',
                        '&.Mui-expanded': {
                          minHeight: '56px',
                          bgcolor: 'rgba(0, 122, 255, 0.04)',
                        },
                      }}
                    >
                      <Box className="flex items-center justify-between w-full" sx={{ mr: 2 }}>
                        <Box className="flex items-center gap-2">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveProviderId(provider.id)
                            }}
                            sx={{
                              color: activeProviderId === provider.id ? '#007aff' : '#d1d1d6',
                              p: 0.5,
                            }}
                          >
                            {activeProviderId === provider.id ? (
                              <CheckCircle sx={{ fontSize: 20 }} />
                            ) : (
                              <RadioButtonUnchecked sx={{ fontSize: 20 }} />
                            )}
                          </IconButton>
                          <Box>
                            <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                              {provider.name}
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: '#86868b' }}>
                              {provider.model || '未设置模型'}
                            </Typography>
                          </Box>
                        </Box>
                        {activeProviderId === provider.id && (
                          <Chip
                            label="当前使用"
                            size="small"
                            sx={{
                              height: '20px',
                              fontSize: '10px',
                              bgcolor: 'rgba(0, 122, 255, 0.1)',
                              color: '#007aff',
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 2.5, py: 2, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                      <Stack spacing={2}>
                        <TextField
                          label="服务商名称"
                          size="small"
                          value={provider.name}
                          onChange={(e) => handleUpdateProvider(provider.id, 'name', e.target.value)}
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: '13px',
                              borderRadius: '8px',
                            },
                          }}
                        />

                        <TextField
                          label="API 端点"
                          size="small"
                          value={provider.endpoint}
                          onChange={(e) => handleUpdateProvider(provider.id, 'endpoint', e.target.value)}
                          placeholder="https://api.openai.com/v1"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: '13px',
                              borderRadius: '8px',
                            },
                          }}
                        />

                        <TextField
                          label="API Key"
                          size="small"
                          type={showKeys[provider.id] ? 'text' : 'password'}
                          value={provider.apiKey}
                          onChange={(e) => handleUpdateProvider(provider.id, 'apiKey', e.target.value)}
                          placeholder="sk-..."
                          fullWidth
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  onClick={() => toggleShowKey(provider.id)}
                                  edge="end"
                                >
                                  {showKeys[provider.id] ? (
                                    <VisibilityOff sx={{ fontSize: 18 }} />
                                  ) : (
                                    <Visibility sx={{ fontSize: 18 }} />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: '13px',
                              borderRadius: '8px',
                            },
                          }}
                        />

                        <TextField
                          label="模型名称"
                          size="small"
                          value={provider.model}
                          onChange={(e) => handleUpdateProvider(provider.id, 'model', e.target.value)}
                          placeholder="gpt-4o-mini"
                          fullWidth
                          helperText="输入模型名称，如：gpt-4o-mini, qwen-mt-flash 等"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: '13px',
                              borderRadius: '8px',
                            },
                            '& .MuiFormHelperText-root': {
                              fontSize: '10px',
                            },
                          }}
                        />

                        <Button
                          size="small"
                          startIcon={<Delete sx={{ fontSize: 16 }} />}
                          onClick={() => handleDeleteProvider(provider.id)}
                          sx={{
                            color: '#ff3b30',
                            textTransform: 'none',
                            fontSize: '12px',
                            alignSelf: 'flex-start',
                            '&:hover': {
                              bgcolor: 'rgba(255, 59, 48, 0.1)',
                            },
                          }}
                        >
                          删除此服务商
                        </Button>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </Paper>

            {/* 使用说明 */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '14px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: showInfo ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                  cursor: 'pointer',
                }}
                onClick={() => setShowInfo(!showInfo)}
              >
                <Box className="flex items-center gap-2">
                  <Info sx={{ fontSize: 18, color: '#007aff' }} />
                  <Typography sx={{ fontSize: '14px', fontWeight: 500, flex: 1 }}>
                    使用说明
                  </Typography>
                  <ExpandMore
                    sx={{
                      fontSize: 20,
                      transform: showInfo ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.3s',
                    }}
                  />
                </Box>
              </Box>
              <Collapse in={showInfo}>
                <Box sx={{ p: 2.5, pt: 2 }}>
                  <Stack spacing={1}>
                    <Typography sx={{ fontSize: '12px', color: '#86868b' }}>
                      • 点击圆圈图标可切换当前使用的服务商
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#86868b' }}>
                      • 支持所有兼容 OpenAI API 的服务
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#86868b' }}>
                      • 点击"添加"按钮创建新的服务商配置
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#1d1d1f' }}>
                      OpenAI 配置示例:
                    </Typography>
                    <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)', p: 1.5, borderRadius: '8px' }}>
                      <Typography sx={{ fontSize: '11px', color: '#636366', fontFamily: 'monospace' }}>
                        端点: https://api.openai.com/v1
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: '#636366', fontFamily: 'monospace' }}>
                        模型: gpt-4o-mini, gpt-4o, gpt-4-turbo
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#1d1d1f' }}>
                      阿里云通义千问翻译模型示例:
                    </Typography>
                    <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.04)', p: 1.5, borderRadius: '8px' }}>
                      <Typography sx={{ fontSize: '11px', color: '#636366', fontFamily: 'monospace' }}>
                        端点: https://dashscope.aliyuncs.com/compatible-mode/v1
                      </Typography>
                      <Typography sx={{ fontSize: '11px', color: '#636366', fontFamily: 'monospace' }}>
                        模型: qwen-mt-flash 或 qwen-mt-plus
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Collapse>
            </Paper>
          </Stack>
        )}

        {/* Tab 1: 自定义提示词 */}
        {currentTab === 1 && (
          <Paper
            elevation={0}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '14px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <Typography variant="subtitle1" sx={{ fontSize: '15px', fontWeight: 600 }}>
                自定义翻译提示词
              </Typography>
              <Typography sx={{ fontSize: '11px', color: '#86868b', mt: 0.5 }}>
                自定义翻译时使用的系统提示词,控制翻译风格、术语处理等
              </Typography>
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#1d1d1f', mb: 1 }}>
                默认提示词:
              </Typography>
              <Box sx={{ bgcolor: 'rgba(0, 122, 255, 0.04)', p: 2, borderRadius: '8px', mb: 2 }}>
                <Typography sx={{ fontSize: '12px', color: '#636366', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  You are a professional translator. Translate the given text to [目标语言]. Only return the translated text without any explanation.
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#1d1d1f', mb: 1 }}>
                自定义提示词:
              </Typography>
              <TextField
                multiline
                rows={8}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="留空则使用默认提示词\n\n自定义示例:\nYou are a professional translator. Translate the given text to [目标语言]. Requirements:\n- Keep technical terms in English\n- Use professional and formal tone\n- Maintain markdown formatting if present\n- Only return the translated text without any explanation."
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: '13px',
                    borderRadius: '8px',
                  },
                }}
              />
              <Typography sx={{ fontSize: '11px', color: '#86868b', mt: 1.5 }}>
                💡 自定义提示词将替换默认提示词。如果留空,则使用上方的默认提示词。提示词中 [目标语言] 会被自动替换为实际的目标语言。
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  )
}
