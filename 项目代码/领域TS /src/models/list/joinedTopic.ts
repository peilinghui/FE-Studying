import modelExtend from 'dva-model-extend'
import list from './list'
import { joinedTopics as getJoinedTopics } from "../../services/topic"

export default modelExtend(list, {
  namespace: 'list.joinedTopic',
  effects: {
    *fetch({ action = 'append', realmId }: any, { call, put, select }: any) {
      const [currentUser, cursorAt, limit] = yield select(
        ({
          auth: { user },
          'list.joinedTopic': { cursorAt, limit },
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
        const list = yield call(getJoinedTopics, currentUser._id, cursorAt, limit)
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
