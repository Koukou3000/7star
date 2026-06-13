import axios from 'axios'
import { server } from '@/config'

const service = axios.create({
  baseURL: server,
  timeout: 10000
})

// 管理所有请求的 abortController
const pendingPromises = new Map()

// 仅管理 getPredict 时产生的请求
const predictPromises = new Map()

function getRequestKey(config) {
  const { method, url, params, data } = config; // 参数拼接后一致的，视为同一个请求
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

export function clearAllPendingRequests(reason) {
  pendingPromises.forEach((controller) => {
    controller.abort(reason)
  })
  pendingPromises.clear()
}

// 给请求分配 abortController
service.interceptors.request.use(
  function (cfg) { 
    const key = getRequestKey(cfg)
    const controller = new AbortController()
    pendingPromises.set(key, controller)
    cfg.signal = cfg.signal || controller.signal // 用于控制中止请求
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
    pendingPromises.delete(key)
    return resp
  },
  function (err) {
    if (err.config) {
      const key = getRequestKey(err.config)
      pendingPromises.delete(key)
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
    }).finally(() => {
      // 一旦返回就从map中清除，保证新请求不受影响
      predictPromises.delete(key)
    })

    // key不同时，请求放入map
    predictPromises.set(key, promise)

    return promise    
  }
    
}