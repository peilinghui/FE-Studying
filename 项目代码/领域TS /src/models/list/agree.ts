import { getReceivedAgrees } from '../../services/user'
import { action, flatten, groupBy, } from "../../utils/functions";
import { DeviceEventEmitter } from 'react-native'
import { combineAtrr } from "../../utils/functions";

export default {
	namespace: 'list.agree',
	state: {
		list: [],//用于本地缓存数据
		ListData: [],//网络缓存数据
		space: 10,
		offset: 0,
		hasNext: true,
		refreshing: false,
		loading: false,
	},
	reducers: {
		save(state: any, { payload }: any) {
			return { ...state, ...payload };
		}
	},
	effects: {
		*agreeCount({ userId }: any, { call, put, select }: any) {
			const { space, list, } = yield select((state: any) => state['list.agree']);
			const fetchList = yield call(getReceivedAgrees, userId, 0, 40);
			
			const data = combineAtrr(list, fetchList);
			const newAgree = data.filter((item: any) => item.readText === '新的');
			console.log('====newAgree====', newAgree);
			DeviceEventEmitter.emit('收到新赞同', { agreeCount: newAgree.length });
		},
		*fetch({ userId }: any, { call, put, select }: any) {
			const { offset, space, list, } = yield select((state: any) => state['list.agree']);
			yield  put(action('save', { loading: true }));
			const fetchList = yield call(getReceivedAgrees, userId, 0, space);
			if (fetchList.length == 0 || fetchList.length < space) {
				yield put(action('save', { hasNext: false }));
			}	
	
			yield put(action('save', { ListData: fetchList, loading: false, offset: space, refreshing: false }));	
		},
		
		*next({ userId }: any, { call, put, select }: any) {
			const { list, ListData, offset, space } = yield select((state: any) => state['list.agree']);
			yield  put(action('save', { loading: true }));
			const fetchList = yield call(getReceivedAgrees, userId, offset, space);
			if (fetchList.length == 0 || fetchList.length > space) {
				yield put(action('save', { hasNext: false }));
			}	
			yield put(action('save', { ListData: ListData.concat(fetchList), loading: false, offset: offset + space }));		
		},
		
		*refresh({ userId }: any, { call, put, select }: any) {
			yield put(action('save', {
				list: [],
				space: 10,
				offset: 0,
				hasNext: true,
				refreshing: true,
				loading: true,
			}));
			yield  put({ type: 'fetch', userId: userId });
		},

		*clear(_: any, { call, put, select }: any) {
			const { ListData } = yield select((state: any) => state['list.agree']);
			const tagList = makeUnReadTag(ListData);
			
			yield put(action('save', {
				ListData: [],// 清空网络缓存数据
				list: tagList, // 储存本地数据
				space: 10,
				offset: 0,
				hasNext: true,
				refreshing: false,
				loading: false,
			}));
		},

		*clearAll(_: any, { call, put, select }: any) {
			yield put(action('save', {
				list: [],
				ListData: [],
				space: 10,
				offset: 0,
				hasNext: true,
				refreshing: false,
				loading: false,
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
			item.readText = '最新的'
		}
		item.read = 1
	})
	arr.map((item, index) => {
		if (item.read !== 1) {
			new Error('没有全部标记完')
		}
	})
	console.log('makeUnReadTag', arr);
	return arr;
}
