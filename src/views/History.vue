<template>
  <div>
    <el-button
      plain
      round
      :loading="isLoading"
      @click="getMoreResult()"
      :disabled="!hasMore"
      >插入前 15 期
    </el-button>

    <el-row>
      <el-col :span="4" class="numbers">期数</el-col>
      <el-col :span="4" align="center">万</el-col>
      <el-col :span="4" align="center">千</el-col>
      <el-col :span="4" align="center">百</el-col>
      <el-col :span="4" align="center">十</el-col>
      <el-col :span="4" align="center">个</el-col>
    </el-row>

    <div class="scroll-wrap" v-loading="isLoading">
      <div v-for="(item, index) in results" :key="item.round" class="line-container">
        <div :class="[zebraCSS(index)]">
          <el-row>
            <el-col :span="4" class="numbers">{{ item.round }}</el-col>
            <el-col :span="4" align="center">{{ item.myriabit }}</el-col>
            <el-col :span="4" align="center">{{ item.thousand }}</el-col>
            <el-col :span="4" align="center">{{ item.hundred }}</el-col>
            <el-col :span="4" align="center">{{ item.ten }}</el-col>
            <el-col :span="4" align="center">{{ item.one }}</el-col>
          </el-row>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { api } from "../api";

export default {
  name: "RoundResult",
  data() {
    return {
      page: 0,
      pageSize: 15,
      isLoading: false,

      map:[],
      results: [],
      hasMore: true,
    };
  },
  computed: {
    zebraCSS() {
      return (index) => {
        return index % 2 === 0 ? "zebra" : "";
      };
    },
    start() {
      return this.page * this.pageSize;
    },
  },
  activated() {
    this.getResult();
  },
  methods: {
    async getResult() {
      if (this.isLoading || !this.hasMore) return;
      this.isLoading = true;

      try {
        const resp = await api.getResults(this.start, this.pageSize);
        const newlines = resp.data;
        const sortedLines = [...newlines].sort((a, b) => a.round - b.round);

        const uniqueMap = new Map();
        sortedLines.forEach(item => uniqueMap.set(item.round, item)); // 1. uniqueMap先塞新数据
        this.results.forEach(item => uniqueMap.set(item.round, item)) // 2. 后塞老数据
        this.results = [...uniqueMap.values()]

        // 分页判断
        if (newlines.length < this.pageSize) {
          this.hasMore = false;
        }
      } catch (e) {
        if (e && e.message === "canceled") return; // axios.isCancel(e) 
        console.log(e);
      } finally {
        this.isLoading = false;
      }
    },
    getMoreResult() {
      this.page += 1;
      this.getResult();
    },
  },
};
</script>

<style>
.line-container {
  height: 60px;
  line-height: 60px;
  background-color: #fff;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  font-weight: bold;
  font-size: 30px;
}
.zebra {
  background-color: #f7f7f7;
}
.el-col {
  line-height: 60px;
}
.numbers {
  font-size: 20px;
  color: darkred;
}
html,
body {
  height: 99%;
}
.scroll-wrap {
  height: 82vh;
  overflow-y: scroll;
}
</style>
