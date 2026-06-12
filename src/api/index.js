import axios from 'axios'
import { server } from '@/utils/config.js'

const service = axios.create({
  baseURL: server,
  timeout: 10000
})

const reqMap = new Map()

// //  参数拼接后一致的，视为同一个请求
function getRequestKey(config) {
  const { method, url, params, data } = config;
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

export function clearAllPendingRequests(reason) {
  reqMap.forEach((controller) => {
    controller.abort('tab切换离开页面')
  })
  reqMap.clear()
}

service.interceptors.request.use(
  function (cfg) { 
    const key = getRequestKey(cfg)
    const controller = new AbortController()
    reqMap.set(key, controller)
    cfg.signal = cfg.signal || controller.signal // controller可以控制请求
    return cfg
  },
  function (err) {
    return Promise.reject(err)
   }
)

service.interceptors.response.use(
  function (resp) {
    const key = getRequestKey(resp.config)
    reqMap.delete(key)
    return resp
  },
  function (err) {
    if (err.config) {
      const key = getRequestKey(err.config)
      reqMap.delete(key)
    }
    return Promise.reject(err)
  })

// 请求原始数据
export const api = {
  getLatestRound: () => service.get('/api/latestRound'),
  getResults: (start, end, signal) => service.get('/api/results', {
    params:{ start, end },
    signal
  }),
  getPredict: (tableName, round, signal) => service.get('/api/predict', {
    params: { tableName, round },
    signal
  })
}