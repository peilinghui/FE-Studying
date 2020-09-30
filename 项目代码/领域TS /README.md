RealmApp

# 配置工程
拉代码 yarn install，react-native link ,react-native run-ios
## 运行iOS：
// if (!version.startsWith('iOS') && !version.startsWith('tvOS')) {
// continue;
// }
if (!version.startsWith('com.apple.CoreSimulator.SimRuntime.iOS') && !version.startsWith('com.apple.CoreSimulator.SimRuntime.tvOS')) {
continue;
}

## 安卓配置好环境变量和下载对应的 SDK Platform 
1.环境变量：vim ~/.bashrc
2.android 文件夹下的 gradlew 命令 添加权限:chmod 755 android/gradlew 
3.检查下/android/local.properties，改为自己 sdk 位置
react-native run-android
安卓模拟器运行：Genymotion

adb devices 设备列表

安卓真机运行：adb reverse tcp:8081 tcp:8081

## 安卓打包
在工程目录下将index.android.bundle下载并保存到assets资源文件夹中

curl -k "http://localhost:8081/index.android.bundle" > android/app/src/main/assets/index.android.bundle

在/android/目录中执行gradle assembleRelease命令，打包后的文件在 android/app/build/outputs/apk目录中，例如app-release.apk。如果打包碰到问题可以先执行 gradle clean 清理一下。


# 项目结构：
文件入口是 index.tsx。用的是 dva 的创建 APP 方式。
导航是 router.tsx.检查版本更新，安卓物理返回键。
页面跳转：NavigationActions.navigate


##项目目录结构
```
├── ios
├── android
└── src
    ├── assets         			图片资源
    ├── components  			组件(仅可能做到与数据无关， 以便于复用)
    ├── constants      
    ├── models 				  
    ├── patchs				     
    ├── i18n				      多语言相关
    ├── routes	
    ├── screens		            	页面
    ├── services		   
    └── utils              
```


## 登录模块：

导航：AuthRouter，界面显示：LoginScreen， 
1.手机登录：测试账号：密码：1111
MobileLogin 
2.推荐用户：RecommendUser，单个 cell：RecommendUserCell 
3.推荐领域：RecommendRealm，单个 cell：RecommendRealmCell
登录模块跳转主模块：在 auth.ts 中 NavigationActions.navigate

## 主模块：

导航：AppRouter ，界面显示：

Tab 导航：TabRouter，在 screens/Home

### 第一个 Tab:RealmListScreen

点击头像：UserViewer  
点击创建领域：RealmCreator
FlatList 布局,列表头 header 和列表尾 footer，list 为空的布局，下拉刷新和上拉加载更多
组件：
头像：Avatar
单个 cell：RealmCard 每个领域的卡片:在'../../components/RealmCard'
点击 cell 进入：RealmViewer
header:scrollView,点击进入关注的人的最近动态：Story

### 第二个 Tab:DiscoverScreen

推荐页面：RecommendationScene
搜索页面：search
推荐领域Cell:RealmCard。在'../../components/discover/RealmCard'
专题页面：TopicScene

新的发现页面：

### 第三个 Tab:讨论私信页面:DiscussionScreen

FlatList
单个 Cell：TopicCardMini
点击 cell：TopicViewer
私信：List.tsx。单个Cell：ChatCard
聊天页面：Detail.tsx
BranchView：话题显示，手势动画，滑动
BranchItem
BranchAddButton

### 第四个 Tab：PersonalScreen：Personal.tsx

用户页面：UserViewer

跳转通知页面:Notification
认同页面：Agree
关注页面；Follower
账户设置：Setting
姓名:nickname
简介:intro,
常驻地:location,
学校:school,

## 创建领域 screens/Realm

RealmCreatorScreen：step1,2,3,4
CreateFinish：创建完成页面
RealmViewer：进入领域页面
组件：
底部抽屉：BottomDrawer

## 领域页面：**RealmViewer**
react-native-swiper:包裹了 TopicList(讨论)和 MemberList(成员)

包裹了 TopicList:使用的是 RecyclerListView，有下拉刷新和上拉加载更多
话题 Cell:TopicCard :点击跳转到 TopicViewer
创建新话题：TopicCreatorScreen
添加标签：AddTag

## 话题 screens/Topic

创建新话题：TopicCreator
话题:TopicViewer

