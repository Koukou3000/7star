<template>
  <div>
    <div>
      <RoundEdit
        v-model="inputRound"
        @focus="isEditing = true"
        @blur="isEditing = false"
        @change="confirmRoundChange"
      />

      <div v-if="isError">
        <el-result icon="error" :subTitle="errorMessage">
          <template slot="extra">
            <el-button @click="fetchAllData">重试</el-button>
          </template>
        </el-result>
      </div>

      <div v-else v-loading="isLoading">
        <div v-if="!hasData">
          <el-empty description="暂无该期数的预测数据">
            <el-button @click="goToLatest">查看最新一期</el-button>
          </el-empty>
        </div>
        
        <!-- 正常展示 -->
        <div v-else :style="{ opacity: isEditing || isLoading ? 0.3 : 1 }" v-loading="isLoading">
          <PredictCard title="直线配对" :showRound="inputRound" :data="straightData" />
          <hr />
          <PredictCard title="斜线配对" :showRound="inputRound" :data="biasData" />
        </div>
        
      </div>
      
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { api } from "@/api";
import axios from "axios";
import RoundEdit from "../components/RoundEdit.vue";
import PredictCard from "../components/PredictCard.vue";

import { TABLE_NAMES } from '@/constants'
const { PAIR_STRAIGHT, PAIR_BIAS } = TABLE_NAMES

export default {
  components: {
    RoundEdit,
    PredictCard,
  },
  computed: {
    ...mapState(["sharedRound"]), //sharedRound() {return this.$store.state.sharedRound}
    hasData() { 
      return Object.keys(this.straightData).length > 0 &&
        Object.keys(this.biasData).length > 0 
    },
  },
  watch: {
    sharedRound: {
      immediate: true,
      handler(newVal) {
        // 若全局期数为空（如 Vuex 异步请求尚未返回），则不触发后续逻辑，防止带空参数请求接口报错
        if (!newVal) return;
        // 若当前组件处于 keep-alive 后台休眠状态，则直接拦截，避免无意义的后台请求
        if (!this.isActivated) return;
        
        this.inputRound = newVal;
        this.fetchAllData();
      },
    },
  },

  activated() {
    this.isActivated = true;
    if (!!this.sharedRound) {
      this.inputRound = this.sharedRound;
      this.fetchAllData();
    }
    else {
      this.$store.dispatch('getLatestRound')
    }
  },
  deactivated() {
    this.isActivated = false;
  },
  data() {
    return {
      inputRound: "",
      isEditing: false, // 控制数据部分透明度，强调输入框
      isLoading: true, // 控制界面转圈
      isActivated: false, // 避免冗余网络请求

      isError: false,
      errorMessage: "",       // 错误信息，非空表示有错误
      
      straightData: {},
      biasData: {},
    };
  },
  methods: {
    confirmRoundChange(innerRound) {
      this.$store.commit("SET_sharedRound", innerRound);
    },
    goToLatest() {
      this.$store.dispatch('getLatestRound')
    },
    async fetchData(tableName) {
      const res = await api.getPredict( tableName, this.sharedRound );
      return res.data[0];
    },
    async fetchAllData() {
      this.isError = false
      this.isLoading = true;
      try {
        const [straight, bias] = await Promise.all([
          this.fetchData(PAIR_STRAIGHT),
          this.fetchData(PAIR_BIAS),
        ]);
        
        this.straightData = straight || {};
        this.biasData = bias || {};
        
      } catch (e) {
        if (axios.isCancel(e)) return;
        this.isError = true
        this.errorMessage = e.message
      } finally {
        this.isLoading = false;
      }
    },
  
  },
};
</script>
<style></style>
