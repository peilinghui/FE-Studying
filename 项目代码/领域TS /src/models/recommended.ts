import { getRealms, getUsers } from "../services/discover"


export default {
  namespace: 'recommended',
  state: {
    latestRealms: [],
    recommendedUsers: [],
    recommendedRealms: []
  },
  reducers: {
    updateData(state: any, { data }: any) {
      return { ...state, ...data }
    }
  },
  effects: {
    *refresh(action: any, { call, put, select, all }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => (user))
      const [recommendedRealms, recommendedUsers] = yield all([
        call(getRealms, currentUser._id),
        call(getUsers, currentUser._id),
      ])
      yield put({ type: "updateData", data: { recommendedRealms, recommendedUsers } })
    },
    *refreshUsers({ callback }: any, { call, select, put }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => (user))
      const recommendedUsers = yield call(getUsers, currentUser._id)
      yield put({ type: "updateData", data: { recommendedUsers } })
      if (callback) {
        yield call(callback)
      }
    },
    userWatcher: [function* ({ take, put }: any) {
      while (true) {
        yield take('auth/loginSuccess')
        yield put({ type: 'refresh' })
      }
    }, { type: 'watcher' }],
  },
}
