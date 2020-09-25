import { action, flatten, groupBy, } from "../../utils/functions";
import { getNotifications } from "../../services/user";


export default {
	namespace: 'list.notification',
	state: {
		list: [],//用于本地缓存数据
		ListData: [],//网络缓存数据
		cursorAt:null,
		hasNext: true,
		refreshing: false,
		loading: false,
		limit:40,
	},
	reducers: {
		save(state: any, { payload }: any) {
			return { ...state, ...payload };
		}
	},
	effects: {
		*fetch({ userId }: any, { call, put, select }: any) {
			const {  cursorAt,limit } = yield select((state: any) => state['list.notification']);
			yield  put(action('save', { loading: true }));
			const fetchList = yield call(getNotifications,userId, null, limit);
			if (fetchList.length == 0 || fetchList.length === limit) {
				yield put(action('save', { hasNext: false }));
			}

			yield put(action('save', { ListData: fetchList, loading: false, cursorAt: fetchList[fetchList.length-1].createdAt, refreshing: false }));
		},
		
		*next({ userId }: any, { call, put, select }: any) {
			const {  ListData,  cursorAt, limit } = yield select((state: any) => state['list.notification']);
			yield  put(action('save', { loading: true }));
			const fetchList = yield call(getNotifications, userId, cursorAt, limit);
			if (fetchList.length == 0 || fetchList.length === limit) {
				yield put(action('save', { hasNext: false }));
			}
			const list = ListData.concat(fetchList);
			
			yield put(action('save', { ListData: list, loading: false, cursorAt: fetchList[fetchList.length - 1].createdAt }));
			
		},
		
		*refresh({ userId }: any, { call, put, select }: any) {
			yield put(action('save', {
				list: [],
				cursorAt:null,
				hasNext: true,
				refreshing: false,
				loading: false,
				limit:40,
			}));
			yield  put({ type: 'fetch', userId: userId });
		},
		*clear(_: any, { call, put, select }: any) {
			const { ListData } = yield select((state: any) => state['list.notification']);
			const tagList = makeUnReadTag(ListData);
			
			yield put(action('save', {
				ListData: [],// 清空网络缓存数据
				list: tagList, // 储存本地数据
				cursorAt:null,
				hasNext: true,
				refreshing: false,
				loading: false,
				limit:40,
			}));
		},
		*clearAll(_: any, { call, put, select }: any) {
			yield put(action('save', {
				list: [],
				ListData: [],
				cursorAt:null,
				hasNext: true,
				refreshing: false,
				loading: false,
				limit:40,
			}));
		}
		
	},
}

//标记 read 的数据全部为已读，并对数据进行分组
function makeUnReadTag(arr: Array<any>) {
	arr.map((item, index) => {
		if (index === 0) {
			item.readText = '从前的'
		} else {
			item.readText = ''
		}
		item.read = 1
	})
	arr.map((item, index) => {
		if (item.read !== 1) {
			new Error('没有全部标记完')
		}
	})
	return arr;
}


