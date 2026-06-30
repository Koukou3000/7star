<template>
  <div class="result">
    <RoundEdit
      v-model="sharedRound"
      @focus="isEditing = true"
      @blur="isEditing = false"
    />

    <div :style="{ opacity: isEditing ? 0.3 : 1 }">
        
        <div v-loading="isLoading" element-loading-text="正在加载直线预测数据...">
          <el-checkbox
            :indeterminate="isIndeterminate"
            v-model="isAllChecked"
            @change="handleCheckAll"
            >全选</el-checkbox
          >
          <el-checkbox-group v-model="selectedList">
            <el-checkbox
              v-for="item in checkboxList"
              :key="item.value"
              :label="item.value"
              :disabled="item.disabled"
            >
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
          
          <div v-if="isErrorStraight">
            <el-result icon="error" title="加载失败" :subTitle="errorMessageStraight"></el-result>
          </div>
          <div v-else>
            <PredictCard
              v-if="hasDataStraight"
              title="直线"
              :data="combineData"
              :showRound="sharedRound"
            />
            <el-empty v-else description="暂无数据，请调整期数"></el-empty>
          </div>
          
        </div>

        <hr />

        <div v-loading="isLoadingBias" element-loading-text="正在加载斜线预测数据...">
          <el-checkbox
            :indeterminate="isIndeterminateBias"
            v-model="isAllCheckedBias"
            @change="handleCheckAllBias"
            >全选</el-checkbox
          >
          <el-checkbox-group v-model="selectedListBias">
            <el-checkbox
              v-for="item in checkboxList2"
              :key="item.value"
              :label="item.value"
              :disabled="item.disabled"
            >
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>

          <div v-if="isErrorBias">
            <el-result icon="error" title="加载失败" :subTitle="errorMessageBias"></el-result>
          </div>
          <div v-else>
            <PredictCard v-if="hasDataStraight" title="斜线" :data="combineDataBias" :showRound="sharedRound" />
            <el-empty v-else description="暂无数据，请调整期数"></el-empty>
          </div>
        </div>

    </div>
  </div>
</template>

<script>
import { debounce } from "lodash";
import { api } from "@/api";
import RoundEdit from "../components/RoundEdit.vue";
import PredictCard from "../components/PredictCard.vue";

import { TABLE_NAMES } from "@/constants";
import axios from "axios";
const FIELDS = ["myriabit", "thousand", "hundred", "ten", "one"];
const CHECKBOX_STRAIGHT = [
  { label: "直线配对", value: TABLE_NAMES.PAIR_STRAIGHT, checked: true, disabled: true },
  { label: "直线对称", value: TABLE_NAMES.SYM_STRAIGHT, checked: true },
  { label: "直线重复", value: TABLE_NAMES.REPEAT_STRAIGHT, checked: true },
  { label: "直线顺序", value: TABLE_NAMES.SEQ_STRAIGHT, checked: true },
  { label: "斜线对称", value: TABLE_NAMES.SYM_BIAS, checked: true },
  { label: "斜线重复", value: TABLE_NAMES.REPEAT_BIAS, checked: true },
  { label: "斜线顺序", value: TABLE_NAMES.SEQ_BIAS, checked: true },
];
const CHECKBOX_BIAS = [
  { label: "斜线配对", value: TABLE_NAMES.PAIR_BIAS, checked: true, disabled: true },
  { label: "直线对称", value: TABLE_NAMES.SYM_STRAIGHT, checked: true },
  { label: "直线重复", value: TABLE_NAMES.REPEAT_STRAIGHT, checked: true },
  { label: "直线顺序", value: TABLE_NAMES.SEQ_STRAIGHT, checked: true },
  { label: "斜线对称", value: TABLE_NAMES.SYM_BIAS, checked: true },
  { label: "斜线重复", value: TABLE_NAMES.REPEAT_BIAS, checked: true },
  { label: "斜线顺序", value: TABLE_NAMES.SEQ_BIAS, checked: true },
];

