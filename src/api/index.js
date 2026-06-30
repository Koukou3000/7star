// index.js
import service from './http'

export const api = {
  getLatestRound: () => service.get('/api/latestRound'),
  getResults: (start, end) => service.get('/api/results',{
    params: { start, end },
  }),
  getPredict: (tableName, round, options = {}) => {
    return service.get('/api/predict', {
      params: { tableName, round },
      signal: options.signal
    })
  }
}