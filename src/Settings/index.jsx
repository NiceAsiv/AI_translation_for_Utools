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
  Alert,
  Collapse,
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
} from '@mui/icons-material'

export default function Settings() {
  const [providers, setProviders] = useState([
    {
      id: 'openai-default',
      name: 'OpenAI',
      endpoint: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4o-mini',
      isDefault: true,
      enabled: true
    }
  ])
  const [activeProviderId, setActiveProviderId] = useState('openai-default')
  const [showKeys, setShowKeys] = useState({})
  const [saving, setSaving] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const savedConfig = await window.services.getConfig()
    console.log('加载的配置:', savedConfig)
    if (savedConfig && savedConfig.providers) {
      setProviders(savedConfig.providers)
      setActiveProviderId(savedConfig.activeProviderId || savedConfig.providers[0]?.id)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const configToSave = {
        providers,
        activeProviderId
      }
      console.log('保存配置:', configToSave)
      await window.services.saveConfig(configToSave)
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
    setProviders([...providers, {
      id: newId,
      name: '新服务商',
      endpoint: '',
      apiKey: '',
      model: '',
      isDefault: false,
      enabled: true
    }])
  }

  const handleDeleteProvider = (id) => {
    const provider = providers.find(p => p.id === id)
    if (provider?.isDefault) {
      window.utools.showNotification('不能删除默认服务商')
      return
    }
    setProviders(providers.filter(p => p.id !== id))
    if (activeProviderId === id && providers.length > 1) {
      setActiveProviderId(providers[0].id)
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

  const activeProvider = providers.find(p => p.id === activeProviderId)

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
            API 设置
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

      {/* 主内容 */}
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
                    {/* 名称 */}
                    {!provider.isDefault && (
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
                    )}

                    {/* API 端点 */}
                    <TextField
                      label="API 端点"
                      size="small"
                      value={provider.endpoint}
                      onChange={(e) => handleUpdateProvider(provider.id, 'endpoint', e.target.value)}
                      disabled={provider.isDefault}
                      placeholder="https://api.openai.com/v1"
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '13px',
                          borderRadius: '8px',
                        },
                      }}
                    />

                    {/* API Key */}
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

                    {/* 模型 */}
                    <TextField
                      label="模型名称"
                      size="small"
                      value={provider.model}
                      onChange={(e) => handleUpdateProvider(provider.id, 'model', e.target.value)}
                      placeholder="gpt-4o-mini"
                      fullWidth
                      helperText={
                        provider.isDefault
                          ? '常用: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo'
                          : ''
                      }
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

                    {/* 删除按钮 */}
                    {!provider.isDefault && (
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
                    )}
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
                  • OpenAI 是预设服务商，只需填写 API Key 和模型
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#86868b' }}>
                  • 自定义服务商支持所有兼容 OpenAI API 的服务
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#1d1d1f' }}>
                  阿里云通义千问翻译模型示例：
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
    </Box>
  )
}
