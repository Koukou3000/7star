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
      this.fetchAllData();
    },
  },
  mounted() {
    this.inputRound = this.sharedRound;
  },
  data() {
    return {
      inputRound: "",
      isEditing: false,
      isLoading: false,
      straightData: {},
      biasData: {},
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
          this.fetchData("pairstraight"),
          this.fetchData("pairbias"),
        ]);
        this.straightData = straight;
        this.biasData = bias;
        this.inputRound = straight.round || bias.round;
      } catch (e) {
        console.log(e);
        this.$store.dispatch("getLatestRound");
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
<style></style>
