import Vue from 'vue' //import { createApp } from 'vue'
import Vuex from 'vuex' //import { createStore } from 'vuex'
import { api } from '@/api'

Vue.use(Vuex) // 将 store 实例作为插件安装

// 处理业务逻辑，更新全局状态
const store = new Vuex.Store({
  state: {
    sharedRound: 0, //全局期号
  },
  mutations: {
    SET_sharedRound(state, val) {
      state.sharedRound = Number(val)
    }
  },
  actions: {
    async getLatestRound({ commit }) {
      try {
        const resp = await api.getLatestRound()
        const latestRound = Number(resp.data[0].latestRound) + 1
        commit('SET_sharedRound', latestRound) 
        return latestRound //用于回调函数中取值
      }
      catch (e) {
        console.error('获取最新期号失败', e)
      }
    }
  }
})

export default store