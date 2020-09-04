Vue核心技术
Vue+Vue-Router+Vuex+SSR实战精讲



学习笔记：慕课网：<https://coding.imooc.com/class/chapter/196.html#Anchor>


webpack4升级：
1、版本变化
2、配置变化
3、



#  Vue+Webpack的前端工程工作流搭建



# Vue核心知识

## 核心内容配置
vue.esm.js和vue.runtime.esm.js的区别？

vue.js ： vue.js则是直接用script标签中的，完整版本，直接就可以通过script引用。


vue.common.js :预编译调试时，CommonJS规范的格式，可以使用require("")引用的NODEJS格式。
vue.esm.js：预编译调试时， EcmaScript Module（ES MODULE)，支持import from 最新标准的。

vue.runtime.js ：生产的运行时，需要预编译，比完整版小30%左右，前端性能最优
vue.runtime.esm.js：生产运行时，esm标准。
vue.runtime.common.js:生产运行时，commonJS标准。


开发环境用vue.esm.js
生产环境用vue.runtime.esm.js，比完整版小30%左右，前端性能更优


有Runtime是无法用template，无法进行编译。
需要在webpack里面设置alias

```
 resolve: {
    alias: {
      'vue': path.join(__dirname, '../node_modules/vue/dist/vue.esm.js')
    }
  },

```


## Vue的实例


```

const app = new Vue({
  // el: '#root',
  template: '<div ref="div">{{text}} {{obj.a}}</div>',
  data: {
    text: 0,
    obj: {}
  }
  // watch: {
  //   text (newText, oldText) {
  //     console.log(`${newText} : ${oldText}`)
  //   }
  // }
})
app.$mount('#root')
```




## Vue的生命周期




## Vue的数据绑定



## Vue的computed和watch的使用场景和方法

computed：显示拼接数据


Watch：监听某一数据变化，发请求一类的
deep是obj更深层次的属性变化的时候也能监听到，性能开销大，或者是obj.a的监听。

## Vue的原生指令


## Vue的组件之组件的定义


## 组件的extend


## 组件得自定义双向绑定



##  Vue的组件之高级属性

```
new Vue({
  components: {
    CompOne: component
  },
  provide () {
    const data = {}

    Object.defineProperty(data, 'value', {
      get: () => this.value,
      enumerable: true
    })

    return {
      yeye: this,
      data
    }
  },
  el: '#root',
  data () {
    return {
      value: '123'
    }
  },
  mounted () {
    console.log(this.$refs.comp.value, this.$refs.span)
  },
  template: `
    <div>
      <comp-one ref="comp">
        <span slot-scope="props" ref="span">{{props.value}} {{props.aaa}} {{value}}</span>
      </comp-one>
      <input type="text" v-model="value" />
    </div>
  `
})


```

## Vue的组件之render function


```
const component = {
  props: ['props1'],
  name: 'comp',
  // template: `
  //   <div :style="style">
  //     <slot></slot>
  //   </div>
  // `,
  render (createElement) {
    return createElement('div', {
      style: this.style
      // on: {
      //   click: () => { this.$emit('click') }
      // }
    }, [
      this.$slots.header,
      this.props1
    ])
  }
}

```