// 用于localstorage
const STORAGE_KEY_STRAIGHT = "COMBINE_SELECTED_STRAIGHT";
const STORAGE_KEY_BIAS = "COMBINE_SELECTED_BIAS";
const LEGAL_TABLE_NAMES = Object.values(TABLE_NAMES);

function getLocalStorageData(key, defaultValue) {
  try {
    const str = localStorage.getItem(key);
    if (!str) return null; // 没有缓存记录直接退出，不触发异常流程

    const arr = JSON.parse(str);
    if (!Array.isArray(arr)) return null; //  防止本地被改成了非数组格式（如字符串或数字）

    let ans = arr.filter((item) => LEGAL_TABLE_NAMES.includes(item)); // filter()留下返回true的元素

    // 如果必选项不在里面，强行塞入
    if (!ans.includes(defaultValue)) {
      ans.unshift(defaultValue);
    }

    return ans;
  } catch (error) {
    // 如果用户手动魔改了本地数据导致 JSON.parse 报错，这里捕获并降级，防止整个页面死锁崩溃
    console.log(`读取本地缓存 [${key}] 失败，已自动降级使用默认配置`, error);
    return null;
  }
}

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
    // 判断是否有有效填充数据
    hasDataStraight() {
      return this.combineData && Object.keys(this.combineData).length > 1; // 除去 round 外还有其他字段
    },
    hasDataBias() {
      return this.combineDataBias && Object.keys(this.combineDataBias).length > 1;
    },
    // 控制全选
    isAllChecked: {
      get() {
        return CHECKBOX_STRAIGHT.length === this.selectedList.length;
      },
      set(bool) {
        this.handleCheckAll(bool);
      },
    },
    isAllCheckedBias: {
      get() {
        return CHECKBOX_BIAS.length === this.selectedListBias.length;
      },
      set(bool) {
        this.handleCheckAllBias(bool);
      },
    },
    isIndeterminate() {
      const max = CHECKBOX_STRAIGHT.length;
      const min = CHECKBOX_STRAIGHT.filter((i) => i.disabled).length;
      const cur = this.selectedList.length;
      return min < cur && cur < max;
    },
    isIndeterminateBias() {
      const max = CHECKBOX_BIAS.length;
      const min = CHECKBOX_BIAS.filter((i) => i.disabled).length;
      const cur = this.selectedListBias.length;
      return min < cur && cur < max;
    },
  },

  data() {
    const localStraight = getLocalStorageData(
      STORAGE_KEY_STRAIGHT,
      TABLE_NAMES.PAIR_STRAIGHT
    );
    const localBias = getLocalStorageData(STORAGE_KEY_BIAS, TABLE_NAMES.PAIR_BIAS);

    return {
      isActivated: false,
      isEditing: false,

      isLoading: false,
      isLoadingBias: false,
      isErrorStraight: false,
      isErrorBias: false,
      errorMessageStraight: '',
      errorMessageBias: '',
      
      checkboxList: Object.freeze(CHECKBOX_STRAIGHT),
      selectedList:
        localStraight || CHECKBOX_STRAIGHT.filter((i) => i.checked).map((i) => i.value),
      combineData: {},


      checkboxList2: Object.freeze(CHECKBOX_BIAS),
      selectedListBias:
        localBias || CHECKBOX_BIAS.filter((i) => i.checked).map((i) => i.value),
      combineDataBias: {},
    };
  },
  watch: {
    sharedRound: {
      immediate: true,
      handler(newVal) {
        // 若全局期数为空（如 Vuex 异步请求尚未返回），则不触发后续逻辑，防止带空参数请求接口报错
        if (!newVal) return;
        // 若当前组件处于 keep-alive 后台休眠状态，则直接拦截，避免无意义的后台请求
        if (!this.isActivated) return;
        this.cancelAllPendingDebounce(); // 拦截请求
        this.fetchBoth(); // 重发请求
      },
    },
    selectedList: {
      handler(newVal) {
        localStorage.setItem(STORAGE_KEY_STRAIGHT, JSON.stringify(newVal));
        this.debouncedFetchStraight();
      },
      deep: true,
    },
    selectedListBias: {
      handler(newVal) {
        localStorage.setItem(STORAGE_KEY_BIAS, JSON.stringify(newVal));
        this.debouncedFetchBias();
      },
      deep: true,
    },
  },
  created() {
    // 多选框防抖（selectedBox）
    this.debouncedFetchStraight = debounce(function () {
      this.fetchDataStraight();
    }, 700);
    this.debouncedFetchBias = debounce(function () {
      this.fetchDataBias();
    }, 700);
  },

  activated() {
    this.isActivated = true;
    if (!this.sharedRound) {
      this.$store.dispatch("getLatestRound");
    } else {
      this.cancelAllPendingDebounce(); // 拦截请求
      this.fetchBoth(); // 重发请求
    }
  },
  deactivated() {
    this.cancelAllPendingDebounce();
    this.isActivated = false;
  },

  methods: {
    // 拦截由于 selectedList 变更导致的请求
    cancelAllPendingDebounce() {
      if (this.debouncedFetchStraight) this.debouncedFetchStraight.cancel();
      if (this.debouncedFetchBias) this.debouncedFetchBias.cancel();
    },
    async fetchBoth() {
      await Promise.all([this.fetchDataStraight(), this.fetchDataBias()]);
    },
    // 1. 对外暴露的简洁方法
    async fetchDataStraight() {
      this.fetchData(this.selectedList, this.sharedRound,"combineData","isLoading","isErrorStraight","errorMessageStraight");
    },
    async fetchDataBias() {
      this.fetchData(this.selectedListBias, this.sharedRound, "combineDataBias", "isLoadingBias","isErrorBias","errorMessageBias");
    },

    // 2. 统一的请求处理器（这是通用模版）
    async fetchData(tableNameArr, currentRound, dataKey, loadingKey, errorKey, errorMessage) {
      this[loadingKey] = true;
      this[errorKey] = false;
      this[errorMessage] = '';
      try {
        const promises = tableNameArr.map((tableName) =>
          api.getPredict(tableName, currentRound)
        );
        const predicts = await Promise.all(promises);
        const mergeData = this.processCombineData(predicts, currentRound);
        if (currentRound === this.sharedRound) {
          this[dataKey] = mergeData;
          // 模拟数据为空/出错
          // this[dataKey] = {};
          // throw Error('123123')
        } else {
          console.warn(
            `⏳ 拦截到过期数据: 请求期号 ${currentRound}, 但用户已切换到 ${this.sharedRound}`
          );
        }
      } catch (e) {
        if (axios.isCancel(e)) return;
        this[errorKey] = true;
        this[errorMessage] = e.message
      } finally {
        if (currentRound !== this.sharedRound) return;
        this[loadingKey] = false;
      }
    },
    // 3. 公共的合并计算逻辑
    processCombineData(predicts, currentRound) {
      return predicts.reduce(
        (acc, predict) => {
          let item = predict.data[0];
          if (!item) return acc
          
          FIELDS.forEach((field) => {
            acc[field] = [
              ...new Set([
                ...this.safeParse(acc[field]),
                ...this.safeParse(item[field])
              ]), // myriabit = [1,2]+[2,3]
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

    handleCheckAll(bool) {
      if (bool) {
        this.selectedList = CHECKBOX_STRAIGHT.map((item) => item.value);
      } else {
        this.selectedList = CHECKBOX_STRAIGHT.filter((item) => item.disabled).map(
          (item) => item.value
        );
      }
    },
    handleCheckAllBias(bool) {
      if (bool) {
        this.selectedListBias = CHECKBOX_BIAS.map((item) => item.value);
      } else {
        this.selectedListBias = CHECKBOX_BIAS.filter((item) => item.disabled).map(
          (item) => item.value
        );
      }
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
  },
};
</script>

<style></style>
