import modelExtend from 'dva-model-extend'
import list from './list'
import { list as realmList, loadReadState } from "../../services/realm"


export default modelExtend(list, {
  namespace: 'list.realm',
  state: {
    cursorKey: 'lastTopicAt'
  },
  effects: {
    *fetch({ action = 'append' }: any, { call, put, select }: any) {
      const [currentUser, cursorAt, limit] = yield select(
        ({
          auth: { user },
          'list.realm': { cursorAt, limit },
        }: any) => ([
          user,
          cursorAt,
          limit,
        ]))
      if (currentUser) {
        if (action === 'append') {
          yield put({ type: 'updateLoading', loading: true })
        } else {
          yield put({ type: 'updateRefreshing', refreshing: true })
        }
        const data = yield call(realmList, currentUser._id, cursorAt, limit)
        const list = yield call(loadReadState, data)
        yield put({ type: action, list })
        if (action === 'append') {
          yield put({ type: 'updateLoading', loading: false })
        } else {
          yield put({ type: 'updateRefreshing', refreshing: false })
        }
      }
    },
    userWatcher: [function* ({ take, put }: any) {
      while (true) {
        yield take('auth/loginSuccess')
        yield put({ type: 'refresh' })
      }
    }, { type: 'watcher' }],
  },
})
