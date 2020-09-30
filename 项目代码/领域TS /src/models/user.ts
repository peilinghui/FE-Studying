import {
  detail as userDetail,
  commonFriends,
  getFigures,
  getCards,
  addCard,
  addFigure,
  removeCard, agreeFigure, removeFigure,
  updateProfile,
  updateAvatar,
  addRelation,
  removeRelation,
  isLanded,
  getFeatures,
  updateCover,
} from '../services/user'
import { mostActiveList } from '../services/realm'
import { weChatPayWithdraw } from '../services/feature';
import {action} from "../utils/functions";

export default {
  namespace: 'user',
  state: {
    userId: null,
    detail: {},
    commonFriends: {},
    figures: [],
    cards: [],
    mostActiveRealms: [],
    features: [],
  },
  reducers: {
    updateDetail(state: any, { detail }: any) {
      return { ...state, detail }
    },
    updateCommonFriends(state: any, { data }: any) {
      return { ...state, commonFriends: data }
    },
    updateFigures(state: any, { data }: any) {
      return { ...state, figures: data }
    },
    updateCards(state: any, { data }: any) {
      return { ...state, cards: data }
    },
    updateUserId(state: any, { userId }: any) {
      return { ...state, userId }
    },
    updateMostActiveRealms(state: any, { data }: any) {
      return { ...state, mostActiveRealms: data }
    },
    updateComputed(state: any, { data }: any) {
      return { ...state, computed: data };
    },
    save(state: any, { payload }: any) {
      return { ...state, ...payload };
    }
  },
  effects: {
    *detail({ userId }: any, { call, put, select }: any) {
      const [currentUser, prevUserId] = yield select(
        ({ auth: { user }, user: { userId } }: any) => [user, userId]
      )
      if (prevUserId !== null && prevUserId !== userId) {
        yield put({ type: 'updateDetail', detail: {} })
        yield put({ type: 'updateCommonFriends', data: {} })
        yield put({ type: 'updateFigures', data: [] })
        yield put({ type: 'updateCards', data: [] })
      }
      yield put({ type: 'commonFriends', userId })
      yield put({ type: 'figures', userId })
      yield put({ type: 'cards', userId })
      yield put({ type: 'getFeatures' })
      yield put({ type: 'mostActiveRealms', userId })
      const data = yield call(userDetail, userId, currentUser._id)
      yield put({ type: 'updateDetail', detail: data })
      yield put({ type: 'updateUserId', userId })
    },
    *commonFriends({ userId }: any, { call, put, select }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      const data = yield call(commonFriends, currentUser._id, userId)
      yield put({ type: 'updateCommonFriends', data })
    },
    *figures({ userId }: any, { call, put }: any) {
      const data = yield call(getFigures, userId)
      yield put({ type: 'updateFigures', data })
    },
    *cards({ userId }: any, { call, put }: any) {
      const data = yield call(getCards, userId)
      yield put({ type: 'updateCards', data })
    },
    //获取社交卡片
    *getFeatures(_: any, { call, put }: any) {
      const data = yield call(getFeatures, )
      yield  put(action('save', { features: data }));
      },
    *mostActiveRealms({ userId }: any, { call, put }: any) {
      const data = yield call(mostActiveList, userId)
      yield put({ type: 'updateMostActiveRealms', data })
    },
    *addCard({ cardType, connectionId,callBack }: any, { call, put, select }: any) {
      try{
        const currentUser = yield select(({ auth: { user } }: any) => user)
        yield call(addCard, currentUser._id, cardType, connectionId)
        callBack&&callBack(true)
        yield put({ type: 'cards', userId: currentUser._id })
      }catch (e) {
        console.log(e)
        callBack&&callBack(false)
      }
    },
    *weChatPayWithdraw({ textContent, amount, callBack }: any, { call, put, select }: any) {
      try {
        const currentUser = yield select(({ auth: { user } }: any) => user)
        const data = yield call(weChatPayWithdraw, currentUser._id, textContent, amount)
        callBack && callBack(true)
      } catch (e) {
        callBack && callBack(false)
      }
    },
    *addFigure({ userId, figure }: any, { call, put }: any) {
      yield call(addFigure, userId, figure)
      yield put({ type: 'figures', userId })
    },
    *isLanded({ userId }: any, { call, put }: any) {
      const data = yield call(isLanded, userId)
      yield put({ type: 'updateisLanded', data })
    },
    *removeCard({ cardId }: any, { call, put, select }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      yield call(removeCard, currentUser._id, cardId)
      yield put({ type: 'cards', userId: currentUser._id })
    },
    *agreeFigure({ userId, figure, callback }: any, { call, put, select }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      yield call(agreeFigure, userId, figure, currentUser._id)
      yield put({ type: 'figures', userId })
      if (callback) {
        yield call(callback)
      }
    },
    *removeFigure({ figure }: any, { call, put, select }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      yield call(removeFigure, currentUser._id, figure)
      yield put({ type: 'figures', userId: currentUser._id })
    },
    *updateProfile({ profile }: any, { call, put, select }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      yield call(updateProfile, currentUser._id, profile)
      yield put({ type: 'auth/detail' })
    },
    *updateAvatar({ image }: any, { put, take, call, select }: any) {
      yield put({ type: 'file/upload', files: [image] })
      const { urls: [url] } = yield take('file/uploadSuccess')
      const { response: { _id } } = url
      const currentUser = yield select(({ auth: { user } }: any) => user)
      yield call(updateAvatar, currentUser._id, _id)
      yield put({ type: 'auth/detail' })
    },
    *updateProfileCover({ image }: any, { put, take, call, select }: any) {
      yield put({ type: 'file/upload', files: [image] })
      const { urls: [url] } = yield take('file/uploadSuccess')
      const { response: { _id } } = url
      const currentUser = yield select(({ auth: { user } }: any) => user)
      yield call(updateCover, currentUser._id, _id)
      yield put({ type: 'auth/detail' })
    },
    *follow({ userId }: any, { call, put, select }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      yield call(addRelation, currentUser._id, userId, 'followee')
      const data = yield call(userDetail, userId, currentUser._id)
      yield put({ type: 'updateDetail', detail: data })
    },
    *unfollow({ userId }: any, { call, put, select }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      yield call(removeRelation, currentUser._id, userId, 'followee')
      const data = yield call(userDetail, userId, currentUser._id)
      yield put({ type: 'updateDetail', detail: data })
    },
  },
  subscriptions: {},
}
