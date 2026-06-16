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

    <el-button plain round :loading="isLoading" @click="loadMore" :disabled="isLastPage">
      <span>插入 {{ pageSize }} 期</span>
    </el-button>

    <div v-loading="isLoading">
      <el-empty v-if="!isLoading && rows.length === 0">
        <el-button @click="retry">
          <span>重试</span>
        </el-button>
      </el-empty>

      <div v-else class="scroll-wrap">
        <div v-for="(item, index) in rows" :key="item.round" class="line-container">
          <div :class="getRowClass(index)">
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
  name: "History",
  data() {
    return {
      page: 0,
      pageSize: 15,
      isLoading: false,
      isLastPage: false,

      rows: [],
    };
  },
  created() {
    this.loadMore();
  },
  computed: {
    getRowClass() {
      return (index) => (index % 2 === 0 ? "zebra" : "");
    },
  },
  methods: {
    async loadMore() {
      if (this.isLoading || this.isLastPage) return;
      this.isLoading = true;

      try {
        const resp = await api.getrows(this.page * this.pageSize, this.pageSize);
        const newlines = resp.data || [];

        const allRows = [...newlines, ...this.rows];
        const uniqueMap = new Map(allRows.map((item) => [item.round, item]));
        this.rows = [...uniqueMap.values()].sort((a, b) => a.round - b.round);

        // 后端返回了0条，或不满一页的数据
        if (newlines.length < this.pageSize) {
          this.isLastPage = true;
        } else {
          this.page += 1; // 获取到了一页数据，页码+1
          this.isLastPage = false;
        }
      } catch (e) {
        if (e && e.message === "canceled") return; // axios.isCancel(e)
        console.log(e.message);
      } finally {
        this.isLoading = false;
      }
    },
    retry() {
      this.page = 0;
      this.isLastPage = false
      this.rows = []
      this.loadMore();
      return;
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
