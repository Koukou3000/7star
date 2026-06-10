<template>
  <div id="app">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="历史" name="first">
        <History />
      </el-tab-pane>
      <el-tab-pane label="配对" name="second">
        <pair-predict />
      </el-tab-pane>
      <el-tab-pane label="对称" name="third">
        <sym-predict />
      </el-tab-pane>
      <el-tab-pane label="重复" name="fourth">
        <repeat-predict />
      </el-tab-pane>
      <el-tab-pane label="顺序" name="fifth">
        <sequence-predict />
      </el-tab-pane>
      <el-tab-pane label="综合" name="sixth">
        <combine-predict />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import History from "./History.vue";
import PairPredict from "./PairPredict.vue";

import SymPredict from "./SymPredict.vue";
import RepeatPredict from "./RepeatPredict.vue";
import SequencePredict from "./SequencePredict.vue";
import CombinePredict from "./CombinePredict.vue";

export default {
  name: "App",
  data() {
    return {
      activeName: "sixth",
    };
  },
  components: {
    History,
    PairPredict,
    SymPredict,
    RepeatPredict,
    SequencePredict,
    CombinePredict,
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
