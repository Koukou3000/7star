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
    sharedRound: {
      handler(newVal) {
        if (!newVal) return;
        if (!this.isActivated) return;
        // 核心逻辑：只有当全局期数发生了实质性的改变（比如首次加载、或从其他页面切换回来改变了全局期数），
        // 或者是局部输入框为空时，我们才强制将全局期数同步给局部输入框。
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
      } catch (e) {
        console.log(e);
        // this.$store.dispatch("getLatestRound");
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
<style></style>
