import { getRecommendationTopic } from '../services/story'
import { action, groupBy } from "../utils/functions";


export default {
	namespace: 'story',
	state: {
		storys: [],
	},
	reducers: {
		save(state: any, { payload }: any) {
			return { ...state, ...payload };
		}
	},
	effects: {
		*fetch(_: any, { call, put, select }: any) {
			const { user } = yield select((state: { auth: any; }) => state.auth);
			const data = yield call(getRecommendationTopic, user._id,);
			if (data && data.length > 0) {
				const sorted = groupBy(data, function(item: any) {
					return [item.creator._id];
				});
				yield put(action('save', { storys: sorted }));
			}
			
		},
		
		userWatcher: [function*({ take, put }: any) {
			while (true) {
				yield take('auth/loginSuccess')
				yield put({ type: 'fetch' })
			}
		}, { type: 'watcher' }],
	},
}
