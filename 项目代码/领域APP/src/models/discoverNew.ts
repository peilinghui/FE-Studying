import { getTopics, addViewedTopics, clearViewedTopics } from "../services/discover"


export default {
    namespace: 'discover',
    state: {
        recommendedTopics: [],
        recommendedTopicsId:[]
    },
    reducers: {
        updateData(state: any, { data }: any) {
            return { ...state, ...data }
        }
    },
    effects: {
        *fresh(action: any, { call, put, select, all }: any) {
            
            const currentUser = yield select(({ auth: { user } }: any) => (user))
            yield call(clearViewedTopics, currentUser._id)
            const recommendedTopics = yield call(getTopics, currentUser._id, 7)
            const recommendedTopicsId = recommendedTopics.map((data: any) => {
                return data._id
            });
 
            yield put({ type: "updateData", data: { recommendedTopics: recommendedTopics, recommendedTopicsId } })
        },

        *refresh({ callback }: any, { call, select, put, all }: any) {
            const currentUser = yield select(({ auth: { user } }: any) => (user))
        
            const { recommendedTopicsId } = yield select(state => state['discover']);
            let recommendedTopics=[]
            yield call(addViewedTopics, currentUser._id, recommendedTopicsId)
            recommendedTopics = yield call(getTopics, currentUser._id, 7)

            if (recommendedTopics.length === 0) {
                yield call(clearViewedTopics, currentUser._id)
                recommendedTopics = yield call(getTopics, currentUser._id, 7)
            }

            const recommendedTopicsNewId = recommendedTopics.map((data: any) => {
                return data._id
            });

            yield put({ type: "updateData", data: { recommendedTopics: recommendedTopics, recommendedTopicsId: recommendedTopicsNewId } })
            if (callback) {
                yield call(callback)
            }
        },

        userWatcher: [function* ({ take, put }: any) {
            while (true) {
                yield take('auth/loginSuccess')
                yield put({ type: 'fresh' })
            }
        }, { type: 'watcher' }],
    },
}