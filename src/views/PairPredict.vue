<template>
  <div>
    <div>
      <RoundEdit
        v-model="inputRound"
        @focus="isEditing = true"
        @blur="isEditing = false"
        @change="confirmRoundChange"
      />

      <div :style="{ opacity: isEditing || isLoading ? 0.3 : 1 }" v-loading="isLoading">
        <PredictCard title="直线配对" :showRound="inputRound" :data="straightData" />
        <hr />
        <PredictCard title="斜线配对" :showRound="inputRound" :data="biasData" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { api } from "@/api";
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
  },
  watch: {
    sharedRound: {
      immediate: true,
      handler(newVal) {
        // 若全局期数为空（如 Vuex 异步请求尚未返回），则不触发后续逻辑，防止带空参数请求接口报错
        if (!newVal) return;
        // 若当前组件处于 keep-alive 后台休眠状态，则直接拦截，避免无意义的后台请求
        if (!this.isActivated) return;

        const isChange = newVal !== this.inputRound;  // 只有当全局期数发生了实质性的改变（比如首次加载、或从其他页面切换回来改变了全局期数），
        const isEmpty = !this.inputRound; // 或者是局部输入框为空时，才将全局期数同步给局部输入框。
        if (isChange || isEmpty) {
          this.inputRound = newVal;
        }
        this.fetchAllData();
      },
    },
  },

  activated() {
    this.isActivated = true;
    if (!this.sharedRound) return;
    this.inputRound = this.sharedRound;
    this.fetchAllData();
  },
  deactivated() {
    this.isActivated = false;
  },
  data() {
    return {
      inputRound: "",
      isEditing: false, // 控制数据部分透明度，强调输入框
      isLoading: true, // 控制界面转圈

      // 避免冗余网络请求
      isActivated: false,
     
      straightData: {},
      biasData: {},
    };
  },
  methods: {
    confirmRoundChange(innerRound) {
      this.$store.commit("SET_sharedRound", innerRound);
    },
    async fetchData(tableName) {
      // console.log(typeof this.sharedRound) 
      const res = await api.getPredict( tableName, this.sharedRound );
      return res.data[0];
    },
    async fetchAllData() {
      this.isLoading = true;
      try {
        const [straight, bias] = await Promise.all([
          this.fetchData(PAIR_STRAIGHT),
          this.fetchData(PAIR_BIAS),
        ]);
        this.straightData = straight;
        this.biasData = bias;
      } catch (e) {
        if (e.message === "canceled")
          return;
        console.log(e);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
<style></style>
