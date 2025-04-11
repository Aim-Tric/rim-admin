import Mock from 'mockjs'
import { setupMock } from './utils'

// 设置响应延时
Mock.setup({
  timeout: '200-600'
})



export default Mock