底部抽屉：BottomDrawer
Modal:
添加标签：AddTagModal
发送话题：TopicModal
发送领域：RealmModal

## TopicViewer

话题页面：有讨论，修改讨论的样式，从底部抽屉改成一体式滑动
消息Cell：MessageCard
消息Card：ImageCard
领域Card：RealmCard
话题Card：TopicCard
链接Card：LinkCard
## 用户 screens/User

UserViewerScreen
关注按钮：组件：Follower
新增形象：AddFigureModal
表情选择：第三方：react-native-emoji-selector
移除形象：Figure.tsx
所在领域：RealmCard 在在'../../components/User/RealmCard'
# 数据存储

在 Model 文件夹
Dva:dva 首先是一个基于 redux 和 redux-saga 的数据流方案，然后为了简化开发体验，dva 还额外内置了 react-router 和 fetch。
dva 通过 model 的概念把一个领域的模型管理起来，包含同步更新 state 的 reducers，处理异步逻辑的 effects，订阅数据源的 subscriptions 。
export default {
namespace: 'products',
state: [],
reducers: {
'delete'(state, { payload: id }) {
return state.filter(item => item.id !== id);
},
},
};

namespace 表示在全局 state 上的 key
state 是初始值，在这里是空数组
reducers 等同于 redux 里的 reducer，接收 action，同步更新 state

使用 connect 把 model 和 component 串联起来。

# 网络请求

services 文件夹：使用 axios 异步

发现页面：数据：models/discover.ts，网络请求：services/discover.ts
推荐用户：数据

### OffSet:

在领域的成员页面用的是 offset 的分页模式：每 40 个请求一次，0，40，80，需要把请求的数据放在 state 中，然后进行拼接，当列表上拉加载更多的时候进行判断调用

### Cursor

在讨论的消息页面中请求消息用的是 Cursor 的分页模式,第一次获取的时候 createdAt 这个值为 null，第二次翻页的时候把最后一条的 createdAt（时间戳）作为 cursor，
分页模式：

- cursorKey：用于分页的日期数据列，例如 createdAt / lastTopicAt
- cursorOperator：greaterThan 或 lessThan
- cursorValue：datetime 字符串

# 遇到的问题：

## 安卓页面适配

布局页面的时候，导入 import { winWidth, convert } from "../../utils/radio";
在写大小的时候数字的时候，marginLeft: convert(10),用来适配不同的屏幕和字体

## 键盘遮挡问题

1.keybordavoidview
2.react-native-aware-scrollView 
3.设置 flatList 的头部或者尾部视图的高度
4.react-native-keyboard-aware-scroll-view
## 监听 scrollView，FlatList，等列表的滑动位置，快速滑动到顶部或者是底部

<FlatList ref={ref => this.flatListRef = ref;} />
this.flatListRef.scrollToIndex(xxx)
this.flatListRef.scrollToEnd()

## 通知推送

在 services 中有 push-notification，用的是 leancloud。
在 app.ts 中 createNotificationChannel，监听然后把接收到的 notification 的 JSON 数据解析，然后根据类型跳转到对应的页面
如果类型是：
跳转 TopicViewer：传入 topicId

跳转 UserViewer：传入 userId

跳转 RealmViewer：传入 realmId

## 打开外部链接：Linking.openURL(next.downloadUrl)


## 动态识别label中的URL链接并打开
react-native-hyperlink


## RN 保存网络图片到相册，
IOS用CameraRoll很容易就实现了，
Android稍微要麻烦点，思路是用库react-native-fetch-blob
下载图片到本地并拿到它的路径，然后用CameraRoll把图片塞到相册里
再把下载下来的图片删除掉。


## 图片压缩：react-native-image-resizer

## 图片缓存：
react-native-cached-image
react-native-rn-cacheimage
只能缓存网络图片，不能缓存本地图片
react-native-fast-image

## 优化RN性能：
react-addons-pure-render-mixin
react-immutable-render-mixin：配合immutable使用

react-addons-shallow-compare:在ES6中用

## 列表逆转：   react-native-invertible-scroll-view

## 埋点：诸葛IO，

## 通知：LeanCloud


未解决的问题：
1.分享topic的小程序到微信会话：原因：react-native-WeChat暂不支持
2.领域添加URL地址的时候，获取URL的title和description，解决方案：利用后端接口。



待优化问题：
1.分享长图不清晰--ShareLongPicNew--待完善

2.网络请求很慢

3.