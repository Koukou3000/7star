## 功能迭代待办清单

### fix
- 设计空场景 & 错误场景
  - [x] History 
  - [x] Pair
  - [x] Rept
  - [x] Seq
  - [x] Sym
  - [ ] Combine

- 留下最新的请求
  - [x] Pair
  - [ ] Rept
  - [ ] Seq
  - [x] Sym
  - [ ] Combine

- 切换tab时，如果先前有数据就不再多请求一次
  - [x] Pair
  - [ ] Rept
  - [ ] Seq
  - [x] Sym
  - [ ] Combine

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
- [ ] 数据库更新导致History底部数据多了一行 【socket】
- [ ] 页签辨识度低【后续迁移到antds/ element plus】
- [ ] 使用echarts显示一些无效数据
- [ ] 斩龙
- [ ] 根据本期期号查询上一期（针对跨年）
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
