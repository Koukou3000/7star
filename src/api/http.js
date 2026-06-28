// http.js

import axios from 'axios';
import { server } from '@/config';
import { requestManager } from './requestManager';

// 保留原生的适配器（用于真正发送请求）
const defaultAdapter = axios.getAdapter(axios.defaults.adapter)

const service = axios.create({
  baseURL: server,
  timeout: 10000,
  adapter: (config) => {
    const key = requestManager.generateKey(config)
    // 复用请求
    if (requestManager.hasPending(key)) {
      return requestManager.getPending(key);
    }
    // 网络请求结束，清理controller & pendingPromise
    const promise = defaultAdapter(config).finally(() => {
      requestManager.deletePending(key);
      requestManager.removeController(key);
    });

    requestManager.setPending(key, promise);
    return promise;
  }
});


// 给每个请求注入 signal，并为其准备一个 abort() 用于取消请求
service.interceptors.request.use(config => {
  const key = requestManager.generateKey(config);

  // 1.为请求创建一个abortController用于取消请求
  requestManager.addController(key, new AbortController())
  const currentController = requestManager.getController(key);

  // 2.将外部传入的信号，绑定到当前的controller上
  if (config.signal) {
    if (config.signal.aborted) {
      currentController.abort(config.signal.reason)
    } else {
      config.signal.addEventListener('abort', () => {
        currentController.abort(config.signal.reason)
      }, { once: true })//确保该回调触发一次后自动销毁，防止长生命周期的外部信号导致内存泄漏。
    }
  }
  config.signal = currentController.signal
  return config
})


export default service;



