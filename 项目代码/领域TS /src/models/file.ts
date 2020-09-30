import { qiniuToken, upload, create } from '../services/file'

export default {
  namespace: 'file',
  state: {
    qiniuToken: '',
  },
  reducers: {
    updateQiniuToken(state: any, { token }: any) {
      return { ...state, qiniuToken: token }
    },
  },
  effects: {
    *qiniuToken(action: any, { call, put }: any) {
      const { token } = yield call(qiniuToken)
      yield put({ type: 'updateQiniuToken', token })
    },
    *upload({ files, callbackAction, callback, onError }: any, { call, select, put, take }: any) {
      let [token, currentUser] = yield select(({ file: { qiniuToken }, auth: { user } }: any) => [qiniuToken, user])
      if (token === '') {
        yield put({ type: 'qiniuToken' })
        const { token: newToken } = yield take('updateQiniuToken')
        token = newToken
      }
      try {
        const urls = []
        for (let file of files) {
          const { hash } = yield call(upload, token, file)
          const url = `https://storage.public.atrealm.com/${hash}`
          const { mime } = file
          const response = yield call(create, url, mime, hash, currentUser._id)
          urls.push({ file, url, response })
        }
        yield put({ type: 'file/uploadSuccess', urls })
        if (callbackAction) {
          yield put({ ...callbackAction, urls })
        }
        if (callback) {
          yield call(callback, urls)
        }
      } catch (error) {
        yield call(onError, error);
      }
    },
  },
  subscriptions: {},
}
