import axios from 'axios'
import { TaroAdapter } from 'axios-taro-adapter'

// 创建axios实例
const AxiosInstance = axios.create({
  adapter: TaroAdapter,
  baseURL: 'http://43.138.143.44:8080', // 这里需要替换为实际的API基础URL
  timeout: 10000
})

export default AxiosInstance 