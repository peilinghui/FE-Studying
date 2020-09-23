React Native从入门到实战打造高质量上线App




# 2、基础理论知识

## ES6和ES7基础

ES6新特性：
1、类
2、模块化（import和export）
3、箭头函数
4、函数参数默认值
5、模板字符串
6、解构赋值
7、延展操作符
8、对象属性简写
9、Promise
10、let与const

在ES7之前：indexOf()函数来验证数组中是否存在某个元素，这时需要根据返回值是否为-1来判断。
使用ES7的includes()更直观。

在ES7里面引入了指数运算符**，**具有与Math.pow(..)等效的计算结果。

ES8的特性：
1、async/await
2、Object.value()
3、Object.entries()
4、String padding
5、函数参数列表结尾允许逗号
6、Object.getOwnPropertyDescriptors()获取对象自由属性描述。






# 3、导航react-navigtion

3.0的变更
1、使用了createAppContainer包裹,当
2、引入第三方Gesture-handler
3，navigationOptions被重命名为了defaultNavigationOptions


导航框架的搭建：
Tab




# 4、关于Redux与react-Navigation的项目框架搭建

## 什么是redux?

状态管理，工作流：

 **1、用户操作View发出Action，发出方式就用到了dispatch方法  
2、然后，store自动调用Reducer，并且传入两个参数（当前state和收到的action），reducer会返回新的state，如果有Middleware，store会将当前state和收到的Action传递给Middleware，Middleware会调用Reducer然后返回新的State。  
3、state一旦有变化，store就会调用监听函数，来更新View**


所有的数据流都是单向的。

## redux和flux的对比有什么不同？为什么要用Redux?
优点：可预测，易维护，可测试

帮我们管理state，包括服务器响应，缓存数据，本地生成的尚未持久化到服务的数据，也包括UI状态，如：激活的路由，被选中的标签，是否显示加载动效或者是分页器等。
 
## Redux的三个基本原则
1、单一数据源，整个应用的state被存在一个object tree中，并且这个object tree只存在于唯一一个store中。
2、state是只读的：唯一改变state的方法就是触发action，action是一个用于描述已发生事件的普通对象。
3、使用纯函数来执行修改：为了描述action如何改变state tree ，你需要编写reducers。


## Redux有那几部分构成？
1、action：action就是一个描述发生什么的对象
2、reducer:形式为(state,action)=>state的纯函数，功能是根据action修改state将其转变成下一个state。
3、store：用于存储state，整个应用就一个store。

## 高级：什么是异步Action？如何处理异步数据流？

对于网络请求数据库加载等应用场景同步action不适用，需要用到异步Action。

在Action中进行异步操作等操作返回后再dispatch一个action。

引入Redux-thunk库。中间件。

## 1、React-Redux

视图层绑定引入了下面几个概念

1、<Provider>组件：这个组件需要包裹在整个组件树的最外层，这个组件让根组件的所有子孙组件能够轻松的使用connect()方法绑定store。

2、connect():这是react-redux提供的一个方法。如果一个组件想要响应状态的变化，就把组件作为参数传给connect()的结果，connect()方法会处理与store绑定的细节，并通过selector确定该绑定store中哪一部分的数据。

3、selector：这是你自己编写的一个函数。这个函数声明了你的组件需要整个store中那一部分数据作为自己的props。

4、dispatch：每当你想要改变应用中的状态时，你就要dispatch一个action，这也是唯一改变状态的方法。

 ## react-navigation-redux-helpers

import {
  createReduxContainer,
  createReactNavigationReduxMiddleware,
  createNavigationReducer,
} from 'react-navigation-redux-helpers'






1、初始化react-navigation与redux的中间件

export const routerMiddleware = createReactNavigationReduxMiddleware(
    'root',
    (state) => state.nav,
  )

2、将根导航组件传递给reduxifyNavigator函数，并返回一个将Navigation state 和dispatch函数作为props的新组件，注意：要在createReactNavigationReduxMiddleware之后执行。

const AppWithNavigationState = reduxifyNavigator(RooNavigator,'root');


3、state到Props的映射关系

const mapStateToProps = state =>({
    state: state.nav,
})

4、 连接React组件与Redux store
export default connect(mapStateToProps)(AppWithNavigationState);


## 2、配置Reducer

//1、指定默认的state

const navState = RooNavigator.router.getStateForAction(RooNavigator.router.getActionForPathAndParams(rootCom))


// 2、创建自己的 navigation reducer
const navReducer  = (state = navState,action)=>{
    const nextState = RooNavigator.router.getStateForAction(action, state);

    return nextState || state;
}

/**
 * 3、用于合并reducer
 * @type {Reducer<CombinedState<any>> | Reducer<CombinedState<any>, AnyAction> | Reducer<CombinedState<StateFromReducersMapObject<{}>>, ActionFromReducersMapObject<{}>>}
 */
const index = combineReducers({
    nav:navReducer
});


## 3、配置store


import {applyMiddleware,createStore} from "redux"
import thunk from "redux-thunk"
import reducer from "../reducer/index"
import { middleware } from '../navigator/AppNavigator'

/**
 * 自定义中间件
 * @param store
 * @returns {function(*): Function}
 */
const logger = store => next => action =>{
    if (typeof  action === 'function'){
        console.log("dispatching a function")
    }else{
        console.log("dispatching",action)
    }
    const result = next(action);
    console.log("nextState",store.getState());
    return result;
};

const middlewares = [
    middleware,
    thunk,
    logger
];
/**
 * 创建store
 */
export default createStore(reducer,applyMiddleware(...middlewares));


## 4、在组件中应用
import React,{Component} from "react"
import {Provider} from "react-redux"
import AppNavigator from "./navigator/AppNavigator"
import store from "./store/index"

export default class App extends Component{
    render(){
        /**
         * 将store传递给App框架
         */
        return <Provider store={store}>
            <AppNavigator/>
        </Provider>
    }
}

上述4步完成了react-Navigation  +  Redux的集成，那么如何使用？

## react-Navigation  +  Redux

1、 订阅state

   












## 6.最热模块开发
FlatList是基于VirtualizedList，

VirtualizedList有以下特性：

- 支持滚动加载(具体可以借助onEndReached的回调，做数据动态加载)；
- 支持下拉刷新(借助onRefresh / refreshing属性实现)；
- 支持可配置的可见性（VPV）回调（借助onViewableItemsChanged / viewabilityConfig实现）
- 滑动方向增加对Horizontal(水平)方向的支持；
- 更加智能的Item以及section separators支持；
- 支持Multi-column(借助numColumns属性实现)；
- 添加scrollToEnd, scrollToIndex, 和 scrollToItem方法的支持；
- 对 Flow更加友好；

1、基于redux+FlatList实现列表页数据加载？
2、设计最热模块的state树
3、如何操作异步action与数据流？
4、如何动态的设置store和获取store？
5、如何灵活应用connect？
6、action如何和调用页面进行交互
7、FlatList的高级应用于加载更多的优化？
8、其他实战经验

