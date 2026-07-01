<template>
    <div>
      <RoundEdit
        v-model="sharedRound"
        @focus="isEditing = true"
        @blur="isEditing = false"
      />

      <div v-if="isError">
        <el-result icon="error" :subTitle="errorMessage">
          <template slot="extra">
            <el-button @click="debounceFetchAll">重试</el-button>
          </template>
        </el-result>
      </div>

      <div v-else v-loading="isLoading">
        <div v-if="!hasData && !isLoading">
          <el-empty description="暂无该期数的预测数据">
            <el-button @click="goToLatest">查看最新一期</el-button>
          </el-empty>
        </div>

        <!-- 正常展示 -->
        <div
          v-else
          :style="{ opacity: isEditing ? 0.3 : 1 }"
          v-loading="isLoading"
        >
          <PredictCard title="直线配对" :showRound="sharedRound" :data="straightData" />
          <hr />
          <PredictCard title="斜线配对" :showRound="sharedRound" :data="biasData" />
        </div>
      </div>
    </div>
</template>

<script>
import { debounce } from 'lodash'
import { api } from "@/api";
import axios from "axios";
import RoundEdit from "../components/RoundEdit.vue";
import PredictCard from "../components/PredictCard.vue";

import { TABLE_NAMES } from "@/constants";
const { PAIR_STRAIGHT, PAIR_BIAS } = TABLE_NAMES;

export default {
  components: {
    RoundEdit,
    PredictCard,
  },
  computed: {
    sharedRound: {
      get() {
        return this.$store.state.sharedRound;
      },
      set(value) {
        this.$store.commit("SET_sharedRound", value);
      },
    },
    hasData() {
      return  Object.keys(this.straightData || {}).length > 0 &&
              Object.keys(this.biasData || {}).length > 0 
    },
  },
  watch: {
    sharedRound(newVal) {
      // 若全局期数为空（如 Vuex 异步请求尚未返回），则不触发后续逻辑，防止带空参数请求接口报错
      if (!newVal) return;
      // 若当前组件处于 keep-alive 后台休眠状态，则直接拦截，避免无意义的后台请求
      if (!this.isActivated) return;
      this.debounceFetchAll();
    },
  },
  created() { 
    this.debounceFetchAll = debounce(this.fetchAllData, 300)
  },
  activated() {
    this.isActivated = true;
    this.isError = false;
    this.errorMessage = '';
    if (!this.sharedRound) {
      this.$store.dispatch("getLatestRound");
      return;
    }
    const currentRound = this.straightData?.round || this.biasData?.round;
    // 没有数据/数据期数不对，重新获取
    if (!this.hasData || currentRound !== this.sharedRound) {
      this.fetchAllData();
    }
  },
  deactivated() {
    this.isActivated = false;
  },
  data() {
    return {
      isActivated: false, // 避免冗余网络请求
      isEditing: false, // 控制数据部分透明度，强调输入框
      isLoading: true, // 控制界面转圈
      isError: false,
      errorMessage: "", // 错误信息，非空表示有错误

      straightData: {},
      biasData: {},
    };
  },
  methods: {
    goToLatest() {
      this.$store.dispatch("getLatestRound");
    },
    async fetchData(tableName, signal) {
      const res = await api.getPredict(tableName, this.sharedRound, { signal });
      return res.data[0];
    },
    async fetchAllData() {
      if (this.abortController) {
        this.abortController.abort();
      }
      this.abortController = new AbortController();
      const currentController = this.abortController;

      this.isLoading = true;
      this.isError = false;
      try {
        const [straight, bias] = await Promise.all([
          this.fetchData(PAIR_STRAIGHT, currentController.signal),
          this.fetchData(PAIR_BIAS, currentController.signal),
        ]);

        // 丢弃过期请求
        if (currentController !== this.abortController) {
          console.log("请求已过期，丢弃数据");
          return;
        }

        this.straightData = straight || {};
        this.biasData = bias || {};
        
      } catch (e) {
        if (axios.isCancel(e)) return;
        this.isError = true;
        this.errorMessage = e.message;
      } finally {
        if (this.abortController === currentController) {
          this.isLoading = false;
        }
      }
    },
  },
};
</script>
<style></style>
