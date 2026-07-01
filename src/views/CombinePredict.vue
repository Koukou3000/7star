<template>
  <div class="result">
    <RoundEdit
      v-model="sharedRound"
      @focus="isEditing = true"
      @blur="isEditing = false"
    />

    <div :style="{ opacity: isEditing ? 0.3 : 1 }">
      <CombineSection
        ref="straightSection"
        title="直线"
        :checkboxConfig="checkboxStraight"
        storageKey="COMBINE_SELECTED_STRAIGHT"
        :sharedRound="sharedRound"
        :isActivated="isActivated"
      />

      <hr />

      <CombineSection
        ref="biasSection"
        title="斜线"
        :checkboxConfig="checkboxBias"
        storageKey="COMBINE_SELECTED_BIAS"
        :sharedRound="sharedRound"
        :isActivated="isActivated"
      />
     
    </div>
  </div>
</template>

<script>
import RoundEdit from "../components/RoundEdit.vue";
import PredictCard from "../components/PredictCard.vue";
import CombineSection from '../components/CombineSection.vue'
import { TABLE_NAMES } from "@/constants";

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

export default {
  components: {
    RoundEdit,
    PredictCard,
    CombineSection
  },
  data() {
    return {
      isActivated: false,
      isEditing: false,
      checkboxStraight: CHECKBOX_STRAIGHT,
      checkboxBias: CHECKBOX_BIAS,
    };
  },
  computed: {
    sharedRound: {
      get() { return this.$store.state.sharedRound; },
      set(value) { this.$store.commit("SET_sharedRound", value); },
    },
  },

  watch: {
    sharedRound: {
      immediate: true,
      handler(newVal) {
        // 若全局期数为空（如 Vuex 异步请求尚未返回），则不触发后续逻辑，防止带空参数请求接口报错
        // 若当前组件处于 keep-alive 后台休眠状态，则直接拦截，避免无意义的后台请求
        if (!newVal || !this.isActivated) return;
      },
    },
  },
  activated() {
    this.isActivated = true;
    if (!this.sharedRound) {
      this.$store.dispatch("getLatestRound");
    } 
  },
  deactivated() {
    this.isActivated = false;
  },
};
</script>

<style></style>
