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

    <el-button plain round :loading="isLoading" @click="getResult" :disabled="isLastPage">
      <span>插入 {{ pageSize }} 期</span>
    </el-button>

    <div v-loading="isLoading">
    
      <el-empty v-if="!isLoading && this.results.length == 0">
        <el-button @click="retryFetch">
          <span>重试</span>
        </el-button>
      </el-empty>

      <div v-else class="scroll-wrap">
        <div v-for="(item, index) in results" :key="item.round" class="line-container">
          <div :class="index % 2 === 0 ? 'zebra' : ''">
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
      isLastPage: false,

      results: [],
    };
  },
  created() {
    this.getResult();
  },
  methods: {
    async getResult() {
      if (this.isLoading || this.isLastPage) return;
      this.isLoading = true;

      try {
        const resp = await api.getResults(this.page * this.pageSize, this.pageSize);
        const newlines = resp.data || [];
        const sortedLines = [...newlines].sort((a, b) => a.round - b.round);

        if (this.page === 0) {
          this.results = sortedLines
        }
        else {
          const uniqueMap = new Map();
          sortedLines.forEach((item) => uniqueMap.set(item.round, item)); // 1. 新数据在顶部
          this.results.forEach((item) => uniqueMap.set(item.round, item)); // 2. 老数据接在后面
          this.results = [...uniqueMap.values()];
        }

        // 后端返回了0条，或不满一页的数据
        if (newlines.length < this.pageSize) {
          this.isLastPage = true;
        } else {
          this.page += 1; // 获取到了一页数据，页码+1
          this.isLastPage = false
        }
      } catch (e) {
        if (e && e.message === "canceled") return; // axios.isCancel(e)
        console.log(e.message);
      } finally {
        this.isLoading = false;
      }
    },
    retryFetch() {
      if (this.results.length == 0) {
        this.page = 0;
        this.getResult();
        return;
      }
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
