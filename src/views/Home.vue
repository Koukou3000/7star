<template>
  <div id="app">
    <el-tabs v-model="currentTab" type="card" @tab-click="handleTabClick">
      <el-tab-pane label="历史" name="/plw/history"></el-tab-pane>
      <el-tab-pane label="配对" name="/plw/pair"></el-tab-pane>
      <el-tab-pane label="对称" name="/plw/sym"></el-tab-pane>
      <el-tab-pane label="重复" name="/plw/repeat"></el-tab-pane>
      <el-tab-pane label="顺序" name="/plw/sequence"></el-tab-pane>
      <el-tab-pane label="综合" name="/plw/combine"></el-tab-pane>
    </el-tabs>

    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: "App",
  computed: {
    // 动态同步：防止用户点击浏览器前进/后退时，Tab 高亮位置不跟着动
    currentTab: {
      get() {
        return this.$route.path;
      },
      set() {} // 路由跳转由 handleTabClick 负责，这里给个空函数即可
    }
  },
  methods: {
    handleTabClick(tab) {
      // 当点击 Tab 时，触发路由跳转
      if (this.$route.path !== tab.name) {
        this.$router.push(tab.name);
      }
    }
  },
};
</script>

<style>
#app {
  max-width: 500px;
  margin: 0 auto;
}
</style>
