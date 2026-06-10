<template>
  <div>
    <div class="result">
      <RoundEdit v-model="inputRound" @focus="isEditing = true" @blur="isEditing = false"
        @change="confirmRoundChange" />
      <div :style="{ opacity: isEditing || isLoading ? 0.3 : 1 }" v-loading="isLoading">
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAll">全选</el-checkbox>

        <el-checkbox-group v-model="selectedBox" @change="fetchData">
          <el-checkbox v-for="item in checkboxList" :label="item.value" :checked="item.checked"
            :disabled="item.disabled">
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>

        <PredictCard title="直线" :data="combineData" :showRound="inputRound" />
      </div>

      <hr />

      <div class="result">
        <div :style="{ opacity: isEditing || isLoadingBias ? 0.3 : 1 }" v-loading="isLoadingBias">
          <el-checkbox :indeterminate="isIndeterminateBias" v-model="checkAllBias"
            @change="handleCheckAllBias">全选</el-checkbox>

          <el-checkbox-group v-model="selectedBoxBias" @change="fetchDataBias">
            <el-checkbox v-for="item in checkboxList2" :label="item.value" :checked="item.checked"
              :disabled="item.disabled">
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
  computed: {
    ...mapState(["sharedRound"]), //sharedRound() {return this.$store.state.sharedRound}
  },
  watch: {
    sharedRound() {
      this.fetchAll();
    },
    selectedBox(val) {
      const maxLength = this.checkboxList.length;
      const emptyLength = this.checkboxList.filter((item) => item.disabled).length;
      const cur = val.length

      if (cur == maxLength) {
        this.checkAll = true;
        this.isIndeterminate = false;
      } else if (cur == emptyLength) {
        this.checkAll = false;
        this.isIndeterminate = false;
      } else {
        this.checkAll = false;
        this.isIndeterminate = true;
      }
    },
    selectedBoxBias(val) {
      const maxLength = this.checkboxList2.length;
      const emptyLength = this.checkboxList2.filter((item) => item.disabled).length;
      const cur = val.length

      if (cur == maxLength) {
        this.checkAllBias = true;
        this.isIndeterminateBias = false;
      } else if (cur == emptyLength) {
        this.checkAllBias = false;
        this.isIndeterminateBias = false;
      } else {
        this.checkAllBias = false;
        this.isIndeterminateBias = true;
      }
    }
  },
  created() {
    this.fetchData = debounce(this.fetchData, 500);
    this.fetchDataBias = debounce(this.fetchDataBias, 500);
    this.initCheckbox();
  },
  mounted() {
    this.inputRound = this.sharedRound;
  },
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

      //全选框
      checkAll: false,
      isIndeterminate: false,

      checkAllBias: false,
      isIndeterminateBias: false,
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
    },
    handleCheckAll(trigger) {
      if (trigger) {
        this.selectedBox = this.checkboxList.map((item) => item.value);
      }
      else {
        this.selectedBox = this.checkboxList
          .filter((item) => item.disabled)
          .map((item) => item.value);
      }
      this.fetchData();
    },
    handleCheckAllBias(trigger) {
      if (trigger) {
        this.selectedBoxBias = this.checkboxList2.map((item) => item.value);
      }
      else {
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
