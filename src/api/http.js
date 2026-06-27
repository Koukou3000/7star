// http.js

import axios from 'axios';
import { server } from '@/config';
import { getRequestKey, addRequestController, removeRequestController, pendingPromiseManager } from './requestManager'

// 保留原生的适配器（用于真正发送请求）
const defaultAdapter = axios.getAdapter( axios.defaults.adapter)

const service = axios.create({
  baseURL: server,
  timeout: 10000,
  adapter: (config) => {

    const key = getRequestKey(config)

    // 复用状态为pending的promise
    if (pendingPromiseManager.has(key)) {
      return pendingPromiseManager.get(key)
    }

    const promise = defaultAdapter(config)
    // promise.then(res => {
    //   pendingPromiseManager.delete(key)
    //   return res
    // }).catch(err => {
    //   pendingPromiseManager.delete(key) 
    //   return Promise.reject(err)
    // })
    promise.finally(() => {
      pendingPromiseManager.delete(key)
    })
    pendingPromiseManager.set(key, promise)
    return promise
  }
});


service.interceptors.request.use(
  config => {
    const key = getRequestKey(config)
    const controller = new AbortController()
    addRequestController(key, controller)

    // 如果外部传了 signal，让外部 signal 的 abort 触发内部 controller 的 abort
    if (config.signal) {
      if (config.signal.aborted) {
        controller.abort(config.signal.reason)
      } else {
        config.signal.addEventListener('abort', () => {
          controller.abort(config.signal.reason)
        })
      }
    }
    // 始终使用内部 controller 的 signal（这样全局取消和局部取消都能生效）
    config.signal = controller.signal    
    return config
})
service.interceptors.response.use(
  res => {
    const key = getRequestKey(res.config)
    removeRequestController(key)
    return res
},
  err => {
    if (err.config) {
      const key = getRequestKey(err.config)
      removeRequestController(key)
    }
    return Promise.reject(err)
})

export default service;



