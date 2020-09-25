import { AsyncStorage } from 'react-native'
import axios from 'axios'
import { current, detail as userDetail, login as userLogin, wechatAccessToken, wechatLogin,isLanded } from '../services/user'
import { NavigationActions, StackActions } from "react-navigation"

export interface AuthState {
  loading: Boolean
  token?: String
}

export default {
  namespace: 'auth',
  state: {
    loading: true,
    token: null,
    user: null,
    detail: null,
  },
  reducers: {
    updateState(state: AuthState, { payload }: any) {
      return { ...state, ...payload }
    },
    updateUser(state: AuthState, { user }: any) {
      return { ...state, user }
    },
    updateDetail(state: AuthState, { detail }: any) {
      return { ...state, detail }
    },
  },
  effects: {
    *loadStorage(action: any, { call, put }: any) {
      const token = yield call(AsyncStorage.getItem, 'token')
      yield put({ type: 'updateState', payload: { token, loading: false } })
      if (token) {
        axios.defaults.headers.common.token = token
        yield put({ type: 'currentUser' })
      } else {
        yield put(StackActions.reset({
          index: 0,
          key: null,
          actions: [NavigationActions.navigate({ routeName: 'Login' })],
        })
        )
      }
    },
    *currentUser(action: any, { call, put }: any) {
      const user = yield call(current)
      yield put({ type: 'updateUser', user })
      yield put({ type: 'loginSuccess' })
    },
    *login({ countryCode, mobile, password, callback, onError }: any, { call, put }: any) {
      try {
        const { token, user,isLanded } = yield call(userLogin, { countryCode, mobile, password })
        yield call(AsyncStorage.setItem, 'token', token)
        axios.defaults.headers.common.token = token
        yield put({ type: 'updateState', payload: { token, loading: false } })
        yield put({ type: 'updateUser', user })
        yield put({ type: 'loginSuccess' })
        yield put(StackActions.reset({
          index: 0,
          key: null,
          actions: [NavigationActions.navigate({ routeName: user.isLanded ? 'Main' : 'RecommendUser'})] 
        }))
        if (callback) {
          yield call(callback)
        }
      } catch (error) {
        if (onError) {
          yield call(onError)
        }
      }
    },
    *detail(action: any, { call, put, select }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      if (currentUser) {
        const data = yield call(userDetail, currentUser._id)
        yield put({ type: 'updateDetail', detail: data })
        yield put({ type: 'list.agree/agreeCount', userId: currentUser._id})
      }
    },
    userWatcher: [function* ({ take, put }: any) {
      while (true) {
        yield take('updateUser')
        yield put({ type: 'detail' })
      }
    }, { type: 'watcher' }],
    *logout(action: any, { put, call }: any) {
      yield call(AsyncStorage.clear)
      axios.defaults.headers.common.token = null
      yield put({ type: 'updateUser', user: null })
      yield put(StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: 'Login' })],
      })
      )
    },
  
    *wechatLogin({ appId, appSecret, code, callback }: any, { call, put }: any) {
      const { access_token, openid } = yield call(wechatAccessToken, appId, appSecret, code)
      const { token, user, isLanded } = yield call(wechatLogin, access_token, openid)
      yield call(AsyncStorage.setItem, 'token', token)
      axios.defaults.headers.common.token = token
      yield put({ type: 'updateState', payload: { token, loading: false } })
      yield put({ type: 'updateUser', user })
      yield put({ type: 'loginSuccess' })
      yield put(StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: user.isLanded ? 'Main' : 'RecommendUser' })]
     }))
      if (callback) {
        yield call(callback)
      }
    },
    loginSuccess() {
      //placeholder
    },
  },
  subscriptions: {
    setup({ dispatch }: any) {
      dispatch({ type: 'loadStorage' })
    },
  },
}
