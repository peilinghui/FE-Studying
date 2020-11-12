
## 主要功能

- 首页、体系、公众号、导航、项目五大模块；
- 登录注册功能；
- 搜索功能：热门搜索、搜索历史文章；
- 收藏功能：添加收藏、取消收藏；
- 浏览文章、分享文章；
- 查看常用网站；
- 自定义切换主题颜色功能；
- 多语言切换功能；
- 我的积分明细；
- 关于模块。

RN版本号0.61.


全局：设置app语言环境，设置主题颜色themeColor，网络设置setAxios，缓存用户信息userInfo和登录状态isLogin。
使用DeviceEventEmitter监听：
this.eventEmitter = DeviceEventEmitter.addListener('switchLanguage', () => {
      this.setState({
        drawerData: getDrawerData(),
      });
    });
在 componentWillUnmount() {
    this.eventEmitter && this.eventEmitter.remove();
  }中移除监听。

导航：react-navigation 4.0.10
全局：react-navigation-stack中的栈导航createStackNavigator，
侧边抽屉：react-navigation-drawer中的createDrawerNavigator

底部tab：react-navigation-tabs中的createBottomTabNavigator

抽屉：DrawerScreen
分享：用的是RN自带的Share组件，可以分享到所安装的APP


首页：HomeScreen
CommonFlatList：
在flatList的Onscroll里面监听  

_onScroll(e) {
    const scrollY = e.nativeEvent.contentOffset.y;
    if (scrollY > DEVICE_HEIGHT) {
      this.setState({isShowTop: true});
    } else {
      this.setState({isShowTop: false});
    }
  }
然后点击快速滚动到顶部。
handleScrollToTop() {
    this.flatListRef &&
      this.flatListRef.scrollToOffset({animated: true, offset: 0});
  }
FlatList的上拉加载更多和下拉刷新。


渲染Cell：ArticleItemRow

顶部导航：NavBar

banner放在flatList的header上面。Banner使用的是react-native-swiper




搜索页面：SearchScreen
搜索文章结果页：SearchArticleScreen：CommonFlatList



体系：SystemScreen
CommonFlatList：


公众号：WxArticleScreen
ArticleTabComponent：ArticleFlatList：
CommonFlatList：ArticleItemRow
下拉刷新，上拉加载更多。



导航：GuideScreen
左边是flatList，右边也是flatList，
类似分类，联动

项目：ProjectScreen
ArticleTabComponent：





ArticleTabScreen
ArticleTabComponent：


AboutScreen：关于作者


CoinDetailScreen：积分明细列表

CollectScreen：我的收藏

SettingScreen：设置

WebsitesScreen：常用网站
其他登录和注册



react-native-reanimated



逻辑：

登录和退出登录