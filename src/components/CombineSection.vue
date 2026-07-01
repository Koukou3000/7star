<template>
  <div v-loading="isLoading" :element-loading-text="'正在加载' + title + '预测数据...'">
    <el-checkbox 
    :indeterminate="isIndeterminate" 
    :checked="isAllChecked"
    @change="handleCheckAll"
    >全选</el-checkbox>
    <el-checkbox-group v-model="selectedbox">
      <el-checkbox v-for="item in checkboxList" :key="item.value" :label="item.value" :disabled="item.disabled">
        {{ item.label }}
      </el-checkbox>
    </el-checkbox-group>

    <div v-if="isError">
      <el-result icon="error" title="加载失败" :subTitle="errorMessage"></el-result>
    </div>
    <div v-else>
      <PredictCard v-if="hasData" :title="title" :data="combineData" :showRound="sharedRound"/>
      <el-empty v-else description="暂无数据，请调整期数"></el-empty>
    </div>
  </div>
</template>

<script>
import { debounce } from "lodash";
import axios from "axios";
import { api } from "@/api";
import PredictCard from "./PredictCard.vue";
const FIELDS = ["myriabit", "thousand", "hundred", "ten", "one"];

export default {
  components: { PredictCard },
  props: {
    title: { type: String, required: true }, // "直线" 或 "斜线"
    checkboxConfig: { type: Array, required: true }, // 初始复选框配置: CHECKBOX_STRAIGHT
    storageKey: { type: String, required: true }, // 本地缓存 Key
    sharedRound: { type: [String, Number], required: true }, // 当前期数
    isActivated: {type: Boolean, required: true}
  },
  data() {
    return {
      isLoading: true,
      isError: false,
      errorMessage: "",
      checkboxList: Object.freeze(this.checkboxConfig),
      selectedbox: this.initLocalStorage(),
      combineData: {},
      abortController: null,
    };
  },
  computed: {
    hasData() {
      return this.combineData && 
             Object.keys(this.combineData).length > 1;
    },
    // isAllChecked和isIndeterminate组合了三种状态：空（FF）、满（TF）、半（FT）
    isAllChecked() {
      return this.checkboxList.length === this.selectedbox.length;
    },
    isIndeterminate() {
      const max = this.checkboxList.length;
      const min = this.checkboxList.filter(i => i.disabled).length;
      const cur = this.selectedbox.length;
      return min < cur && cur < max;
    }
  },
  watch: {
    sharedRound(newVal) {
      // 若全局期数为空（如 Vuex 异步请求尚未返回），则不触发后续逻辑，防止带空参数请求接口报错
      // 若当前组件处于 keep-alive 后台休眠状态，则直接拦截，避免无意义的后台请求
      if (!newVal || !this.isActivated) return;
      if (this.debouncedFetch) {
        this.debouncedFetch.cancel();
      }
      this.debouncedFetch(); // 期数改变，立刻物理截断并重发
    },
    selectedbox: {
      deep: true,
      handler(newVal) {
        localStorage.setItem(this.storageKey, JSON.stringify(newVal));
        this.debouncedFetch(); // 多选框改变，走防抖
      }
    }
  },
  created() {
    this.debouncedFetch = debounce(() => this.fetchData(), 700);
  },
  activated() {
    this.isError = false;
    this.errorMessage = "";
    // 核心缓存拦截：没有数据，或者期数对不上，才重新请求
    if (!this.hasData || this.combineData.round !== this.sharedRound) {
      this.fetchData();
    }
  },
  deactivated() {
    if (this.debouncedFetch) {
      this.debouncedFetch.cancel();
    }
  },
  methods: {
    handleCheckAll(isCheckAll) {
      if (isCheckAll) {
        this.selectedbox = this.checkboxList.map(item => item.value);
      } else {
        this.selectedbox = this.checkboxList
          .filter(item => item.disabled)
          .map(item => item.value);
      }
    },
    initLocalStorage() { 
      try {
        // 检查是否有缓存记录
        const str = localStorage.getItem(this.storageKey);
        if (!str) return this.checkboxConfig.filter(i => i.checked).map(i => i.value);
        const arr = JSON.parse(str);
        const legalValues = this.checkboxConfig.map(i => i.value);
        let ans = arr.filter(item => legalValues.includes(item));  
        // 不可修改项为必选项，强行塞入
        const defaultVal = this.checkboxConfig.find(i => i.disabled)?.value;
        if (defaultVal && !ans.includes(defaultVal)) ans.unshift(defaultVal);
        return ans;
      } catch (e) {
        return this.checkboxConfig.filter(i => i.checked).map(i => i.value);
      }
    },
    async fetchData() {
      if (!this.sharedRound) return;
      
      if (this.abortController) this.abortController.abort();
      this.abortController = new AbortController();
      const currentController = this.abortController;

      this.isLoading = true;
      this.isError = false;
      this.errorMessage = "";

      try {
        const promises = this.selectedbox.map(tablename =>
          api.getPredict(tablename, this.sharedRound, { signal: currentController.signal })
        );
        const predicts = await Promise.all(promises);

        // await到结果后，如果发现请求控制器不是最新的了，默默丢弃不渲染
        if (currentController !== this.abortController)
          return;

        this.combineData = this.processCombineData(predicts, this.sharedRound);
      } catch (e) {
        if (axios.isCancel(e)) return;
        this.isError = true;
        this.errorMessage = e.message;
      } finally {
        if (currentController === this.abortController)
          this.isLoading = false;
      }
    },
    processCombineData(predicts, currentRound) { 
      return predicts.reduce((acc, predict) => {
        let item = predict.data[0];
        if (!item) return acc;
        FIELDS.forEach(field => {
          acc[field] = [...new Set([
            ...this.safeParse(acc[field]),
            ...this.safeParse(item[field])
          ])// myriabit = [1,2]+[2,3]
          ].sort();
          acc[`${field}_hit`] = this.getHitStats(
            acc[`${field}_hit`],
            item[`${field}_hit`]
          );
        });
        return acc;
      }, { round: currentRound });
    },
    safeParse(arr) {
      return typeof arr === "string" ? JSON.parse(arr || "[]") : arr || [];
    },
    getHitStats(a, b) {
      if (a === 1 || b === 1) return 1;
      if (a === 2 || b === 2) return 2;
      return 0;
    },
  }
};
</script>
<style scoped></style>
