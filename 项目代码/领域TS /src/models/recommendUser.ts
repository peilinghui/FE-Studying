import { getRecommendUser } from '../services/recommendUser'
import _ from "lodash"

export default {
    namespace: 'recommendUser',
    state: {
        recommendedUsers: [],
    },
    reducers: {
        updateData(state: any, { data }: any) {
            return { ...state, ...data }
        }
    },
    effects: {
        *refresh(action: any, { call, put, select, all }: any) {
            const currentUser = yield select(({ auth: { user } }: any) => (user))
            const recommendedUsers = yield call(getRecommendUser, currentUser._id)
            yield put({ type: "updateData", data: { recommendedUsers } })
        },
        userWatcher: [function* ({ take, put }: any) {
            while (true) {
                yield take('auth/loginSuccess')
                yield put({ type: 'refresh' })
            }
        }, { type: 'watcher' }],
    },
}
