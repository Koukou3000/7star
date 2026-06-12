## 功能迭代待办清单

### fix
- [x] 切换页面时cancel多余请求  【路由守卫+拦截器】
- [x] 组件keep-alive，watch在后台监听到变化 【添加isActivated变量用于控制】
- [x] 统一管理各页面的tableName 【引用单一数据源@/constants】 
- [ ] 请求中切换期号，防抖会拦截请求发送失败；不防抖则会出现数据异步竞态问题（Race Condition）
- [ ] CombinePredict请求冗余（14个请求，实际上只需要8次）

- [ ] 给每个页面的请求设计失败场景
- [ ] 调整 elementUI 为按需引入
- [ ] 分配各组件函数到合适的生命周期，调整各个函数的顺序
- [ ] 将CombinePredict的勾选记录存储在本地（localstorage）


### feature
- [ ] sharedRound在History的特效（标记提示用户之前的位置）
- [ ] 用flex调整滚动区域的高度
- [ ] 滑動時 Tab 縮成窄條保留標籤文字
- [ ] 渐隐/碰撞效果（提示用户可以向下滚/滚到底）
- [ ] 插入特效（提示插入15期）
- [ ] 主页面加载进度条（低速4G时，首页白屏时间）
	

### advance feature
- [ ] 网页绘制、标记数字（canvas）
- [ ] 网页数据加载速度
- [ ] 夜间模式
- [ ] 网站更新（不用刷新） 【socket】
- [ ] RSS信息流提示更新
- [ ] 页签辨识度低【后续迁移到antds/ element plus】
- [ ] 使用echarts显示一些无效数据
- [ ] 斩龙

### others
- [ ] sql预编译+手写简单的白名单 (防止性能损耗)
- [ ] 限制 select * 的使用 (减少内存拷贝)
- [ ] createPool时，连接池没有设置上限导致排队