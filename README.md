## 功能迭代待办清单

### fix
- [x] 切换页面时cancel多余请求  【路由守卫+拦截器】
- [x] 组件keep-alive，watch在后台监听到变化 【添加isActivated变量用于控制】
- [x] 统一管理各页面的tableName 【引用单一数据源@/constants】 
- [x] 重新设计请求中切换期号的场景（取消防抖拦截请求；比对期号解决数据异步竞态问题）
- [ ] CombinePredict请求冗余（初始化请求了两遍；每遍14个请求，实际上只需要8次）
- [ ] 给每个页面的请求设计失败场景（PredictCard :data==[]）
- [ ] 调整 elementUI 为按需引入
- [ ] 分配各组件函数到合适的生命周期，调整各个函数的顺序
- [ ] 将CombinePredict的勾选记录存储在本地（localstorage）


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