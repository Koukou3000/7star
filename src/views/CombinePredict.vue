<template>
  <div class="result">
    <RoundEdit
      v-model="inputRound"
      @focus="isEditing = true"
      @blur="isEditing = false"
      @change="confirmRoundChange"
    />

    <div :style="{ opacity: isEditing ? 0.3 : 1 }">
      <div v-loading="isLoading">
        <el-checkbox
          :indeterminate="isIndeterminate"
          v-model="isAllChecked"
          @change="handleCheckAll"
          >全选</el-checkbox
        >

        <!-- <el-checkbox-group v-model="selectedBox" @change="handleChange"> -->
        <el-checkbox-group v-model="selectedBox">
          <el-checkbox
            v-for="item in checkboxList"
            :key="item.value"
            :label="item.value"
            :disabled="item.disabled"
          >
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>
        <PredictCard title="直线" :data="combineData" :showRound="inputRound" />
      </div>

      <hr />

      <div v-loading="isLoadingBias">
        <el-checkbox
          :indeterminate="isIndeterminateBias"
          v-model="isAllCheckedBias"
          @change="handleCheckAllBias"
          >全选</el-checkbox
        >

        <el-checkbox-group v-model="selectedBoxBias">
          <el-checkbox
            v-for="item in checkboxList2"
            :key="item.value"
            :label="item.value"
            :disabled="item.disabled"
          >
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>
        <PredictCard title="斜线" :data="combineDataBias" :showRound="inputRound" />
      </div>

    </div>
    
  </div>
</template>

<script>
import { debounce } from "lodash";
import { api } from "@/api";
import { mapState } from "vuex";
import RoundEdit from "../components/RoundEdit.vue";
import PredictCard from "../components/PredictCard.vue";

import { TABLE_NAMES } from "@/constants";
const FIELDS = ["myriabit", "thousand", "hundred", "ten", "one"];
const CHECKBOX_STRAIGHT = [
  { label: "直线配对", value: TABLE_NAMES.PAIR_STRAIGHT, checked: true, disabled: true, },
  { label: "直线对称", value: TABLE_NAMES.SYM_STRAIGHT, checked: true },
  { label: "直线重复", value: TABLE_NAMES.REPEAT_STRAIGHT, checked: true },
  { label: "直线顺序", value: TABLE_NAMES.SEQ_STRAIGHT, checked: true },
  { label: "斜线对称", value: TABLE_NAMES.SYM_BIAS, checked: true },
  { label: "斜线重复", value: TABLE_NAMES.REPEAT_BIAS, checked: true },
  { label: "斜线顺序", value: TABLE_NAMES.SEQ_BIAS, checked: true },
]; 
const CHECKBOX_BIAS = [
  { label: "斜线配对", value: TABLE_NAMES.PAIR_BIAS, checked: true, disabled: true, },
  { label: "直线对称", value: TABLE_NAMES.SYM_STRAIGHT, checked: true },
  { label: "直线重复", value: TABLE_NAMES.REPEAT_STRAIGHT, checked: true },
  { label: "直线顺序", value: TABLE_NAMES.SEQ_STRAIGHT, checked: true },
  { label: "斜线对称", value: TABLE_NAMES.SYM_BIAS, checked: true },
  { label: "斜线重复", value: TABLE_NAMES.REPEAT_BIAS, checked: true },
  { label: "斜线顺序", value: TABLE_NAMES.SEQ_BIAS, checked: true },
];

