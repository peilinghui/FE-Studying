import axios from 'axios'
import _ from 'lodash'
import ReadState from './read-state'
import KVDB from './kvdb';

export async function processJoinRequest(notificationId: string, userId: string, decision: string) {
  const { data } = await axios.post(`/notifications/${notificationId}/decision`, {
    userId, decision
  })
  return data
}

//切换推送状态
export async function setNotification(realmId: string, currentUserId: string,status:boolean) {
  const { data } = await axios.put(`/realms/${realmId}/notification`, {
      userId: currentUserId,
      status: status?1:0,
  })
  return data
}

//是否开启了推送
export async function getUserSettings(realmId: string, currentUserId: string) {
  const { data } = await axios.get(`/realms/${realmId}/user_settings`, {
    params:{
      userId:currentUserId,
    }
  })
  return data
}

export async function search(params: {}, cursorAt?: string, limit: number = 40) {
  const { data } = await axios.get('/realms', {
    params: {
      ...params,
      cursorKey: 'lastTopicAt',
      cursorOperator: 'lessThan',
      cursorValue: cursorAt,
      limit,
      sortKey: 'lastTopicAt',
      sortMode: 'descending',
    }
  })
  return data
}

export function listByCategory(category: string, keyword: string, cursorAt?: string) {
  const params: any = { category, keyword }
  return search(params, cursorAt)
}

export async function sendJoinRequest(realmId: string, currentUserId: string) {
  const { data } = await axios.post(`/realms/${realmId}/join_request`, {
    userId: currentUserId,
  })
  return data
}

export async function getMembers(realmId: string, limit: number = 40) {
  const { data } = await axios.get(`/realms/${realmId}/members`, {
    params: { limit }
  })
  return data
}

export async function getRealmMembers(realmId: string, offset: number) {
  const { data } = await axios.get(`/realms/${realmId}/members`, {
    params: { 
      extended: 1, 
      offset: offset, }
  })
  return data
}

export async function addMember(realmId: string, currentUserId: string) {
  const { data } = await axios.post(`/realms/${realmId}/members`, {
    userId: currentUserId
  })
  return data
}

//退出领域
export async function removeMember(realmId: string, currentUserId: string) {
  const { data } = await axios.delete(`/realms/${realmId}/members`, {
    params:{
      userId: currentUserId
    }
  })
  return data
}

//创建领域
export async function create({ title, intro, creatorIntro, coverImageFileId, membership, isPrivate, price, realmType, userId }: any) {
  const { data } = await axios.post('/realms', {
    type: realmType,
    membership,
    title,
    intro,
    creatorIntro,
    coverImageFileId,
    isPrivate,
    userId,
    price
  })
  return data
}

//修改领域
export async function updateRealm({ realmId, title, intro, creatorIntro, isPrivate}: any) {
  const { data } = await axios.put(`/realms/${realmId}`, {
    title,
    intro,
    creatorIntro,
    isPrivate,
  })
  return data
}

//修改领域封面
export async function updateCover({ realmId, fileId }: any) {
  const { data } = await axios.put(`/realms/${realmId}/cover`, {
    fileId
  })
  return data
}

//修改邀请制
export async function updateMembership({ realmId, membership }: any) {
  const { data } = await axios.put(`/realms/${realmId}/membership`, {
    membership
  })
  return data
}

export async function list(userId: number, cursorAt: string | null | undefined, limit: number) {
  const { data } = await axios.get(`/users/${userId}/realms`, {
    params: {
      cursorKey: 'lastTopicAt',
      cursorOperator: 'lessThan',
      cursorValue: cursorAt,
      limit,
      getInfoForUserId: userId,
      sortKey: 'lastTopicAt',
      sortMode: 'descending',
      myView: 1
    }
  })
  return data
}

export async function mostActiveList(userId: string) {
  const { data } = await axios.get(`/users/${userId}/realms`, {
    params: { mostActive: 1 }
  })
  return data
}

export async function loadReadState(realms: any[]) {
  return Promise.all(_.map(realms, async realm => {
    realm.isRead = await ReadState.isRead(realm._id, Date.parse(realm.lastTopicAt))
    return realm
  }))
}

export async function detail(realmId: string, currentUserId: string) {
  const { data } = await axios.get(`/realms/${realmId}`, {
    params: {
      getInfoForUserId: currentUserId
    }
  })
  return data
}

export async function hexCode(coverImageUrl: string) {
  const { data } = await axios.get(`${coverImageUrl}?imageAve`)
  return data
}
