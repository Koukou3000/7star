// index.js
import service from './http'

export const api = {
  getLatestRound: () => service.get('/api/latestRound'),
  getResults: (start, end) => service.get('/api/results',{
    params: { start, end },
  }),
  getPredict: (tableName, round) => service.get('/api/predict', {
    params: { tableName, round },
  })
}