export default {
  components: {
    RoundEdit,
    PredictCard,
  },
  watch: {
    sharedRound: {
      handler(newVal) {
        if (!newVal) return;
        if (!this.isActivated) return;
        const isChange = newVal !== this.inputRound;
        const isEmpty = !this.inputRound;
        if (isChange || isEmpty) {
          this.inputRound = newVal;
        }
        this.fetchBoth();
      },
      immediate: true,
    },
    selectedBox: {
      handler: debounce(function () {
        this.fetchDataStraight()
      },700)
    },
    selectedBoxBias: {
      handler: debounce(function() {
        this.fetchDataBias()
      },700)
    }
  },
  activated() {
    this.isActivated = true;
    if (!this.sharedRound) return;
    this.inputRound = this.sharedRound;
    this.fetchBoth();
  },
  deactivated() {
    this.isActivated = false;
  },
  created() {
    this.initCheckbox();
  },
  computed: {
    ...mapState(["sharedRound"]), //sharedRound() {return this.$store.state.sharedRound}  
    isAllChecked: {
      get() {
        return CHECKBOX_STRAIGHT.length === this.selectedBox.length; // 全选checkbox
      },
      set(bool) {
        this.handleCheckAll(bool);
      },
    },
    isAllCheckedBias: {
      get() {
        return CHECKBOX_BIAS.length === this.selectedBoxBias.length;
      },
      set(bool) {
        this.handleCheckAllBias(bool);
      },
    },
    isIndeterminate() {
      const max = CHECKBOX_STRAIGHT.length;
      const min = CHECKBOX_STRAIGHT.filter((i) => i.disabled).length;
      const cur = this.selectedBox.length;
      return min < cur && cur < max;
    },
    isIndeterminateBias() {
      const max = CHECKBOX_BIAS.length;
      const min = CHECKBOX_BIAS.filter((i) => i.disabled).length;
      const cur = this.selectedBoxBias.length;
      return min < cur && cur < max;
    },
  },
  data() {
    return {
      inputRound: "",
      isActivated: false,
      isEditing: false,
      isLoading: false,
      isLoadingBias: false,

      checkboxList: [],
      selectedBox: [],
      combineData: {},

      checkboxList2: [],
      selectedBoxBias: [],
      combineDataBias: {},
    };
  },

  methods: {
    confirmRoundChange(innerRound) {
      this.$store.commit("SET_sharedRound", innerRound);
    },

    handleCheckAll(bool) {
      if (bool) {
        this.selectedBox = CHECKBOX_STRAIGHT.map((item) => item.value);
      } else {
        this.selectedBox = CHECKBOX_STRAIGHT.filter((item) => item.disabled).map((item) => item.value);
      }
    },
    handleCheckAllBias(bool) {
      if (bool) {
        this.selectedBoxBias = CHECKBOX_BIAS.map((item) => item.value);
      } else {
        this.selectedBoxBias = CHECKBOX_BIAS.filter((item) => item.disabled).map((item) => item.value);
      }
    },
    
    // 1. 公共的合并计算逻辑
    processCombineData(predicts, currentRound) {
      return predicts.reduce(
        (acc, predict) => {
          let item = predict.data[0];

          FIELDS.forEach((field) => {
          
            acc[field] = [ ...new Set([
                ...this.safeParse(acc[field]),
                ...this.safeParse(item[field])]),  // myriabit = [1,2]+[2,3]
            ].sort((a, b) => a - b);

            acc[`${field}_hit`] = this.getHitStats(
              acc[`${field}_hit`],
              item[`${field}_hit`]
            );
          });
          return acc;
        },
        { round: currentRound }
      );
    },
    // 2. 统一的请求处理器（这是通用模版）
    async fetchData(tableNameArr, currentRound, dataKey, loadingKey) {
      this[loadingKey] = true;
      try {
        const promises = tableNameArr.map((tableName) =>
          api.getPredict(tableName, currentRound)
        );
        const predicts = await Promise.all(promises);
        const mergeData = this.processCombineData(predicts, currentRound);
      
        if (currentRound === this.sharedRound) {
          this[dataKey] = mergeData;
        } else {
          console.warn(`⏳ 拦截到过期数据: 请求期号 ${currentRound}, 但用户已切换到 ${this.sharedRound}`);
        }
      } catch (e) {
        if (e.message === "canceled") return;
        this.$store.dispatch('getLatestRound');
      } finally {
        if(currentRound !== this.sharedRound) return
        this[loadingKey] = false;
      }
    },
    // 3. 对外暴露的简洁方法
    async fetchDataStraight() {
      this.fetchData(this.selectedBox, this.sharedRound, "combineData", "isLoading");
    },
    async fetchDataBias() {
      this.fetchData(this.selectedBoxBias,this.sharedRound,"combineDataBias","isLoadingBias");
    },
    async fetchBoth() {
      await Promise.all([this.fetchDataStraight(), this.fetchDataBias()]);
    },
    getHitStats(a, b) {
      if (a === 1 || b === 1) return 1;
      if (a === 2 || b === 2) return 2;
      return 0;
    },
    safeParse(arr) {
      try {
        return typeof arr === "string" ? JSON.parse(arr || "[]") : arr || [];
      } catch (e) {
        console.warn("JSON解析失败，返回空数组:", arr, e);
        return [];
      }
    },
    initCheckbox() {
      this.checkboxList = CHECKBOX_STRAIGHT
      this.checkboxList2 = CHECKBOX_BIAS
      this.selectedBox = CHECKBOX_STRAIGHT.filter((i) => i.checked).map((i) => i.value);
      this.selectedBoxBias = CHECKBOX_BIAS.filter((i) => i.checked).map((i) => i.value);
    },
  },
};
</script>

<style></style>
