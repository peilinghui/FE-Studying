import { detail as realmDetail, 
  hexCode as realmHexCode, 
  create, 
  addMember, 
  sendJoinRequest, 
  processJoinRequest,
  removeMember, updateRealm, updateCover, updateMembership } from '../services/realm'
import ReadState from '../services/read-state'
import _ from 'lodash'
import KVDB from '../services/kvdb'
import { StackActions, NavigationActions } from 'react-navigation'

export default {
  namespace: 'realm',
  state: {
    detail: {},
    hexCode: 'ffffff',
  },
  reducers: {
    updateDetail(state: any, { detail }: any) {
      return { ...state, detail }
    },
    updateDetailHexCode(state: any, { hexCode }: any) {
      return { ...state, hexCode }
    },
  },
  effects: {
    *read({ item }: any, { call, select, put }: any) {
      if (!item.isRead) {
        yield call(ReadState.setReadState, item._id, Date.now())
        const realms = yield select(({ 'list.realm': { list } }: any) => list)
        Object.assign(_.find(realms, { _id: item._id }), { isRead: true })
        yield put({ type: 'updateList', list: realms })
      }
    },
    *detail({ realmId }: any, { call, put, select }: any) {
      const [currentUser, { _id: prevRealmId }] = yield select(
        ({ auth: { user }, realm: { detail } }: any) => [user, detail]
      )
      if (prevRealmId !== null && prevRealmId !== realmId) {
        yield put({ type: 'updateDetail', detail: {} })
        yield put({ type: 'updateDetailHexCode', hexCode: 'ffffff' })
      }
      const detail = yield call(realmDetail, realmId, currentUser._id)
      yield put({ type: 'updateDetail', detail })
      yield put({ type: 'loadHexCode', realm: detail })
    },
    *loadHexCode({ realm }: any, { call, put }: any) {
      let hexCode = yield call(KVDB.get, `Realms:${realm._id}:backgroundHexCode`)
      if (!hexCode) {
        const { RGB } = yield call(realmHexCode, realm.coverImage.url)
        hexCode = RGB.substr(2)
        yield call(KVDB.put, `Realms:${realm._id}:backgroundHexCode`, hexCode, 3600 * 48)
      }
      yield put({ type: 'updateDetailHexCode', hexCode })
    },
    *create({ title, intro, creatorIntro, coverImageFileId, request, isPrivate, price, realmType, callback }: any, { call, put, select }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      const response = yield call(create, {
        title,
        intro,
        creatorIntro,
        coverImageFileId,
        membership: request ? 'request' : 'open',
        isPrivate,
        userId: currentUser._id,
        price,
        realmType,
      })
      yield put({ type: 'updateDetail', detail: response })
      yield put(StackActions.replace({
        routeName: 'RealmCreateFinish',
        params: { realmId: response._id }
      }))
      if (callback) {
        yield call(callback)
      }
    },
    *updateRealm({ realmId, title, intro, creatorIntro, fileId, request, isPrivate, callback }: any, { call, put, select }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      const response = yield call(updateRealm, {
        realmId,
        title,
        intro,
        creatorIntro,
        isPrivate,
      })
      const response1 = yield call(updateCover,{
        realmId,
        fileId
      })
      const response2 = yield call(updateMembership, {
        realmId,
        membership: request ? 'request' : 'open',
      })
   
      yield put({ type: 'updateDetail', detail: response })
      yield put({ type: 'updateDetail', detail: response1 })
      yield put({ type: 'updateDetail', detail: response2 })
    
      if (callback) {
        yield call(callback)
      }
    },
    *requestJoin({ realmId, callback }: any, { call, select }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      yield call(sendJoinRequest, realmId, currentUser._id)
      if (callback) {
        yield call(callback)
      }
    },
    *addMember({ realmId, callback }: any, { call, select }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      yield call(addMember, realmId, currentUser._id)
      if (callback) {
        yield call(callback)
      }
    },
    //一次性加入多个领域
	  *addMembers({ realmIds, callback }: any, { call, select }: any) {
		  const currentUser = yield select(({ auth: { user } }: any) => user)
		
		  for (let i=0;i<=realmIds.length-1;i++){
			  yield call(addMember, realmIds[i],currentUser._id);
      }
      
		  if (callback) {
			  yield call(callback)
		  }
	  },
    *processJoinRequest({ notificationId, decision, callback }: any, { call, select, put }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      yield call(processJoinRequest, notificationId, currentUser._id, decision)
      if (callback) {
        yield call(callback)
      }
    },
    *removeMember({ realmId, callback }: any, { call, select }: any) {
      const currentUser = yield select(({ auth: { user } }: any) => user)
      yield call(removeMember, realmId, currentUser._id)
      if (callback) {
        yield call(callback)
      }
    },
    *createdNewRealm({ realmId }: any, { put }: any) {
      yield put(StackActions.reset({
        index: 0,
        key: null,
        actions: [
          NavigationActions.navigate({
            routeName: 'Main'
          })
        ]
      }))
      yield put(NavigationActions.navigate({
        routeName: 'RealmViewer',
        params: { realmId }
      }))
    }
  },
  subscriptions: {},
}
