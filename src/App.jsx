import { useEffect, useState } from 'react'
import Translate from './Translate'
import Settings from './Settings'

export default function App () {
  const [enterAction, setEnterAction] = useState({})
  const [route, setRoute] = useState('')
  const [currentPage, setCurrentPage] = useState('translate')

  useEffect(() => {
    // 监听插件进入事件
    const removeEnterListener = window.utools.onPluginEnter((action) => {
      console.log('Plugin Enter:', action)
      setRoute(action.code)
      setEnterAction(action)
      // 根据进入的功能设置初始页面
      if (action.code === 'settings') {
        setCurrentPage('settings')
      } else if (action.code === 'translateToChinese' || action.code === 'translateToEnglish' || action.code === 'translate') {
        setCurrentPage('translate')
      } else {
        setCurrentPage('translate')
      }
    })

    // 监听插件退出事件
    const removeOutListener = window.utools.onPluginOut((isKill) => {
      setRoute('')
      setCurrentPage('translate')
    })

    // 暴露全局方法供子组件调用
    window.navigateToSettings = () => setCurrentPage('settings')
    window.navigateToTranslate = () => setCurrentPage('translate')

    return () => {
      // 清理监听器
      if (removeEnterListener) removeEnterListener()
      if (removeOutListener) removeOutListener()
      delete window.navigateToSettings
      delete window.navigateToTranslate
    }
  }, [])

  if (currentPage === 'settings') {
    return <Settings />
  }

  return <Translate enterAction={enterAction} />
}
