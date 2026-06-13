import axios from 'axios'
import { server } from '@/config'

const service = axios.create({
  baseURL: server,
  timeout: 10000
})

// 管理所有请求的 abortController
const requestControllers = new Map()

// 仅管理 getPredict 时产生的请求
const predictPromises = new Map()

function getRequestKey(config) {
  const { method, url, params, data } = config; // 参数拼接后一致的，视为同一个请求
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

export function clearAllPendingRequests(reason) {
  requestControllers.forEach((controller) => {
    controller.abort(reason)
  })
  requestControllers.clear() 
  predictPromises.clear() 
}

// 给请求分配 abortController
service.interceptors.request.use(
  function (cfg) { 
    const key = getRequestKey(cfg)
    const controller = new AbortController()
    requestControllers.set(key, controller)
    cfg.signal = cfg.signal || controller.signal // 优先使用请求参数中的signal
    return cfg
  },
  function (err) {
    return Promise.reject(err)
   }
)

// 去除请求的 abortController
service.interceptors.response.use(
  function (resp) {
    const key = getRequestKey(resp.config)
    // 收到服务器响应，已经不再需要通过abort()释放连接
    requestControllers.delete(key) 
    return resp
  },
  function (err) {
    if (err.config) {
      const key = getRequestKey(err.config)
      requestControllers.delete(key) 
    }
    return Promise.reject(err)
  })

// 请求原始数据
export const api = {
  getLatestRound: () => service.get('/api/latestRound'),
  getResults: (start, end) => service.get('/api/results',{
    params: { start, end },
  }),
  
  getPredict: (tableName, round) => {
    // 用 tableName 和 round 来区分请求
    const key = `${tableName}&${round}`
    
    // key相同时，返回对应请求
    if (predictPromises.has(key)) {
      return predictPromises.get(key)
    }
    const promise = service.get('/api/predict', {
      params: { tableName, round },
    })
      .then((res) => {
        predictPromises.delete(key)
        return res
      })
      .catch((err) => {
        // 网络报错时（非路由切页取消），按原计划及时移出
        predictPromises.delete(key)
        return Promise.reject(err)
      })
    // key不同时，请求放入map
    predictPromises.set(key, promise)
    return promise    
  }
    
}