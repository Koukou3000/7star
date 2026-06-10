<template>
  <div id="app">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="历史" name="first">
        <History v-if="activeName === 'first'" />
      </el-tab-pane>

      <el-tab-pane label="配对" name="second">
        <pair-predict v-if="activeName === 'second'" />
      </el-tab-pane>

      <el-tab-pane label="对称" name="third">
        <sym-predict v-if="activeName === 'third'" />
      </el-tab-pane>

      <el-tab-pane label="重复" name="fourth">
        <repeat-predict v-if="activeName === 'fourth'" />
      </el-tab-pane>

      <el-tab-pane label="顺序" name="fifth">
        <sequence-predict v-if="activeName === 'fifth'" />
      </el-tab-pane>

      <el-tab-pane label="综合" name="sixth">
        <combine-predict v-if="activeName === 'sixth'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import History from "./History.vue";
import PairPredict from "./PairPredict.vue";

// import SymPredict from "./SymPredict.vue";
// import RepeatPredict from "./RepeatPredict.vue";
// import SequencePredict from "./SequencePredict.vue";
// import CombinePredict from "./CombinePredict.vue";

export default {
  name: "App",
  data() {
    return {
      activeName: "second",
    };
  },
  components: {
    History,
    PairPredict,
    SymPredict: () => import("./SymPredict.vue"),
    RepeatPredict: () => import("./RepeatPredict.vue"),
    SequencePredict: () => import("./SequencePredict.vue"),
    CombinePredict: () => import("./CombinePredict.vue"),
  },
  methods: {},
};
</script>

<style>
#app {
  max-width: 500px;
  margin: 0 auto;
}
</style>
