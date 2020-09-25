
import modelExtend from 'dva-model-extend'
import { action } from "../../utils/functions";
import list from './list'
import { getTransactions } from "../../services/user";

export default modelExtend(list, {
    namespace: 'list.getTransactions',
    effects: {
        *fetch({ action = 'append', topicId, callback }: any, { call, put, select }: any) {
            let [currentUser, cursorAt, limit, prevTopicId] = yield select(
                ({
                    auth: { user },
                    'list.getTransactions': { cursorAt, limit },
                }: any) => ([
                    user,
                    cursorAt,
                    limit,
                ]))
            if (currentUser) {
                const list = yield call(getTransactions, currentUser._id, cursorAt, limit)
                yield put({ type: action, list })
                if (callback) {
                    yield call(callback, list.length)
                }
            }
        },
        *prependMessage({ message, callback }: any, { put, call, select }: any) {
            const list = yield select(({ 'list.getTransactions': { list } }: any) => list)
            yield put({ type: 'update', list: list.concat([message]) })
            if (callback) {
                yield call(callback)
            }
        }
    },
})


