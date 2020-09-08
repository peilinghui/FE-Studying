



# Axios在vue中的使用


学习笔记：慕课网：<https://www.imooc.com/learn/1152>


# Axios的定义：

基于Promise的HTTP库，是继AJAX、Fetch后又一种前端请求服务器端接口的方式。

Axios的应用：既可以用于浏览器（客户端），也可以用于Node.js（服务器端）。

Axios的特性

1.支持Promise API

2.拦截请求和响应

3.转换请求数据和响应数据

4.取消请求 

5.自动转换json数据

6.客户端支持防御XSRF攻击


#  axios方法的基本使用

删除vue2.* : npm uninstall -g vue-cli

安装vue3.*: npm install -g @vue/cli

创建项目： vue create vue-demo

yarn add axios



axios请求方法：get,post,put,patch,delete

    get: 获取数据
    post: 提交数据（表单提交+文件上传）
    put: 更新数据 （所有数据推送到后端）
    patch: 更新数据（只将修改的数据推送到后端）
    delete: 删除数据



### get方法



```
 //   http://localhost:8080/data.json?id=12
    axios.get('/data.json',{
        params:{
            id:12
        }
    }).then((res)=>{
      console.log(res)
    })
```
````
    axios({
        method:'get',
        url:'/data.json',
        params:{
            id:12
        }
    }).then(res=>{
        console.log(res)
    })
```


### post方法

```
 // form-data 表单提交（图片上传，文件上传）
 // applicition/json
let data ={
        id:12
    }
    axios.post('/post',data).then(res=>{
        console.log(res)
    })
    axios({
        method:'post',
        url:'/post',
        data:data
    }).then(res=>{
        console.log(res)
    })
    // form-data请求
    let formData = new FormData()
    for(let key in data){
        formData.append(key,data[key])
    }
    axios.post('/post',formData).then(res=>{
        console.log(res)
    })
```


### put请求，patch请求，delete请求

```
 // put请求
    axios.put('/put',data).then(res=>{
        console.log(res)
    })
    // patch请求
    axios.patch('/patch',data).then(res=>{
        console.log(res)
    })

    // delete请求
    axios.delete('/delete',{
        params:{
            id:12
        }
    }).then(res=>{
        console.log(res)
    })
    axios.delete('/delete',{
        data:{
            id:12
        }
    }).then(res=>{
        console.log(res)
    })
    axios({
        method:'delete',
        url:'/delete',
        params:{},
        data:{}
    }).then(res=>{
        console.log(res)
    })
  },
```


###  并发请求
同时进行多个请求，并统一处理返回值，axios.all() axios.spread()




# axios方法的深入


### 实例的相关配置


```
axios.create({
        baseURL:'http://localhost:8080', // 请求的域名，基本地址
        timeout:1000, // 请求超时时长（ms）
        url:'/data.json', //请求路径
        method:'get,post,put,patch,delete', // 请求方法
        headers:{
            token:''
        }, // 请求头
        params:{}, //请求参数拼接在url上
        data:{}, //请求参数放在请求体
    })

    // 1.axios全局配置
    axios.defaults.timeout =1000
    axios.defaults.baseURL = 'http://localhost:8080'
    // 2.axios实例配置
    let instance = axios.create()
    instance.defaults.timeout = 3000
    // 3.axios请求配置
    instance.get('/data.json',{
        timeout:5000
    })

// 实际开发
    // 有两种请求接口：
    // http:localhost:9090
    // http:localhost:9091
    let instance = axios.create({
      baseURL:'http:localhost:9090',
      timeout:1000
    })
    let instance1 = axios.create({
      baseURL:'http:localhost:9091',
      timeout:3000
    })
    // baseUrl,timeout,url,method,params
    instance.get('/contactList',{
      params:{}
    }).then((res)=>{
      console.log(res)
    })

    // baseUrl ,timeout:5000,method,url
    instance1.get('/orderList',{
      timeout:5000
    }).then(res=>{
      console.log(res)
    })
  },

```



### 拦截器


拦截器：在请求或响应被处理前拦截它们
请求拦截器，响应拦截器


```
// 请求拦截器
    axios.interceptors.request.use(config=>{
        // 在发送请求前做些什么
        return config
    },err=>{
        // 在请求错误的时候做些什么
        return Promise.reject(err)
    })
    // 响应拦截器
    axios.interceptors.response.use(res=>{
        // 请求成功对响应数据做处理
        return res
    },err=>{
        // 响应错误做些什么
        return Promise.reject(err)
    })
 // 取消拦截器（了解）
    let interceptors = axios.interceptors.request.use(config=>{
        config.headers={
            auth:true
        }
        return config
    })
    axios.interceptors.request.eject(interceptors)
```

### 错误处理

错误处理：请求错误时进行的处理
```
 axios.interceptors.request.use(config=>{
        return config
    },err=>{
        return Promise.reject(err)
    })
    axios.interceptors.response.use(res=>{
        return res
    },err=>{
        return Promise.reject(err)
    })
```