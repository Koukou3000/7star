<template>
  <div>
    <el-row>
      <el-col :span="4" class="numbers">期数</el-col>
      <el-col :span="4" align="center">万</el-col>
      <el-col :span="4" align="center">千</el-col>
      <el-col :span="4" align="center">百</el-col>
      <el-col :span="4" align="center">十</el-col>
      <el-col :span="4" align="center">个</el-col>
    </el-row>

    <el-button
      plain
      round
      :loading="isLoading"
      @click="getMoreResult()"
      :disabled="!hasMore"
    >
      <!-- 请求返回空数据，触发重试 -->
      <span v-if="!this.isLoading && this.results.length == 0">重试</span>
      <span v-else>插入 {{ pageSize }} 期</span>
    </el-button>

    <div v-loading="isLoading">
    
      <el-empty v-if="!this.isLoading && this.results.length == 0"></el-empty>

      <div v-else class="scroll-wrap">
        <div v-for="(item, index) in results" :key="item.round" class="line-container">

          <div :class='index % 2 === 0 ? "zebra" : ""'>
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
      hasMore: true,

      results: [],
    };
  },
  activated() {
    this.getResult();
  },
  methods: {
    async getResult() {
      if (this.isLoading || !this.hasMore) return;
      this.isLoading = true;

      try {
        const resp = await api.getResults(this.page * this.pageSize, this.pageSize);
        const newlines = resp.data;
        const sortedLines = [...newlines].sort((a, b) => a.round - b.round);

        const uniqueMap = new Map();
        sortedLines.forEach((item) => uniqueMap.set(item.round, item)); // 1. uniqueMap先塞新数据
        this.results.forEach((item) => uniqueMap.set(item.round, item)); // 2. 后塞老数据
        this.results = [...uniqueMap.values()];

        // 模拟返回空数据
        // this.results.splice(0)

        // 最后一页？
        if (newlines.length < this.pageSize) {
          this.hasMore = false;
        }
      } catch (e) {
        if (e && e.message === "canceled") return; // axios.isCancel(e)
        // 添加可能的错误场景？
        console.log(e);
      } finally {
        this.isLoading = false;
      }
    },
    getMoreResult() {
      if (this.results.length == 0) {
        this.page = 0;
      } else {
        this.page += 1;
      }
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
