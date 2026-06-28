// requestManager.js

class RequestManager{

  constructor() {
    this.controllers = new Map();// 管理所有请求的 abortController
    this.pendingMap = new Map();// 管理Pending状态的请求
  }
  
  generateKey(config) {
    const { method, url, params, data } = config;
    const sortedParams = sortParam(params)
    return [method, url, JSON.stringify(sortedParams), JSON.stringify(data)].join('&');
  }


  // --- Controller 管理 ---
  addController(key, controller) {
    // 只保留第一次发起真实网络请求的 Controller，后续复用的并发请求一律不准覆盖。
    if (!this.controllers.has(key)) {
      this.controllers.set(key, controller);
    }
  }

  getController(key) {
    return this.controllers.get(key);
  }

  hasController(key) {
    return this.controllers.has(key);
  }

  removeController(key) {
    this.controllers.delete(key);
  }


  // --- Pending 管理 ---
  getPending(key) {
    return this.pendingMap.get(key);
  }

  setPending(key, promise) {
    this.pendingMap.set(key, promise);
  }

  hasPending(key) {
    return this.pendingMap.has(key);
  }

  deletePending(key) {
    this.pendingMap.delete(key);
  }

  /**
   *  清理Promise对象，以免页面复用到 abort 后数据为空的Promise  */
  cancelAllPendingRequests(reason = '主动取消所有请求') {
    this.controllers.forEach(c => c.abort(reason));
    this.controllers.clear();
    this.pendingMap.clear();
  }
}

function sortParam(obj) { 
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  return Object.keys(obj)
    .sort()
    .reduce((res, key) => {
      res[key] = obj[key]
      return res
    }, {});
}

export const requestManager = new RequestManager();