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

    <!-- 获取数据时出现错误 -->
    <div v-if="isError">
      <el-result icon="error" :subTitle="errorMessage">
        <template slot="extra">
          <el-button :loading="isLoading" @click="loadMore">
            <span>重试</span>
          </el-button>
        </template>
      </el-result>
    </div>   
    
    <div v-else>
      <el-button :loading="isLoading" @click="loadMore">
        <span>插入 {{ pageSize }} 期</span>
      </el-button>

      <div v-loading="isLoading">

        <!-- 获取的数据为空 -->
        <el-empty v-if="!isLoading && rows.length === 0"></el-empty>

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
      isError: false,
      errorMessage: '',

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
      if (this.isLoading) return;
      this.isLoading = true;
      this.isError = false;
      
      try {
        const resp = await api.getResults(this.page * this.pageSize, this.pageSize);

        // 判断数据是否符合要求 isError
        if (!resp || !Array.isArray(resp.data)) {
          throw new Error("返回数据格式不正确"); 
        }
        // 符合类型要求才拼接数据
        const newlines = resp.data || [];
        // const newlines = 1  // 模拟类型错误
        // const newlines = [] // 模拟获取空数据

        this.concatRows(newlines)
      
      } catch (e) {
        if (e && e.message === "canceled") return; // axios.isCancel(e)
        this.handleError(e)
      } finally {
        this.isLoading = false;
      }
    },
    handleError(e) {
      this.isError = true
      this.errorMessage = e.message
      console.error(e)
    },
    concatRows(newlines) {
      const allRows = [...newlines, ...this.rows];
      const uniqueMap = new Map(allRows.map((item) => [item.round, item]));
      this.rows = [...uniqueMap.values()].sort((a, b) => a.round - b.round);

      // 新数据长度和页码相同，说明还有更多数据可以获取
      if (newlines.length === this.pageSize) {
        this.page += 1
      }
    }
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
