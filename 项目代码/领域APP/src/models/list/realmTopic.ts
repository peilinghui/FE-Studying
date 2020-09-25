import modelExtend from 'dva-model-extend'
import list from './list'
import { realmTopics as getRealmTopics } from "../../services/topic"

export default modelExtend(list, {
  namespace: 'list.realmTopic',
  state: {
    realmId: null,
  },
  reducers: {
    updateRealmId(state: any, { realmId }: any) {
      return { ...state, realmId }
    }
  },
  effects: {
    *fetch({ action = 'append', realmId }: any, { call, put, select }: any) {
      const [currentUser, cursorAt, limit, prevRealmId] = yield select(
        ({
           auth: { user },
           'list.realmTopic': { cursorAt, limit, realmId },
         }: any) => ([
          user,
          cursorAt,
          limit,
          realmId
        ]))
      if (prevRealmId !== null && prevRealmId !== realmId) {
        yield put({ type: 'update', list: [] })
      }
      const list = yield select(({ 'list.realmTopic': { list } }: any) => list)
      if (currentUser && list.length === 0) {
        const list = yield call(getRealmTopics, realmId, currentUser._id, cursorAt, limit)
        yield put({ type: action, list })
        yield put({ type: 'updateRealmId', realmId })
      }
    },
  },
})
