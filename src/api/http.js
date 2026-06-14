// http.js

import axios from 'axios';
import { server } from '@/config';
import { getRequestKey, addRequestController, removeRequestController, pendingManager } from './requestManager'

// 保留原生的适配器（用于真正发送请求）
const defaultAdapter = axios.getAdapter( axios.defaults.adapter)

const service = axios.create({
  baseURL: server,
  timeout: 10000,
  adapter: (config) => {

    const key = getRequestKey(config)
    if (pendingManager.has(key)) {
      return pendingManager.get(key)
    }
    const promise = defaultAdapter(config)
    promise.then(res => {
      pendingManager.delete(key)
      return res
    }).catch(err => {
      pendingManager.delete(key) 
      return Promise.reject(err)
    })
    pendingManager.set(key, promise)

    return promise
  }
});


service.interceptors.request.use(
  config => {
    const key = getRequestKey(config)
    const controller = new AbortController()
    addRequestController(key, controller)
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



