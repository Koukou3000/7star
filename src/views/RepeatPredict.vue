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
        <PredictCard title="重复" :showRound="inputRound" :data="combineData" />
        <hr />
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
const { REPEAT_STRAIGHT, REPEAT_BIAS } = TABLE_NAMES

export default {
  components: {
    RoundEdit,
    PredictCard,
  },
  computed: {
    ...mapState(["sharedRound"]),
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
        this.fetchAllData();
      },
      immediate: true,
    },
  },
  activated() {
    this.isActivated = true;
    if (this.sharedRound) {
      this.inputRound = this.sharedRound;
      this.fetchAllData();
    }
  },
  deactivated() {
    this.isActivated = false
  },
  data() {
    return {
      inputRound: "",
      isActivated: false,

      isEditing: false,
      isLoading: false,
      combineData: {},
    };
  },
  methods: {
    confirmRoundChange(innerRound) {
      this.$store.commit("SET_sharedRound", innerRound);
    },

    async fetchData(tableName) {
      const res = await api.getPredict(tableName, this.sharedRound);
      return res.data[0];
    },
    async fetchAllData() {
      if (this.isLoading) return;
      this.isLoading = true;
      try {
        const [straight, bias] = await Promise.all([
          this.fetchData(REPEAT_STRAIGHT),
          this.fetchData(REPEAT_BIAS),
        ]);
        this.generateCombineData(straight, bias);
        this.inputRound = straight.round || bias.round;
      } catch (e) {
        console.log(e);
        // this.$store.dispatch('getLatestRound')
      } finally {
        this.isLoading = false;
      }
    },
    generateCombineData(straight, bias) {
      const fields = ["myriabit", "thousand", "hundred", "ten", "one"];
      this.combineData = fields.reduce(
        (res, field) => {
          const straightArr = JSON.parse(straight[field]);
          const biasArr = JSON.parse(bias[field]);

          res[field] = Array.from(new Set(straightArr.concat(biasArr))).sort(
            (a, b) => a - b
          ); // combineData.myriabit
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
