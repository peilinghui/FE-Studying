# API 文档

## 基本概念

领域 RESTFul API 包括如下几种类型：

- 数据列表类 (GET)
- 单个资源类 (GET)
- 增添资源类 (POST)
- 删除资源类 (DELETE)
- 修改资源类 (PUT)



其中，数据列表类 API 通常采用两种不同的分页模式

- 基于 Cursor 的分页
  - 以某个 datetime 作为分页标识
  - 需要三个 Query Params
    - cursorKey：用于分页的日期数据列，例如 createdAt / lastTopicAt
    - cursorOperator：greaterThan 或 lessThan
    - cursorValue：datetime 字符串
- 基于 Offset 的分页
  - 需要一个 Query Params
    - offset：跳过前N条结果，N为正整数

通常，具有严格日期属性的数据列表采用 Cursor 分页，例如 “我加入的领域”，“最新Topics”，“我创建的领域” 之类

而日期属性不明显的 API 通常使用 Offset 分页，例如 “我的好友”，“共同关注的人” 之类



数据列表类型 API 同时具有以下常见 Query Params：

- 排序
  - sortMode：ascending 或 descending
  - sortKey：用于排序的日期数据列，例如 createdAt / lastTopicAt
- 限制返回条数
  - limit：限制返回N条记录，1 <= N <= 40



任意类型的 API 可具有以下几个常见的用户相关参数：

- myView：设置为1的时候将以当前用户视角返回数据
- createdOnly：设置为1时只返回由当前用户创建的数据
- getInfoForUserId：同时获得与某个userId相关的计算属性 (computed)



## API 列表

https://documenter.getpostman.com/view/1600243/S11Byhjt

这里是 API 列表，参数属性的介绍正在持续补全中