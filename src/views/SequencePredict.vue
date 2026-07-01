<template>

  <div class="result">
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
      <div v-if="!hasData">
        <el-empty description="暂无该期数的预测数据">
          <el-button @click="goToLatest">查看最新一期</el-button>
        </el-empty>
      </div>

      <!-- 正常展示 -->
      <div
        v-else
        :style="{ opacity: isEditing || isLoading ? 0.3 : 1 }"
        v-loading="isLoading"
      >
        <PredictCard title="顺序" :showRound="sharedRound" :data="combineData" />
      </div>
    </div>

  </div>

</template>

<script>
import { api } from "@/api";
import RoundEdit from "../components/RoundEdit.vue";
import PredictCard from "../components/PredictCard.vue";

import { TABLE_NAMES } from "@/constants";
const { SEQ_STRAIGHT, SEQ_BIAS } = TABLE_NAMES;
import axios from "axios";
import { debounce } from 'lodash'

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
			return Object.keys(this.straightData).length > 0 && Object.keys(this.biasData).length > 0
		},
		combineData() {
      const fields = ["myriabit", "thousand", "hundred", "ten", "one"];
      const straight = this.straightData
      const bias = this.biasData
      if (!straight || !bias) {
        return {}
      }
      return fields.reduce(
        (res, field) => {
          const straightArr = JSON.parse(straight[field]);
          const biasArr = JSON.parse(bias[field]);
          // combineData.myriabit
          res[field] = Array.from(new Set(straightArr.concat(biasArr))).sort(
            (a, b) => a - b
          );
          
          res[`${field}_hit`] = this.getUnion(
            straight[`${field}_hit`],
            bias[`${field}_hit`]
          ); // combineData.myriabit_hit: 0/1/2
          return res;
        },
        {
          round: straight.round || bias.round,
        }
      );
    }
  },
  watch: {
    sharedRound: {
      handler(newVal) {
        if (!newVal) return;
        if (!this.isActivated) return;
        this.debounceFetchAll();
      },
      immediate: true,
    },
  },
  
  created() {
    this.debounceFetchAll = debounce(this.fetchAllData, 300);
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
      isActivated: false,
      isEditing: false,
			isLoading: false,
			isError: false,
			errorMessage: '',

			straightData: {},
			biasData: {},
    };
  },
  methods: {
		goToLatest() {
      this.$store.dispatch('getLatestRound')
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
			this.isError = false
      try {
        const [straight, bias] = await Promise.all([
          this.fetchData(SEQ_STRAIGHT, currentController.signal),
          this.fetchData(SEQ_BIAS, currentController.signal),
				]);

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
    getUnion(hit1, hit2) {
      if (hit1 == 1 || hit2 == 1) {
        return 1;
      } else if (hit1 == null && hit2 == null) {
        return "";
      } else if (hit1 == 0 && hit2 == 0) {
        return "";
      }
      return 2;
    },
  },
};
</script>
<style></style>
