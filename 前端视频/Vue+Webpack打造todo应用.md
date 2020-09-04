Vue+Webpack打造todo应用

慕课网：<https://www.imooc.com/learn/935>


一、前端的价值：

1、搭建前端工程：数据缓存、es6和less（可以加快开发效率）。
2、网络优化：http(所有静态资源都是通过http请求的)。

3、api定制。

4、node.js层。

网络优化：

- 减少http请求

- 压缩静态资源文件

- 使用浏览器强缓存使浏览器的流量变更小、加载速度更快

- 重点难点不是业务开发、性能要求并不是很高，不会做在线ps一样的应用

- 最重要的是前端工程化的问题。


## webpack.config.base


设置webpack-Dev-server


```
const devServer = {
  port: 8000,
  host: '0.0.0.0',
  overlay: {
    errors: true
  },
  headers: { 'Access-Control-Allow-Origin': '*' },
  historyApiFallback: {
    index: '/public/index.html'
  },
  proxy: {
    '/api': 'http://127.0.0.1:3333',
    '/user': 'http://127.0.0.1:3333'
  },
  hot: true
}
```

## Vue2
1、数据绑定

2、Vue文件开发方式：组件化，写组件比较方便

3、render方法：（Vue的核心实现也变成了虚拟Dom），数据变化时启动render方法更新HTML

    template标签里的所有节点最终都是通过render方法中的createElement方法创建一个个节点，得到一个节点树

5、要真正理解Vue的开发模式我们要理解它的render方法，这是我们深入理解Vue很需要掌握的一个知识

6、vue的api重点：生命周期方法、computed，



## 配置vue的jsx写法以及postcss


1、npm i postcss-loader autoprefixer babel-loader babel-core babel-preset-env babel-plugin-transform-vue-jsx babel-helper-vue-jsx-merge-props babel-plugin-syntax-jsx

postcss-loader：后处理css的 
autoprefixer 自动加浏览器前缀自动处理.

2、postcss.config.js配置脚本内容：

const autoprefixer = require('autoprefixer')

module.exports = {

    plugins:[

        autoprefixer()

    ]

}

3、.babelrc配置脚本内容：

```
{
    "presets"：[
        "env"
    ],

    "plugins":[
        "transform-vue-jsx"
    ]
}
```

4、webpack.config.js修改地方

```
{
    test:/\.jsx$/,
    loader： 'babel-loader'
}
{
test:/\.styl/,
use:[
    'style-loader',
    'css-loader',
    {
        loader: 'postcss-loader',
        options:{
            sourceMap: true,  //使用已有的sourceMap
        },
        'stylus-loader'  //自动生成sourceMap
    }
]
}
```