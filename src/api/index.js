import axios from 'axios'
import { server } from '@/utils/config.js'

const request = axios.create({
  baseURL: server,
  timeout: 10000
})

// 请求原始数据
export const api = {
  getResults: (start, end, signal) => request.get('/api/results', {
    params:{ start, end },
    signal
  }),
  getLatestRound: () => request.get('/api/latestRound'),
  getPredict: (tableName, round) => request.get('/api/predict', {
    params:{ tableName, round }
  })
}