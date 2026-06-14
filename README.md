## 功能迭代待办清单

### fix
- 给每个页面的请求设计场景
  - [ ] 空场景 （PredictCard :data==[]）
  - [ ] 错误场景 （带重试按钮）

- [ ] 调整 elementUI 为按需引入
- [ ] 分配各组件函数到合适的生命周期，调整各个函数的顺序



### feature
- [ ] sharedRound在History的特效（标记提示用户之前的位置）
- [ ] 用flex调整滚动区域的高度
- [ ] 滑動時 Tab 縮成窄條保留標籤文字
- [ ] 渐隐/碰撞效果（提示用户可以向下滚/滚到底）
- [ ] 插入特效（提示插入15期）
- [ ] combinePredict 新数据插入特效
- [ ] 主页面加载进度条（低速4G时，首页白屏时间）
	

### advance feature
- [ ] 网页绘制、标记数字（canvas）
- [ ] 网页数据加载速度
- [ ] 夜间模式
- [ ] 网站更新（不用刷新） 【socket】
- [ ] 页签辨识度低【后续迁移到antds/ element plus】
- [ ] 使用echarts显示一些无效数据
- [ ] 斩龙
- [ ] 开关数字球形显示（参考彩票500，球亮球暗）
- [ ] RSS信息流提示更新

### server
- [ ] sql预编译+手写简单的白名单 (防止性能损耗)
- [ ] 限制 select * 的使用 (减少内存拷贝)
- [ ] Batch API减少请求stalled时间（N个请求，N个数据库连接、跑N次 SQL 语句、进行N次权限校验。）
```
api.getPredict(tableName, currentRound);
api.getPredictBatch({
  tables: tableNameArr, // ['pairstraight', 'symstraight', ...]
  round: currentRound
});
```
- [ ] createPool时，连接池没有设置上限导致stalled
- [ ] http2