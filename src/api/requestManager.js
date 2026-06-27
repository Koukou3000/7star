// requestManager.js

// 管理所有请求的 abortController { key => abortController }
const controllers = new Map();

// 管理Pending请求 { key => promise }
const pendingPromises = new Map(); 

export function getRequestKey(config) {
  const { method, url, params, data } = config;
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&');
}

export function addRequestController(key, controller) {
  controllers.set(key, controller);
}

export function removeRequestController(key) {
  controllers.delete(key);
}

export function cancelAllPendingRequests(reason) {
  controllers.forEach(c => c.abort(reason));
  controllers.clear();

  // 清理Promise对象，以免页面复用到cancel后数据为空的Promise (router.beforeEach)
  pendingPromises.clear()
}

export const pendingPromiseManager = {
  get: (key) => pendingPromises.get(key),
  set: (key, promise) => pendingPromises.set(key, promise),
  has: (key) => pendingPromises.has(key),
  delete: (key) => pendingPromises.delete(key),
}