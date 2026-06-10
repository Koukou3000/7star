<template>
  <div>
    <div class="result">
      <RoundEdit
        v-model="inputRound"
        @focus="isEditing = true"
        @blur="isEditing = false"
        @change="confirmRoundChange"
      />
      <div :style="{ opacity: isEditing || isLoading ? 0.3 : 1 }" v-loading="isLoading">
        <el-checkbox
          :indeterminate="isIndeterminate"
          v-model="ifCheckAll"
          @change="handleCheckAll"
          >全选</el-checkbox
        >

        <el-checkbox-group v-model="selectedBox" @change="fetchData">
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

      <div class="result">
        <div
          :style="{ opacity: isEditing || isLoadingBias ? 0.3 : 1 }"
          v-loading="isLoadingBias"
        >
          <el-checkbox
            :indeterminate="isIndeterminateBias"
            v-model="ifCheckAllBias"
            @change="handleCheckAllBias"
            >全选</el-checkbox
          >

          <el-checkbox-group v-model="selectedBoxBias" @change="fetchDataBias">
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
  </div>
</template>

<script>
import { debounce } from "lodash";
import { api } from "@/api";
import { mapState } from "vuex";
import RoundEdit from "../components/RoundEdit.vue";
import PredictCard from "../components/PredictCard.vue";

export default {
  components: {
    RoundEdit,
    PredictCard,
  },
  watch: {
    sharedRound(newVal) {
      if (!newVal) return;
      // 核心逻辑：只有当全局期数发生了实质性的改变（比如首次加载、或从其他页面切换回来改变了全局期数），
      // 或者是局部输入框为空时，我们才强制将全局期数同步给局部输入框。
      const isDifferent = newVal !== this.inputRound;
      const isEmpty = !this.inputRound;

      if (isDifferent || isEmpty) {
        this.inputRound = newVal;
      }
      this.fetchAll();
    },
  },
  computed: {
    ...mapState(["sharedRound"]), //sharedRound() {return this.$store.state.sharedRound}
    ifCheckAll: {
      get() {
        return this.checkboxList.length === this.selectedBox.length;
      },
      set(trigger) {
        this.handleCheckAll(trigger);
      },
    },
    ifCheckAllBias: {
      get() {
        return this.checkboxList2.length === this.selectedBoxBias.length;
      },
      set(trigger) {
        this.handleCheckAllBias(trigger);
      },
    },
    isIndeterminate() {
      const cur = this.selectedBox.length;
      const max = this.checkboxList.length;
      const min = this.checkboxList.filter((i) => i.disabled).length;
      return min < cur && cur < max;
    },
    isIndeterminateBias() {
      const cur = this.selectedBoxBias.length;
      const max = this.checkboxList2.length;
      const min = this.checkboxList2.filter((i) => i.disabled).length;
      return min < cur && cur < max;
    },
  },
  created() {
    this.fetchData = debounce(this.fetchData, 500);
    this.fetchDataBias = debounce(this.fetchDataBias, 500);
    this.initCheckbox();
  },
  // beforeCreate() {
  //   this.inputRound = this.sharedRound;
  // },
  data() {
    return {
      inputRound: "",
      isEditing: false,
      isLoading: false,
      isLoadingBias: false,

      tableName1: "pairstraight",
      tableName2: "symstraight",
      tableName3: "repeatstraight",
      tableName4: "seqstraight",
      tableName5: "pairbias",
      tableName6: "symbias",
      tableName7: "repeatbias",
      tableName8: "seqbias",

      checkboxList: [],
      selectedBox: [],
      combineData: {},

      checkboxList2: [],
      selectedBoxBias: [],
      combineDataBias: {},
    };
  },

  methods: {
    initCheckbox() {
      this.checkboxList = [
        { label: "直线配对", value: this.tableName1, checked: true, disabled: true },
        { label: "直线对称", value: this.tableName2, checked: true },
        { label: "直线重复", value: this.tableName3, checked: true },
        { label: "直线顺序", value: this.tableName4, checked: true },
        { label: "斜线对称", value: this.tableName6, checked: true },
        { label: "斜线重复", value: this.tableName7, checked: true },
        { label: "斜线顺序", value: this.tableName8, checked: true },
      ];
      this.checkboxList2 = [
        { label: "斜线配对", value: this.tableName5, checked: true, disabled: true },
        { label: "直线对称", value: this.tableName2, checked: true },
        { label: "直线重复", value: this.tableName3, checked: true },
        { label: "直线顺序", value: this.tableName4, checked: true },
        { label: "斜线对称", value: this.tableName6, checked: true },
        { label: "斜线重复", value: this.tableName7, checked: true },
        { label: "斜线顺序", value: this.tableName8, checked: true },
      ];
      this.selectedBox = this.checkboxList.filter((i) => i.checked).map((i) => i.value);
      this.selectedBoxBias = this.checkboxList2
        .filter((i) => i.checked)
        .map((i) => i.value);
    },
    handleCheckAll(trigger) {
      if (trigger) {
        this.selectedBox = this.checkboxList.map((item) => item.value);
      } else {
        this.selectedBox = this.checkboxList
          .filter((item) => item.disabled)
          .map((item) => item.value);
      }
      this.fetchData();
    },
    handleCheckAllBias(trigger) {
      if (trigger) {
        this.selectedBoxBias = this.checkboxList2.map((item) => item.value);
      } else {
        this.selectedBoxBias = this.checkboxList2
          .filter((item) => item.disabled)
          .map((item) => item.value);
      }
      this.fetchDataBias();
    },
    confirmRoundChange(innerRound) {
      this.$store.commit("SET_sharedRound", innerRound);
    },
    async fetchAll() {
      await Promise.all([this.fetchData(), this.fetchDataBias()]);
    },
    async fetchData() {
      if (this.isLoading) return;
      this.isLoading = true;

      const tableNameArr = this.selectedBox;
      const currentRound = this.sharedRound;
      try {
        const promises = tableNameArr.map((tableName) =>
          api.getPredict(tableName, currentRound)
        );
        const predicts = await Promise.all(promises);
        const fields = ["myriabit", "thousand", "hundred", "ten", "one"];

        const mergeData = predicts.reduce(
          (acc, predict) => {
            let item = predict.data[0];

            fields.forEach((field) => {
              acc[field] = [
                ...new Set([
                  ...this.safeParse(acc[field]),
                  ...this.safeParse(item[field]),
                ]),
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
        this.inputRound = currentRound;
        this.combineData = mergeData;
      } catch (e) {
        console.log(e);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchDataBias() {
      if (this.isLoadingBias) return;
      this.isLoadingBias = true;

      const tableNameArr = this.selectedBoxBias;
      const currentRound = this.sharedRound;
      try {
        const promises = tableNameArr.map((tableName) =>
          api.getPredict(tableName, currentRound)
        );
        const predicts = await Promise.all(promises);
        const fields = ["myriabit", "thousand", "hundred", "ten", "one"];

        const mergeData = predicts.reduce(
          (acc, predict) => {
            let item = predict.data[0];

            fields.forEach((field) => {
              acc[field] = [
                ...new Set([
                  ...this.safeParse(acc[field]),
                  ...this.safeParse(item[field]),
                ]),
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
        this.inputRound = currentRound;
        this.combineDataBias = mergeData;
      } catch (e) {
        console.log(e);
      } finally {
        this.isLoadingBias = false;
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
